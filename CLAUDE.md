# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**독독 (DockDock) - 독서 관리 플랫폼**

- **역할**: iOS 앱 및 웹 앱을 위한 독서 관리 솔루션
- **책임**: API 개발, Swagger 문서화, 웹 프론트엔드 개발, iOS 개발자에게 API 제공
- **플랫폼**: iOS (SwiftUI) + Web (React)
- **배포**: API 서버 + React 웹 앱
- **데이터베이스**: Supabase (PostgreSQL)

## 개발 환경

- **플랫폼**: macOS (Darwin 25.0.0)
- **하드웨어**: MacBook Pro M4 Pro (14-core CPU, 20-core GPU)
- **위치**: `/Users/dev/독독/dockdock`
- **Node.js**: v20+ (Apple Silicon 최적화)
- **TypeScript**: 5.3+
- **Supabase 프로젝트**: `xshxbphonupqlhypglfu` (서울 리전 - ap-northeast-2)

## 핵심 명령어

### Backend API 서버

```bash
cd backend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:3000

# Swagger 문서 생성
npm run swagger
# → http://localhost:3000/api-docs

# 타입 체크 및 빌드
npm run build

# 프로덕션 실행
npm start

# 린트 검사
npm run lint

# 테스트 실행
npm test
```

### Frontend Web App

```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:5173

# 타입 체크
npm run type-check

# 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

## 프로젝트 구조

```
dockdock/
├── CLAUDE.md                  # 이 파일 - 프로젝트 가이드
├── .env.example              # 환경 변수 템플릿
├── README.md                 # 프로젝트 README
│
├── backend/                  # Express API 서버
│   ├── src/
│   │   ├── index.ts         # Express 앱 진입점
│   │   ├── routes/          # API 라우트 정의 (Swagger 주석)
│   │   │   ├── auth.routes.ts
│   │   │   ├── books.routes.ts
│   │   │   ├── reading.routes.ts
│   │   │   ├── records.routes.ts
│   │   │   ├── reviews.routes.ts
│   │   │   ├── upload.routes.ts
│   │   │   └── ai.routes.ts
│   │   ├── controllers/     # 비즈니스 로직
│   │   │   ├── auth.controller.ts
│   │   │   ├── books.controller.ts
│   │   │   ├── reading.controller.ts
│   │   │   ├── records.controller.ts
│   │   │   ├── reviews.controller.ts
│   │   │   ├── upload.controller.ts
│   │   │   └── ai.controller.ts
│   │   ├── services/        # 외부 API 및 비즈니스 로직
│   │   │   ├── aladin.service.ts    # 알라딘 API
│   │   │   ├── openai.service.ts    # OpenAI API
│   │   │   └── supabase.service.ts  # Supabase 클라이언트
│   │   ├── middleware/      # Express 미들웨어
│   │   │   ├── auth.middleware.ts   # JWT 인증
│   │   │   └── validator.middleware.ts
│   │   ├── utils/           # 유틸리티 함수
│   │   └── types/           # TypeScript 타입
│   ├── swagger/             # Swagger 설정
│   │   └── config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # React 웹 앱
│   ├── src/
│   │   ├── main.tsx        # React 진입점
│   │   ├── App.tsx         # 앱 루트 컴포넌트
│   │   ├── components/     # 재사용 가능한 UI 컴포넌트
│   │   │   ├── auth/       # 인증 관련 컴포넌트
│   │   │   ├── layout/     # 레이아웃 컴포넌트
│   │   │   ├── books/      # 책 관련 컴포넌트
│   │   │   └── ui/         # 공통 UI 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   │   ├── LoginPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── LibraryPage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── stores/         # Zustand 상태 관리
│   │   │   ├── authStore.ts
│   │   │   ├── bookStore.ts
│   │   │   └── readingStore.ts
│   │   ├── lib/            # 라이브러리 및 유틸
│   │   │   ├── supabase.ts # Supabase 클라이언트
│   │   │   ├── api.ts      # API 클라이언트
│   │   │   └── utils.ts
│   │   └── types/          # TypeScript 타입
│   ├── public/             # 정적 파일
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── shared/                 # 공유 타입 (Web + iOS)
    └── types/
        ├── user.types.ts
        ├── book.types.ts
        ├── reading.types.ts
        └── api.types.ts
