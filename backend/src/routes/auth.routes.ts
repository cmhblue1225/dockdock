import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [Authentication]
 *     description: 이메일과 비밀번호로 새 계정을 생성합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               displayName:
 *                 type: string
 *                 example: 홍길동
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/signup', authController.signUp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Authentication]
 *     description: 이메일과 비밀번호로 로그인합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 로그인에 성공했습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                           description: API 호출 시 사용할 JWT 토큰
 *                         refresh_token:
 *                           type: string
 *                           description: 액세스 토큰 갱신용 토큰
 *       401:
 *         description: 인증 실패
 */
router.post('/login', authController.signIn);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Authentication]
 *     description: 현재 세션을 종료합니다
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authMiddleware, authController.signOut);

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     summary: 토큰 검증
 *     tags: [Authentication]
 *     description: JWT 토큰이 유효한지 확인합니다 (iOS용)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 유효한 토큰
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 유효한 토큰입니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     profile:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/verify-token', authMiddleware, authController.verifyToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 사용자 조회
 *     tags: [Authentication]
 *     description: 인증된 사용자의 정보를 조회합니다
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         user_metadata:
 *                           type: object
 *                     profile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         display_name:
 *                           type: string
 *                         avatar_url:
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 비밀번호 재설정 요청
 *     tags: [Authentication]
 *     description: 비밀번호 재설정 이메일을 전송합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 이메일 전송 성공
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/social-login:
 *   post:
 *     summary: 소셜 로그인 (iOS용)
 *     tags: [Authentication]
 *     description: |
 *       iOS 앱에서 Apple/Kakao Sign In SDK로 얻은 ID Token을 검증하고 세션을 생성합니다.
 *
 *       **iOS 사용 방법:**
 *       1. Apple/Kakao Sign In SDK로 로그인하여 ID Token 획득
 *       2. 이 API로 ID Token 전송
 *       3. 응답에서 access_token과 refresh_token 저장
 *       4. 이후 모든 API 호출 시 Authorization 헤더에 Bearer {access_token} 포함
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - idToken
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [apple, kakao]
 *                 example: apple
 *               idToken:
 *                 type: string
 *                 description: Provider에서 발급한 ID Token
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6...
 *     responses:
 *       200:
 *         description: 소셜 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 소셜 로그인에 성공했습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                           description: API 호출 시 사용할 JWT 토큰
 *                         refresh_token:
 *                           type: string
 *                           description: 액세스 토큰 갱신용 토큰
 *       400:
 *         description: 잘못된 요청 또는 소셜 로그인 실패
 */
router.post('/social-login', authController.socialLogin);

/**
 * @swagger
 * /api/auth/account:
 *   delete:
 *     summary: 회원 탈퇴
 *     tags: [Authentication]
 *     description: |
 *       사용자 계정과 관련된 모든 데이터를 삭제합니다.
 *       이 작업은 되돌릴 수 없으므로 신중하게 사용해야 합니다.
 *
 *       삭제되는 데이터:
 *       - 사용자 인증 정보 (Supabase Auth)
 *       - 프로필 정보
 *       - 독서 기록 (읽는 중, 완독, 위시리스트)
 *       - 독서 노트, 사진, 인용구
 *       - 리뷰 및 평점
 *       - 사용자 선호도 및 온보딩 레포트
 *       - 추천 정보
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 회원 탈퇴가 완료되었습니다. 그동안 독독을 이용해주셔서 감사합니다.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         description: 회원 탈퇴 실패
 */
router.delete('/account', authMiddleware, authController.deleteAccount);

export default router;
