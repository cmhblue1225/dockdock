import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { sendSuccess, sendError, sendPaginated, ErrorCodes } from '../utils/response.util';
import { CreateReviewDto, UpdateReviewDto } from '../types/review.types';

/**
 * 리뷰 목록 조회
 * GET /api/v1/reviews?reading_book_id={id}&page=1&limit=50
 */
export async function getReviews(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const readingBookId = req.query.reading_book_id as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const { data, total } = await reviewService.getReviews(userId, readingBookId, limit, offset);

    return sendPaginated(res, data, page, limit, total);
  } catch (error) {
    console.error('getReviews error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '리뷰 목록 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 특정 리뷰 조회
 * GET /api/v1/reviews/:id
 */
export async function getReviewById(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;

    const review = await reviewService.getReviewById(id, userId);

    if (!review) {
      return sendError(res, ErrorCodes.NOT_FOUND, '리뷰를 찾을 수 없습니다', null, 404);
    }

    return sendSuccess(res, review);
  } catch (error) {
    console.error('getReviewById error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '리뷰 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 리뷰 생성
 * POST /api/v1/reviews
 */
export async function createReview(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const dto: CreateReviewDto = req.body;

    // 입력 검증
    if (!dto.reading_book_id || !dto.rating) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'reading_book_id와 rating은 필수입니다',
        null,
        400
      );
    }

    if (dto.rating < 1 || dto.rating > 5) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'rating은 1-5 사이의 값이어야 합니다',
        null,
        400
      );
    }

    const review = await reviewService.createReview(userId, dto);

    return sendSuccess(res, review, '리뷰가 생성되었습니다', 201);
  } catch (error) {
    console.error('createReview error:', error);

    if (error instanceof Error) {
      if (error.message.includes('권한이 없습니다')) {
        return sendError(res, ErrorCodes.FORBIDDEN, error.message, null, 403);
      }
      if (error.message.includes('이미')) {
        return sendError(res, ErrorCodes.DUPLICATE_ENTRY, error.message, null, 409);
      }
    }

    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '리뷰 생성에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 리뷰 업데이트
 * PATCH /api/v1/reviews/:id
 */
export async function updateReview(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;
    const dto: UpdateReviewDto = req.body;

    // rating 검증
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'rating은 1-5 사이의 값이어야 합니다',
        null,
        400
      );
    }

    const review = await reviewService.updateReview(id, userId, dto);

    return sendSuccess(res, review, '리뷰가 업데이트되었습니다');
  } catch (error) {
    console.error('updateReview error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '리뷰 업데이트에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 리뷰 삭제
 * DELETE /api/v1/reviews/:id
 */
export async function deleteReview(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;

    await reviewService.deleteReview(id, userId);

    return sendSuccess(res, null, '리뷰가 삭제되었습니다');
  } catch (error) {
    console.error('deleteReview error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '리뷰 삭제에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
