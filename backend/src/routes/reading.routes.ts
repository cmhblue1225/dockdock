import { Router } from 'express';
import * as readingController from '../controllers/reading.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/reading-books:
 *   get:
 *     summary: 읽고 있는 책 목록 조회
 *     description: 사용자의 읽고 있는 책 목록을 조회합니다. status, 페이지네이션 필터링 지원
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [wishlist, reading, completed]
 *         description: 책 상태 필터 (선택사항)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 아이템 수
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReadingBookWithBook'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', readingController.getReadingBooks);

/**
 * @swagger
 * /api/v1/reading-books/{id}:
 *   get:
 *     summary: 특정 읽고 있는 책 조회
 *     description: 읽고 있는 책의 상세 정보를 조회합니다 (책 정보 포함)
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_book ID
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ReadingBookWithBook'
 *       404:
 *         description: 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', readingController.getReadingBookById);

/**
 * @swagger
 * /api/v1/reading-books:
 *   post:
 *     summary: 읽고 있는 책 등록
 *     description: 새로운 책을 위시리스트 또는 읽는 중으로 등록합니다
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - book_id
 *               - status
 *             properties:
 *               book_id:
 *                 type: string
 *                 format: uuid
 *                 description: 책 ID (books 테이블)
 *               status:
 *                 type: string
 *                 enum: [wishlist, reading, completed]
 *                 description: 책 상태
 *               current_page:
 *                 type: integer
 *                 default: 0
 *                 description: 현재 페이지 (선택사항)
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: 시작 날짜 (선택사항, reading 시 자동 설정)
 *           examples:
 *             wishlist:
 *               summary: 위시리스트에 추가
 *               value:
 *                 book_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 status: "wishlist"
 *             reading:
 *               summary: 읽기 시작
 *               value:
 *                 book_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 status: "reading"
 *                 current_page: 0
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ReadingBook'
 *                 message:
 *                   type: string
 *                   example: "책이 등록되었습니다"
 *       409:
 *         description: 이미 등록된 책
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', readingController.createReadingBook);

/**
 * @swagger
 * /api/v1/reading-books/{id}:
 *   patch:
 *     summary: 읽고 있는 책 업데이트
 *     description: 책의 상태, 진행률 등을 업데이트합니다
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [wishlist, reading, completed]
 *                 description: 책 상태 (선택사항)
 *               current_page:
 *                 type: integer
 *                 description: 현재 페이지 (선택사항)
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: 시작 날짜 (선택사항)
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: 완료 날짜 (선택사항, completed 시 자동 설정)
 *           examples:
 *             updateProgress:
 *               summary: 진행률 업데이트
 *               value:
 *                 current_page: 150
 *             markCompleted:
 *               summary: 완독 표시
 *               value:
 *                 status: "completed"
 *     responses:
 *       200:
 *         description: 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ReadingBook'
 *                 message:
 *                   type: string
 *                   example: "책 정보가 업데이트되었습니다"
 */
router.patch('/:id', readingController.updateReadingBook);

/**
 * @swagger
 * /api/v1/reading-books/{id}:
 *   delete:
 *     summary: 읽고 있는 책 삭제
 *     description: 읽고 있는 책을 삭제합니다 (연관된 독서 기록도 함께 삭제됨)
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_book ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "책이 삭제되었습니다"
 */
router.delete('/:id', readingController.deleteReadingBook);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     ReadingBook:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         book_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [wishlist, reading, completed]
 *         current_page:
 *           type: integer
 *         start_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         end_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     ReadingBookWithBook:
 *       allOf:
 *         - $ref: '#/components/schemas/ReadingBook'
 *         - type: object
 *           properties:
 *             book:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 title:
 *                   type: string
 *                 author:
 *                   type: string
 *                   nullable: true
 *                 publisher:
 *                   type: string
 *                   nullable: true
 *                 cover_image_url:
 *                   type: string
 *                   nullable: true
 *                 page_count:
 *                   type: integer
 *                   nullable: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "NOT_FOUND"
 *             message:
 *               type: string
 *               example: "리소스를 찾을 수 없습니다"
 *             details:
 *               type: object
 *               nullable: true
 */
