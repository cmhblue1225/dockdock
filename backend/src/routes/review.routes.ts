import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: 리뷰 목록 조회
 *     description: 사용자의 리뷰 목록을 조회합니다. reading_book_id로 특정 책의 리뷰만 필터링 가능
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reading_book_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 특정 책의 리뷰만 조회 (선택사항)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', reviewController.getReviews);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     summary: 특정 리뷰 조회
 *     description: 리뷰의 상세 정보를 조회합니다
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 성공
 *       404:
 *         description: 찾을 수 없음
 */
router.get('/:id', reviewController.getReviewById);

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: 리뷰 생성
 *     description: 완독한 책에 대한 리뷰를 생성합니다 (평점, 리뷰, 한줄평)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reading_book_id
 *               - rating
 *             properties:
 *               reading_book_id:
 *                 type: string
 *                 format: uuid
 *                 description: 읽은 책 ID
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 평점 (1-5)
 *               review:
 *                 type: string
 *                 description: 상세 리뷰 (선택사항)
 *               one_liner:
 *                 type: string
 *                 description: 한줄평 (선택사항)
 *           example:
 *             reading_book_id: "550e8400-e29b-41d4-a716-446655440000"
 *             rating: 5
 *             one_liner: "인생 책! 꼭 읽어보세요"
 *             review: "정말 감동적인 책이었습니다. 주인공의 여정을 따라가며..."
 *     responses:
 *       201:
 *         description: 생성 성공
 *       409:
 *         description: 이미 리뷰가 존재함
 */
router.post('/', reviewController.createReview);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   patch:
 *     summary: 리뷰 업데이트
 *     description: 리뷰의 평점, 내용, 한줄평을 업데이트합니다
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *               one_liner:
 *                 type: string
 *     responses:
 *       200:
 *         description: 업데이트 성공
 */
router.patch('/:id', reviewController.updateReview);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: 리뷰 삭제
 *     description: 리뷰를 삭제합니다
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
router.delete('/:id', reviewController.deleteReview);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         reading_book_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         review:
 *           type: string
 *           nullable: true
 *         one_liner:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
