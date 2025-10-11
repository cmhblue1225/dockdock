import { Request, Response } from 'express';
import * as recommendationService from '../services/recommendation.service';
import { sendSuccess, sendError, ErrorCodes } from '../utils/response.util';

/**
 * 개인화 추천 가져오기
 * GET /api/v1/recommendations/personalized
 */
export async function getPersonalizedRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const forceRefresh = req.query.force_refresh === 'true';

    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId,
      limit,
      forceRefresh
    );

    return sendSuccess(res, recommendations, '개인화 추천을 성공적으로 가져왔습니다');
  } catch (error) {
    console.error('getPersonalizedRecommendations error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '추천 생성에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 트렌딩 책 가져오기
 * GET /api/v1/recommendations/trending
 */
export async function getTrendingBooks(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const trendingBooks = await recommendationService.getTrendingBooks(limit);

    return sendSuccess(res, trendingBooks, '인기 책을 성공적으로 가져왔습니다');
  } catch (error) {
    console.error('getTrendingBooks error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '인기 책 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 유사한 책 가져오기
 * GET /api/v1/recommendations/similar/:bookId
 */
export async function getSimilarBooks(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!bookId) {
      return sendError(res, ErrorCodes.VALIDATION_ERROR, '책 ID가 필요합니다', null, 400);
    }

    const similarBooks = await recommendationService.getSimilarBooks(bookId, limit);

    return sendSuccess(res, similarBooks, '유사한 책을 성공적으로 가져왔습니다');
  } catch (error) {
    console.error('getSimilarBooks error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '유사 책 추천에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 추천 새로고침
 * POST /api/v1/recommendations/refresh
 */
export async function refreshRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId,
      10,
      true // 강제 새로고침
    );

    return sendSuccess(res, recommendations, '추천이 갱신되었습니다');
  } catch (error) {
    console.error('refreshRecommendations error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '추천 갱신에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
