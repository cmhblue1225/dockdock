import { Router } from 'express';
import * as recommendationController from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * 개인화 추천 (인증 필요)
 * GET /api/v1/recommendations/personalized?limit=10&force_refresh=false
 */
router.get('/personalized', authenticate, recommendationController.getPersonalizedRecommendations);

/**
 * 트렌딩 책 (인증 불필요)
 * GET /api/v1/recommendations/trending?limit=10
 */
router.get('/trending', recommendationController.getTrendingBooks);

/**
 * 유사한 책 (인증 불필요)
 * GET /api/v1/recommendations/similar/:bookId?limit=5
 */
router.get('/similar/:bookId', recommendationController.getSimilarBooks);

/**
 * 추천 새로고침 (인증 필요)
 * POST /api/v1/recommendations/refresh
 */
router.post('/refresh', authenticate, recommendationController.refreshRecommendations);

export default router;
