import { Request, Response } from 'express';
import { getSupabaseAdmin } from '../services/supabase.service';
import { authService } from '../services/auth.service';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * 인증 컨트롤러
 *
 * 사용자 인증 관련 API 엔드포인트
 * - 회원가입, 로그인, 로그아웃
 * - 토큰 검증 (iOS용)
 * - 현재 사용자 조회
 * - 소셜 로그인 (iOS용)
 */
export const authController = {
  /**
   * 회원가입
   *
   * POST /api/auth/signup
   */
  signUp: async (req: Request, res: Response) => {
    try {
      const { email, password, displayName } = req.body;

      // 유효성 검증
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: '이메일과 비밀번호를 입력해주세요',
          error: 'MISSING_FIELDS'
        });
      }

      // 비밀번호 길이 확인
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 6자 이상이어야 합니다',
          error: 'PASSWORD_TOO_SHORT'
        });
      }

      const supabase = getSupabaseAdmin();

      // 회원가입
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'SIGNUP_FAILED'
        });
      }

      // 프로필 생성 (Supabase 트리거가 없는 경우를 대비)
      if (data.user) {
        try {
          await authService.upsertProfile(
            data.user.id,
            email,
            displayName || email.split('@')[0]
          );
        } catch (error) {
          console.error('프로필 생성 실패:', error);
          // 프로필 생성 실패해도 회원가입은 성공으로 처리
        }
      }

      return res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다',
        data: {
          user: data.user,
          session: data.session
        }
      });
    } catch (error) {
      console.error('회원가입 오류:', error);
      return res.status(500).json({
        success: false,
        message: '회원가입 중 오류가 발생했습니다',
        error: 'SERVER_ERROR'
      });
    }
  },

  /**
   * 로그인
   *
   * POST /api/auth/login
   */
  signIn: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: '이메일과 비밀번호를 입력해주세요',
          error: 'MISSING_FIELDS'
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다',
          error: 'INVALID_CREDENTIALS'
        });
      }

      return res.status(200).json({
        success: true,
        message: '로그인에 성공했습니다',
        data: {
          user: data.user,
          session: data.session
        }
      });
    } catch (error) {
      console.error('로그인 오류:', error);
      return res.status(500).json({
        success: false,
        message: '로그인 중 오류가 발생했습니다',
        error: 'SERVER_ERROR'
      });
    }
  },

  /**
   * 로그아웃
   *
   * POST /api/auth/logout
   * Authorization: Bearer {token}
   */
  signOut: async (_req: Request, res: Response) => {
    try {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({
          success: false,
          message: '로그아웃에 실패했습니다',
          error: 'SIGNOUT_FAILED'
        });
      }

      return res.status(200).json({
        success: true,
        message: '로그아웃되었습니다'
      });
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return res.status(500).json({
        success: false,
        message: '로그아웃 중 오류가 발생했습니다',
        error: 'SERVER_ERROR'
      });
    }
  },

  /**
   * 토큰 검증 (iOS용)
   *
   * POST /api/auth/verify-token
   * Authorization: Bearer {token}
   *
   * iOS 앱에서 저장된 토큰이 유효한지 확인할 때 사용
   */
  verifyToken: async (req: AuthenticatedRequest, res: Response) => {
    try {
      // authMiddleware에서 이미 검증했으므로 user가 있으면 유효한 토큰
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '유효하지 않은 토큰입니다',
          error: 'INVALID_TOKEN'
        });
      }

      // 프로필 조회
      try {
        const profile = await authService.getUserProfile(user.id);

        return res.status(200).json({
          success: true,
          message: '유효한 토큰입니다',
          data: {
            user,
            profile
          }
        });
      } catch (error) {
        // 프로필이 없으면 생성
        const profile = await authService.upsertProfile(
          user.id,
          user.email || '',
          user.user_metadata?.display_name
        );

        return res.status(200).json({
          success: true,
          message: '유효한 토큰입니다',
          data: {
            user,
            profile
          }
        });
      }
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      return res.status(500).json({
        success: false,
        message: '토큰 검증 중 오류가 발생했습니다',
        error: 'SERVER_ERROR'
      });
    }
  },

  /**
   * 현재 사용자 조회
   *
   * GET /api/auth/me
   * Authorization: Bearer {token}
   */
  getCurrentUser: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다',
          error: 'UNAUTHORIZED'
        });
      }

      // 프로필 조회
      try {
        const profile = await authService.getUserProfile(user.id);

        return res.status(200).json({
          success: true,
          data: {
            user,
            profile
          }
        });
      } catch (error) {
        // 프로필이 없으면 생성
        const profile = await authService.upsertProfile(
          user.id,
          user.email || '',
          user.user_metadata?.display_name
        );

        return res.status(200).json({
          success: true,
          data: {
            user,
            profile
          }
        });
      }
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      return res.status(500).json({
        success: false,
        message: '사용자 정보 조회 중 오류가 발생했습니다',
        error: 'SERVER_ERROR'
      });
    }
  },

  /**
   * 비밀번호 재설정 요청
   *
   * POST /api/auth/reset-password
   */
  resetPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: '이메일을 입력해주세요',
          error: 'MISSING_EMAIL'
        });
      }

      await authService.sendPasswordResetEmail(email);

      return res.status(200).json({
        success: true,
        message: '비밀번호 재설정 이메일을 전송했습니다'
      });
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      return res.status(500).json({
        success: false,
        message: '비밀번호 재설정 요청 중 오류가 발생했습니다',
        error: 'SERVER_ERROR'
      });
    }
  },

  /**
   * 소셜 로그인 (iOS용)
   *
   * POST /api/auth/social-login
   *
   * iOS 앱에서 Apple/Kakao Sign In SDK로 얻은 ID Token을 검증하고
   * Supabase 세션을 생성합니다.
   *
   * Request Body:
   * {
   *   "provider": "apple" | "kakao",
   *   "idToken": "eyJhbGc..."
   * }
   */
  socialLogin: async (req: Request, res: Response) => {
    try {
      const { provider, idToken } = req.body;

      if (!provider || !idToken) {
        return res.status(400).json({
          success: false,
          message: 'provider와 idToken을 입력해주세요',
          error: 'MISSING_FIELDS'
        });
      }

      if (provider !== 'apple' && provider !== 'kakao') {
        return res.status(400).json({
          success: false,
          message: 'provider는 apple 또는 kakao여야 합니다',
          error: 'INVALID_PROVIDER'
        });
      }

      const data = await authService.signInWithProviderToken(provider, idToken);

      return res.status(200).json({
        success: true,
        message: '소셜 로그인에 성공했습니다',
        data: {
          user: data.user,
          session: data.session
        }
      });
    } catch (error) {
      console.error('소셜 로그인 오류:', error);
      return res.status(400).json({
        success: false,
        message: '소셜 로그인에 실패했습니다',
        error: 'SOCIAL_LOGIN_FAILED'
      });
    }
  },

  /**
   * 회원 탈퇴
   *
   * DELETE /api/auth/account
   * Authorization: Bearer {token}
   *
   * 사용자 계정과 관련된 모든 데이터를 삭제합니다.
   * - Supabase Auth 사용자 삭제
   * - profiles 테이블 CASCADE 삭제로 인한 관련 데이터 자동 삭제:
   *   - reading_books, reading_records, reading_photos, reading_quotes
   *   - book_reviews, user_preferences, recommendations
   *   - onboarding_reports
   */
  deleteAccount: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다',
          error: 'UNAUTHORIZED'
        });
      }

      const userId = user.id;

      // Supabase Admin으로 사용자 삭제
      // CASCADE 설정으로 인해 profiles와 관련된 모든 데이터가 자동으로 삭제됩니다
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        console.error('회원 탈퇴 실패:', error);
        return res.status(400).json({
          success: false,
          message: '회원 탈퇴에 실패했습니다',
          error: 'DELETE_ACCOUNT_FAILED'
        });
      }

      return res.status(200).json({
        success: true,
        message: '회원 탈퇴가 완료되었습니다. 그동안 독독을 이용해주셔서 감사합니다.'
      });
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      return res.status(500).json({
        success: false,
        message: '회원 탈퇴 중 오류가 발생했습니다',
        error: 'SERVER_ERROR'
      });
    }
  }
};
