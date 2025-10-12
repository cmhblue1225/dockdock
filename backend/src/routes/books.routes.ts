import { Router } from 'express';
import { booksController } from '../controllers/books.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: 책 검색 및 조회 API (독서 관리 앱용)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 알라딘 상품 ID
 *           example: "123456789"
 *         isbn:
 *           type: string
 *           description: ISBN-10
 *           example: "8966260950"
 *         isbn13:
 *           type: string
 *           description: ISBN-13
 *           example: "9788966260959"
 *         title:
 *           type: string
 *           description: 책 제목
 *           example: "클린 코드"
 *         subtitle:
 *           type: string
 *           description: 부제
 *           example: "애자일 소프트웨어 장인 정신"
 *         author:
 *           type: string
 *           description: 저자
 *           example: "로버트 C. 마틴"
 *         publisher:
 *           type: string
 *           description: 출판사
 *           example: "인사이트"
 *         publishedDate:
 *           type: string
 *           description: 출판일
 *           example: "2013-12-24"
 *         description:
 *           type: string
 *           description: 책 설명
 *         coverImage:
 *           type: string
 *           description: 표지 이미지 URL
 *           example: "https://image.aladin.co.kr/product/3408/36/coversum/8966260950_2.jpg"
 *         categoryName:
 *           type: string
 *           description: 카테고리
 *           example: "국내도서>컴퓨터/IT"
 *         pageCount:
 *           type: number
 *           description: 페이지 수
 *           example: 584
 *         price:
 *           type: object
 *           properties:
 *             standard:
 *               type: number
 *               description: 정가
 *             sales:
 *               type: number
 *               description: 판매가
 *             currency:
 *               type: string
 *               example: "KRW"
 *         link:
 *           type: string
 *           description: 알라딘 상품 링크
 *         stockStatus:
 *           type: string
 *           description: 재고 상태
 *         rating:
 *           type: number
 *           description: 고객 평점 (5점 만점)
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: 등록 시간
 */

/**
 * @swagger
 * /api/v1/books/search:
 *   get:
 *     summary: 책 검색 (제목, 저자 등)
 *     description: 사용자가 입력한 검색어로 책을 검색합니다
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색어
 *         example: "클린코드"
 *       - in: query
 *         name: queryType
 *         schema:
 *           type: string
 *           enum: [Title, Author, Publisher, Keyword]
 *           default: Title
 *         description: 검색 타입
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: number
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: 최대 결과 수
 *       - in: query
 *         name: start
 *         schema:
 *           type: number
 *           default: 1
 *         description: 시작 인덱스
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [Accuracy, PublishTime, Title, SalesPoint]
 *           default: Accuracy
 *         description: 정렬 기준
 *     responses:
 *       200:
 *         description: 검색 성공
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 검색 결과 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/search', booksController.searchBooks);

/**
 * @swagger
 * /api/v1/books/isbn/{isbn}:
 *   get:
 *     summary: ISBN으로 책 검색
 *     description: |
 *       ISBN으로 정확한 책 정보를 조회합니다.
 *       바코드 스캔 또는 ISBN 입력 시 사용합니다.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *         description: ISBN-10 또는 ISBN-13
 *         example: "9788966260959"
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: ISBN이 입력되지 않음
 *       404:
 *         description: 해당 ISBN의 책을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/isbn/:isbn', booksController.searchByISBN);

/**
 * @swagger
 * /api/v1/books/{bookId}:
 *   get:
 *     summary: 책 상세 정보 조회
 *     description: 알라딘 상품 ID로 책의 상세 정보를 조회합니다
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 알라딘 상품 ID
 *         example: "123456789"
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: 책 ID가 입력되지 않음
 *       404:
 *         description: 책을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:bookId', booksController.getBookDetail);

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: 책을 데이터베이스에 저장
 *     description: |
 *       검색된 책을 books 테이블에 저장합니다.
 *       isbn13이 이미 존재하면 기존 책 정보를 반환합니다.
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 책 제목
 *                 example: "클린 코드"
 *               author:
 *                 type: string
 *                 description: 저자
 *                 example: "로버트 C. 마틴"
 *               publisher:
 *                 type: string
 *                 description: 출판사
 *                 example: "인사이트"
 *               cover_image_url:
 *                 type: string
 *                 description: 표지 이미지 URL
 *               isbn:
 *                 type: string
 *                 description: ISBN-10
 *               isbn13:
 *                 type: string
 *                 description: ISBN-13
 *               page_count:
 *                 type: number
 *                 description: 페이지 수
 *               published_date:
 *                 type: string
 *                 description: 출판일
 *               description:
 *                 type: string
 *                 description: 책 설명
 *               category:
 *                 type: string
 *                 description: 카테고리
 *               aladin_id:
 *                 type: string
 *                 description: 알라딘 상품 ID
 *     responses:
 *       201:
 *         description: 책이 성공적으로 저장됨
 *       200:
 *         description: 이미 존재하는 책 (중복)
 *       400:
 *         description: 필수 필드 누락
 *       500:
 *         description: 서버 오류
 */
router.post('/', booksController.createBook);

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: 통합 검색 (제목 또는 ISBN 자동 판별)
 *     description: |
 *       사용자 입력이 ISBN인지 제목인지 자동으로 판별하여 검색합니다.
 *
 *       검색 로직:
 *       - 숫자만 10자리 또는 13자리 → ISBN 검색
 *       - 그 외 → 제목 검색
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색어 (제목 또는 ISBN)
 *         example: "클린코드"
 *     responses:
 *       200:
 *         description: 검색 성공
 *       400:
 *         description: 검색어가 입력되지 않음
 *       404:
 *         description: 검색 결과 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/', booksController.unifiedSearch);

export default router;