```

## Supabase 프로젝트 정보

### 프로젝트 ID
```
xshxbphonupqlhypglfu
```

### 리전
```
ap-northeast-2 (서울)
```

### 데이터베이스 테이블

1. **profiles** - 사용자 프로필
   - `id` (uuid, FK to auth.users)
   - `email` (text)
   - `display_name` (text)
   - `avatar_url` (text, nullable)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

2. **books** - 책 마스터 데이터 (알라딘 API 캐싱)
   - `id` (uuid, PK)
   - `isbn` (text, unique)
   - `isbn13` (text, unique)
   - `title` (text)
   - `author` (text)
   - `publisher` (text)
   - `published_date` (text)
   - `description` (text)
   - `cover_image_url` (text)
   - `page_count` (integer, nullable)
   - `category` (text)
   - `aladin_id` (text)
   - `created_at` (timestamptz)

3. **reading_books** - 독서 중인 책
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to profiles)
   - `book_id` (uuid, FK to books)
   - `status` (text: 'reading' | 'completed' | 'paused')
   - `current_page` (integer, default 0)
   - `total_pages` (integer)
   - `progress_percent` (decimal)
   - `started_at` (timestamptz)
   - `completed_at` (timestamptz, nullable)
   - `updated_at` (timestamptz)

4. **reading_records** - 독서 기록
   - `id` (uuid, PK)
   - `reading_book_id` (uuid, FK to reading_books)
   - `user_id` (uuid, FK to profiles)
   - `page_number` (integer)
   - `content` (text, nullable) - 메모/감상
   - `recorded_at` (timestamptz)
   - `created_at` (timestamptz)

5. **reading_photos** - 독서 기록 사진
   - `id` (uuid, PK)
   - `reading_record_id` (uuid, FK to reading_records)
   - `user_id` (uuid, FK to profiles)
   - `photo_url` (text) - Supabase Storage URL
   - `created_at` (timestamptz)

6. **reading_quotes** - 인용구
   - `id` (uuid, PK)
   - `reading_record_id` (uuid, FK to reading_records)
   - `user_id` (uuid, FK to profiles)
   - `quote_text` (text)
   - `page_number` (integer, nullable)
   - `created_at` (timestamptz)

7. **book_reviews** - 독서 후기
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to profiles)
   - `book_id` (uuid, FK to books)
   - `reading_book_id` (uuid, FK to reading_books, nullable)
   - `rating` (integer, 1-5)
   - `review_text` (text)
   - `is_public` (boolean, default false)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### Storage Buckets

1. **reading-photos** - 독서 기록 사진
   - 공개 여부: 비공개
   - 최대 파일 크기: 5MB
   - 허용 파일 타입: image/jpeg, image/png, image/webp

## 디자인 시스템

### 컬러 팔레트 (기존 목업 디자인 기반)

```css
:root {
  /* Primary Colors */
  --primary: #D4A574;        /* 브라운/골드 - 메인 버튼, 액센트 */
  --secondary: #8B7355;      /* 다크 브라운 */
  --accent: #E8B88B;         /* 라이트 브라운 */

  /* Background Colors */
  --background: #F5F5F0;     /* 아이보리/베이지 */
  --surface: #FEFDFB;        /* 화이트 */
  --sidebar-bg: #FFFFFF;     /* 사이드바 배경 */

  /* Text Colors */
  --text-primary: #2C2C2C;   /* 다크 그레이 */
  --text-secondary: #8E8E93; /* 그레이 */

  /* Special Colors */
  --ios-green: #5E6B3D;      /* 로그인 화면의 다크 올리브 그린 */

  /* Border & Shadow */
  --border-color: #E5E5E0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### 타이포그래피

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Pro Display', sans-serif;
```

### 디자인 참고

- 웹 목업: https://zesty-sorbet-0b01e1.netlify.app/web-mockup
- iOS 로그인 디자인: 올리브 그린 + 베이지 톤
- 목업 소스: `/Users/dev/독독/mockup`

## API 개발 워크플로우

### 1. 새로운 API 엔드포인트 추가

**단계:**
1. `shared/types/` 에 필요한 타입 정의 (Web + iOS 공유)
2. `backend/src/services/` 에 비즈니스 로직 작성
3. `backend/src/controllers/` 에 컨트롤러 작성
4. `backend/src/routes/` 에 라우트와 **Swagger 주석** 추가
5. `backend/src/index.ts` 에 라우트 등록

**예시: 독서 기록 API 추가**

```typescript
// shared/types/reading.types.ts
export interface ReadingRecord {
  id: string;
  reading_book_id: string;
  user_id: string;
  page_number: number;
  content?: string;
  recorded_at: string;
  created_at: string;
}

// backend/src/controllers/records.controller.ts
import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';

export const recordsController = {
  createRecord: async (req: Request, res: Response) => {
    // 비즈니스 로직
  },

  getRecords: async (req: Request, res: Response) => {
    // 비즈니스 로직
  }
};

// backend/src/routes/records.routes.ts
import { Router } from 'express';
import { recordsController } from '../controllers/records.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/reading-records:
 *   post:
 *     summary: 독서 기록 작성
 *     tags: [Reading Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reading_book_id:
 *                 type: string
 *               page_number:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 기록 생성 성공
 *       401:
 *         description: 인증 실패
 */
router.post('/', authMiddleware, recordsController.createRecord);

export default router;
```

### 2. Swagger 문서화

**모든 API는 반드시 Swagger 주석을 포함해야 합니다.**

- 엔드포인트 설명
- 요청/응답 스키마
- 인증 요구사항
- 에러 응답

**Swagger 문서 확인:**
- 로컬: `http://localhost:3000/api-docs`
- iOS 개발자에게 공유

### 3. API 응답 형식

**일관된 응답 구조:**

```typescript
// 성공 응답
{
  "success": true,
  "message": "작업 성공",
  "data": { /* 실제 데이터 */ }
}

// 에러 응답
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 정보"
}

// 페이지네이션 응답
{
  "success": true,
  "data": [ /* 아이템 배열 */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 외부 API 통합

### 알라딘 Open API

**참고 프로젝트**: `/Users/dev/독독/apis`

- 기존에 완성된 알라딘 API 클라이언트 코드 활용
- 책 검색, ISBN 조회 기능 완비
- Swagger 문서화 완료

**주요 기능:**
- 제목/저자 검색
- ISBN으로 정확한 책 조회
- 상세 정보 조회

**환경 변수:**
```
ALADIN_TTB_KEY=your_aladin_ttb_key
```

### OpenAI API

**사용 목적:**
- 독서 기반 책 추천
- 독서 인사이트 생성
- 독서 노트 요약

**환경 변수:**
```
OPENAI_API_KEY=your_openai_api_key
```

### Supabase

**인증 (Supabase Auth):**
- 이메일/비밀번호
- Apple 로그인 (iOS + Web)
- Google 로그인 (iOS + Web)

**스토리지:**
- 독서 기록 사진 업로드
- 최대 5MB
- JPEG, PNG, WebP

**환경 변수:**
```
VITE_SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## 웹 프론트엔드 개발

### React 프로젝트 구조

- **React 19** + TypeScript
- **Vite** 빌드 도구
- **Tailwind CSS v3** 스타일링
- **React Router** 라우팅
- **React Query** 서버 상태 관리
- **Zustand** 클라이언트 상태 관리
- **Supabase Client** 인증 및 데이터베이스

### 주요 페이지

1. **로그인/회원가입** (`/login`, `/signup`)
   - 이메일 로그인
   - Apple, Google 소셜 로그인
   - iOS 디자인과 동일한 톤 (올리브 그린 + 베이지)

2. **홈 대시보드** (`/`)
   - 독서 중인 책 위젯
   - 최근 기록 타임라인
   - 독서 통계

3. **내 서재** (`/library`)
   - 독서 중 / 완독 / 중단 탭
   - 책 카드 그리드

4. **책 검색** (`/search`)
   - 알라딘 API 통합
   - 실시간 검색

5. **독서 기록** (`/reading/:id`)
   - 진행률 업데이트
   - 사진 업로드
   - 인용구 작성

6. **독서 후기** (`/reviews`)
   - 평점 및 후기
   - 공개/비공개

7. **AI 추천** (`/ai-recommend`)
   - OpenAI 기반 추천

### Tailwind 설정

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#D4A574',
        secondary: '#8B7355',
        accent: '#E8B88B',
        background: '#F5F5F0',
        surface: '#FEFDFB',
        'ios-green': '#5E6B3D',
      },
    },
  },
};
```

## iOS 개발자와 협업

### API 문서 제공

1. **Swagger UI** 공유
   - URL: `http://localhost:3000/api-docs` (개발)
   - 배포 URL 공유 (프로덕션)

