import { Router } from 'express';
import * as onboardingController from '../controllers/onboarding.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * 온보딩 장르 목록 (인증 불필요)
 * GET /api/v1/onboarding/genres
 */
router.get('/genres', onboardingController.getOnboardingGenres);

/**
 * 특정 장르의 책 (인증 불필요)
 * GET /api/v1/onboarding/books/:genre?limit=5
 */
router.get('/books/:genre', onboardingController.getGenreBooks);

/**
 * 사용자 선호도 저장 (인증 필요)
 * POST /api/v1/onboarding/preferences
 * Body: { preferred_genres: string[], selected_book_ids?: string[] }
 */
router.post('/preferences', authenticate, onboardingController.saveUserPreferences);

/**
 * 온보딩 상태 확인 (인증 필요)
 * GET /api/v1/onboarding/status
 */
router.get('/status', authenticate, onboardingController.getOnboardingStatus);

export default router;
