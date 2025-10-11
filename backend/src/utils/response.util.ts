import { Response } from 'express';

/**
 * 표준 성공 응답
 */
export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

/**
 * 표준 에러 응답
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  details?: any,
  statusCode: number = 400
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}

/**
 * 페이지네이션 응답
 */
export function sendPaginated<T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  total: number
) {
  return res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

/**
 * 에러 코드 상수
 */
export const ErrorCodes = {
  // 인증 관련
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // 리소스 관련
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // 입력 검증
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // 서버 오류
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // 비즈니스 로직
  BOOK_NOT_FOUND: 'BOOK_NOT_FOUND',
  READING_BOOK_NOT_FOUND: 'READING_BOOK_NOT_FOUND',
  DUPLICATE_READING_BOOK: 'DUPLICATE_READING_BOOK',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
} as const;