2. **공유 타입 정의**
   - `/shared/types` 폴더의 TypeScript 타입
   - iOS 개발자가 Swift 타입으로 변환 가능

3. **API 엔드포인트 목록**
   - 모든 엔드포인트는 `/api` prefix 사용
   - RESTful 설계 원칙 준수

### 인증 토큰

- Supabase JWT 토큰 사용
- iOS에서 `Authorization: Bearer <token>` 헤더로 전달
- 토큰 갱신은 Supabase Client가 자동 처리

### 이미지 업로드

- iOS에서 multipart/form-data로 전송
- API: `POST /api/upload/photo`
- Supabase Storage URL 반환

### 인스타그램 공유

- API: `GET /api/reviews/:id/share`
- 후기 데이터를 JSON으로 반환
- iOS에서 이미지 생성 및 공유 처리

## 코드 작성 규칙

### TypeScript

- **strict 모드** 활성화
- 모든 함수와 변수에 **타입 명시**
- `any` 타입 사용 최소화
- `shared/types/`에 공통 타입 정의

### 에러 처리

```typescript
try {
  // 비즈니스 로직
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error instanceof Error ? error.message : 'Unknown error'
  });
}
```

### 보안

- 민감한 정보는 `.env` 파일에 저장
- `.env`는 절대 Git에 커밋 금지
- Supabase RLS로 데이터 접근 제어
- JWT 토큰 검증

