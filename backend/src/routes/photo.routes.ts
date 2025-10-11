import { Router } from 'express';
import multer from 'multer';
import * as photoController from '../controllers/photo.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Multer 설정 (메모리 스토리지 사용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다'));
    }
  },
});

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/photos:
 *   post:
 *     summary: 사진 업로드
 *     description: 독서 기록에 사진을 업로드합니다
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - reading_record_id
 *               - photo
 *             properties:
 *               reading_record_id:
 *                 type: string
 *                 format: uuid
 *                 description: 독서 기록 ID
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: 이미지 파일 (10MB 이하, jpg/png/gif)
 *     responses:
 *       201:
 *         description: 업로드 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/', upload.single('photo'), photoController.uploadPhoto);

/**
 * @swagger
 * /api/v1/photos:
 *   get:
 *     summary: 사진 목록 조회
 *     description: 특정 독서 기록의 사진 목록을 조회합니다
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reading_record_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 독서 기록 ID
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', photoController.getPhotos);

/**
 * @swagger
 * /api/v1/photos/{id}:
 *   delete:
 *     summary: 사진 삭제
 *     description: 사진을 삭제합니다 (Storage + DB)
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 사진 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
router.delete('/:id', photoController.deletePhoto);

export default router;
