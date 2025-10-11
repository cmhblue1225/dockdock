import { getSupabaseAdmin } from './supabase.service';
import type { User } from '@supabase/supabase-js';

/**
 * 인증 서비스
 *
 * Supabase Admin Client를 사용하여 인증 관련 비즈니스 로직 처리
 * - 토큰 검증
 * - 사용자 조회
 * - 프로필 생성
 * - iOS용 소셜 로그인 토큰 검증
 */
export class AuthService {
  private supabaseAdmin = getSupabaseAdmin();

  /**
   * JWT 토큰 검증 및 사용자 조회
   *
   * @param accessToken - Supabase JWT access token
   * @returns 사용자 정보 또는 null
   */
  async verifyToken(accessToken: string): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(accessToken);

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * 사용자 ID로 프로필 조회
   *
   * @param userId - 사용자 ID
   * @returns 프로필 정보
   */
  async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`프로필 조회 실패: ${error.message}`);
    }

    return data;
  }

  /**
   * 프로필 생성 또는 업데이트
   *
   * 회원가입 시 자동으로 프로필 생성
   * Supabase 트리거가 있으면 자동 생성되지만, 없는 경우를 대비한 수동 생성
   *
   * @param userId - 사용자 ID
   * @param email - 이메일
   * @param displayName - 표시 이름
   */
  async upsertProfile(userId: string, email: string, displayName?: string) {
    const { data, error } = await this.supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        display_name: displayName || email.split('@')[0],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`프로필 생성/업데이트 실패: ${error.message}`);
    }

    return data;
  }

  /**
   * 소셜 로그인 토큰 검증 (iOS용)
   *
   * iOS 앱에서 Apple/Kakao Sign In SDK로 얻은 ID Token을 검증하고
   * Supabase 세션을 생성합니다.
   *
   * @param provider - 'apple' | 'kakao'
   * @param idToken - Provider에서 발급한 ID Token
   * @returns 세션 정보
   */
  async signInWithProviderToken(provider: 'apple' | 'kakao', idToken: string) {
    try {
      const { data, error } = await this.supabaseAdmin.auth.signInWithIdToken({
        provider,
        token: idToken,
      });

      if (error) {
        throw error;
      }

      // 프로필이 없으면 생성
      if (data.user) {
        try {
          await this.getUserProfile(data.user.id);
        } catch {
          // 프로필이 없으면 생성
          await this.upsertProfile(
            data.user.id,
            data.user.email || '',
            data.user.user_metadata?.display_name || data.user.user_metadata?.full_name
          );
        }
      }

      return data;
    } catch (error) {
      console.error('Social login error:', error);
      throw new Error('소셜 로그인에 실패했습니다');
    }
  }

  /**
   * 비밀번호 재설정 이메일 전송
   *
   * @param email - 사용자 이메일
   */
  async sendPasswordResetEmail(email: string) {
    const { error } = await this.supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      throw new Error(`비밀번호 재설정 이메일 전송 실패: ${error.message}`);
    }
  }
}

export const authService = new AuthService();