## 참고 프로젝트

### 1. APIs 프로젝트 (`/Users/dev/독독/apis`)

- 알라딘 API 완전 통합
- Swagger 문서화 완비
- Express + TypeScript 구조 참고

### 2. Mockup 프로젝트 (`/Users/dev/독독/mockup`)

- 웹 디자인 목업: https://zesty-sorbet-0b01e1.netlify.app/web-mockup
- iOS 화면 목업
- 디자인 시스템 및 컬러 팔레트

## 트러블슈팅

### 로컬 개발 시 포트 충돌

```bash
# 3000번 포트 사용 중인 프로세스 종료
lsof -ti:3000 | xargs kill -9

# 5173번 포트 사용 중인 프로세스 종료
lsof -ti:5173 | xargs kill -9
```

### Supabase 연결 오류

- `.env` 파일에 환경 변수 확인
- Supabase 프로젝트 상태 확인
- API 키 유효성 확인

### TypeScript 컴파일 에러

```bash
# 타입 체크
npx tsc --noEmit

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

## 배포

### Backend API 배포

- Netlify Functions 또는 Vercel 사용 가능
- 환경 변수 설정 필수
- CORS 설정 확인

### Frontend 배포

- Netlify 또는 Vercel 사용 가능
- `npm run build` 후 `dist` 폴더 배포
- 환경 변수 설정

## 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [알라딘 Open API](https://blog.aladin.co.kr/openapi)
- [OpenAI API](https://platform.openai.com/docs)
- [Swagger/OpenAPI](https://swagger.io/specification/)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)

## 작업 시 유의사항

1. **모든 API는 Swagger 문서화 필수**
2. **iOS 개발자와 API 변경사항 공유**
3. **일관된 응답 형식 사용**
4. **에러 처리 철저히**
5. **환경 변수로 민감한 정보 관리**
6. **코드 변경 시 테스트 필수**
7. **디자인 시스템 컬러 팔레트 준수**
8. **한국어로 커뮤니케이션**
9. **Supabase MCP 도구 활용** - 데이터베이스 작업 시 직접 연결
10. **타입 정의는 shared/types에 공유**

---

**💡 모든 작업은 iOS 개발자와 협업을 고려하여 진행합니다.**
