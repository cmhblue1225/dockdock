import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { User } from '@supabase/supabase-js';

/**
 * 인증된 요청의 Request 타입 확장
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * JWT 토큰 검증 미들웨어
 *
 * Authorization 헤더에서 Bearer 토큰을 추출하고 검증합니다.
 * 검증 성공 시 req.user에 사용자 정보를 설정합니다.
 *
 * @example
 * // 라우트에서 사용
 * router.get('/protected', authMiddleware, (req, res) => {
 *   const user = (req as AuthenticatedRequest).user;
 *   res.json({ user });
 * });
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization 헤더 확인
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Bearer 토큰 추출
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: '잘못된 토큰 형식입니다. "Bearer {token}" 형식이어야 합니다',
        error: 'INVALID_TOKEN_FORMAT'
      });
      return;
    }

    const token = parts[1];

    // 토큰 검증
    const user = await authService.verifyToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        message: '유효하지 않거나 만료된 토큰입니다',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    // req에 사용자 정보 추가
    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * 선택적 인증 미들웨어
 *
 * 토큰이 있으면 검증하지만, 없어도 계속 진행합니다.
 * 공개 API에서 로그인 사용자에게 추가 정보를 제공할 때 사용합니다.
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const user = await authService.verifyToken(token);
        if (user) {
          (req as AuthenticatedRequest).user = user;
        }
      }
    }

    next();
  } catch (error) {
    // 에러가 있어도 계속 진행
    next();
  }
};

/**
 * authenticate 별칭 (다른 라우트와의 호환성을 위함)
 */
export const authenticate = authMiddleware;
