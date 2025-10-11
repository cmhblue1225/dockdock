import { Router } from 'express';
import * as recordController from '../controllers/record.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/reading-records:
 *   get:
 *     summary: 독서 기록 목록 조회
 *     description: 사용자의 독서 기록 목록을 조회합니다. reading_book_id로 특정 책의 기록만 필터링 가능
 *     tags: [Reading Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reading_book_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 특정 책의 기록만 조회 (선택사항)
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
 *           default: 50
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
 *                         $ref: '#/components/schemas/ReadingRecordWithBook'
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
 */
router.get('/', recordController.getReadingRecords);

/**
 * @swagger
 * /api/v1/reading-records/{id}:
 *   get:
 *     summary: 특정 독서 기록 조회
 *     description: 독서 기록의 상세 정보를 조회합니다
 *     tags: [Reading Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_record ID
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
 *                   $ref: '#/components/schemas/ReadingRecordWithBook'
 *       404:
 *         description: 찾을 수 없음
 */
router.get('/:id', recordController.getReadingRecordById);

/**
 * @swagger
 * /api/v1/reading-records:
 *   post:
 *     summary: 독서 기록 생성
 *     description: 새로운 독서 기록을 생성합니다 (메모, 인용구, 생각)
 *     tags: [Reading Records]
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
 *               - content
 *             properties:
 *               reading_book_id:
 *                 type: string
 *                 format: uuid
 *                 description: 읽고 있는 책 ID
 *               content:
 *                 type: string
 *                 description: 기록 내용
 *               page_number:
 *                 type: integer
 *                 description: 페이지 번호 (선택사항)
 *               record_type:
 *                 type: string
 *                 enum: [note, quote, thought]
 *                 default: note
 *                 description: 기록 유형 (note=메모, quote=인용구, thought=생각)
 *           examples:
 *             note:
 *               summary: 메모 작성
 *               value:
 *                 reading_book_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 content: "주인공의 선택이 인상적이었다"
 *                 page_number: 127
 *                 record_type: "note"
 *             quote:
 *               summary: 인용구 저장
 *               value:
 *                 reading_book_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 content: "삶은 B(Birth)와 D(Death) 사이의 C(Choice)다"
 *                 page_number: 89
 *                 record_type: "quote"
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
 *                   $ref: '#/components/schemas/ReadingRecord'
 *                 message:
 *                   type: string
 *                   example: "독서 기록이 생성되었습니다"
 */
router.post('/', recordController.createReadingRecord);

/**
 * @swagger
 * /api/v1/reading-records/{id}:
 *   patch:
 *     summary: 독서 기록 업데이트
 *     description: 독서 기록의 내용, 페이지, 유형을 업데이트합니다
 *     tags: [Reading Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 기록 내용
 *               page_number:
 *                 type: integer
 *                 description: 페이지 번호
 *               record_type:
 *                 type: string
 *                 enum: [note, quote, thought]
 *                 description: 기록 유형
 *     responses:
 *       200:
 *         description: 업데이트 성공
 */
router.patch('/:id', recordController.updateReadingRecord);

/**
 * @swagger
 * /api/v1/reading-records/{id}:
 *   delete:
 *     summary: 독서 기록 삭제
 *     description: 독서 기록을 삭제합니다
 *     tags: [Reading Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_record ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
router.delete('/:id', recordController.deleteReadingRecord);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     ReadingRecord:
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
 *         content:
 *           type: string
 *         page_number:
 *           type: integer
 *           nullable: true
 *         record_type:
 *           type: string
 *           enum: [note, quote, thought]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     ReadingRecordWithBook:
 *       allOf:
 *         - $ref: '#/components/schemas/ReadingRecord'
 *         - type: object
 *           properties:
 *             reading_book:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 book_id:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [wishlist, reading, completed]
 *                 book:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                       nullable: true
 *                     cover_image_url:
 *                       type: string
 *                       nullable: true
 */
