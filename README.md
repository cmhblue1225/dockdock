# 📚 독독 (DockDock) - 독서 관리 플랫폼

> 똑똑한 독서 습관, 독독하자에서 시작하세요.

독서 기록, 진행 상황 추적, 책 추천까지 - 당신의 독서 여정을 함께합니다.

[![Render Deploy](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat-square&logo=render)](https://render.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

---

## 🎯 프로젝트 개요

독독(DockDock)은 웹과 iOS 플랫폼에서 사용 가능한 독서 관리 플랫폼입니다.

### 주요 기능
- ✅ **사용자 인증** - 이메일/비밀번호, Apple, Kakao 소셜 로그인
- ✅ **책 검색** - 알라딘 API 연동으로 국내 모든 도서 검색
- 📖 **독서 관리** - 읽고 있는 책 추적, 진행률 기록
- 📝 **독서 기록** - 메모, 인용구, 사진 첨부
- ⭐ **독서 후기** - 별점 평가 및 리뷰 작성
- 📊 **독서 통계** - 개인 독서 패턴 분석
- 🤖 **AI 추천** - OpenAI 기반 맞춤 도서 추천 (예정)

---

## 🏗️ 기술 스택

### 백엔드
- **Runtime**: Node.js 20.x
- **Framework**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **External APIs**: Aladin Open API, OpenAI API
- **Documentation**: Swagger (OpenAPI 3.0)

### 프론트엔드
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router 7
- **State Management**: Zustand, TanStack Query
- **Styling**: Tailwind CSS 3.4
- **Auth**: Supabase Client

### DevOps
- **Frontend Hosting**: Netlify
- **Backend Hosting**: Render.com
- **Version Control**: Git, GitHub
- **CI/CD**: Auto Deploy (Git Push)

---

## 📁 프로젝트 구조

```
dockdock/
├── backend/                # Express API 서버
│   ├── src/
│   │   ├── controllers/   # API 컨트롤러
│   │   ├── services/      # 비즈니스 로직
│   │   ├── middleware/    # 미들웨어 (인증 등)
│   │   ├── routes/        # API 라우트
│   │   └── index.ts       # 서버 진입점
│   ├── swagger/           # Swagger 설정
│   └── package.json
│
├── frontend/              # React 웹 앱
│   ├── src/
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── components/   # 재사용 컴포넌트
│   │   ├── stores/       # Zustand 스토어
│   │   ├── lib/          # 유틸리티 (Supabase, API)
│   │   └── App.tsx       # 앱 진입점
│   └── package.json
│
├── shared/               # 공유 타입 정의
│   └── types/
│
├── netlify.toml          # Netlify 배포 설정 (프론트엔드)
├── render.yaml           # Render 배포 설정 (백엔드)
├── DEPLOYMENT.md         # 배포 가이드
└── README.md            # 이 파일
```

---

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 20.x 이상
- npm 또는 yarn
- Supabase 계정
- Aladin API Key

### 1. 저장소 클론
```bash
git clone https://github.com/cmhblue1225/dockdock.git
cd dockdock
```

### 2. 환경 변수 설정

**백엔드 (.env)**
```bash
cd backend
cp .env.example .env
# .env 파일 편집
```

필수 환경 변수:
```env
SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
ALADIN_API_KEY=your_aladin_api_key
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

**프론트엔드 (.env)**
```bash
cd ../frontend
cp .env.example .env
# .env 파일 편집
```

필수 환경 변수:
```env
VITE_SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000
VITE_ENV=development
```

### 3. 의존성 설치 및 실행

**백엔드**
```bash
cd backend
npm install
npm run dev
# → http://localhost:3000
# → API Docs: http://localhost:3000/api-docs
```

**프론트엔드** (새 터미널)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📚 API 문서

### 로컬 개발
```
http://localhost:3000/api-docs
```

### 프로덕션
```
https://dockdock-api.onrender.com/api-docs
```

### 주요 엔드포인트

#### 인증 API
```
POST   /api/auth/signup          # 회원가입
POST   /api/auth/login           # 로그인
POST   /api/auth/logout          # 로그아웃
POST   /api/auth/verify-token    # 토큰 검증 (iOS용)
GET    /api/auth/me              # 현재 사용자
POST   /api/auth/reset-password  # 비밀번호 재설정
POST   /api/auth/social-login    # 소셜 로그인 (iOS용)
```

#### 책 검색 API
```
GET    /api/books/search         # 책 검색 (제목, 저자)
GET    /api/books/isbn/:isbn     # ISBN으로 검색
GET    /api/books/:bookId        # 책 상세 조회
GET    /api/books                # 통합 검색 (ISBN/제목 자동 판별)
```

모든 보호된 엔드포인트는 Authorization 헤더가 필요합니다:
```http
Authorization: Bearer {access_token}
```

---

## 🔐 인증 시스템

### 웹 (React)
```typescript
import { useAuthStore } from '@/stores/authStore';

// 로그인
const { signIn } = useAuthStore();
await signIn('email@example.com', 'password');

// 소셜 로그인
const { signInWithKakao, signInWithApple } = useAuthStore();
await signInWithKakao(); // 또는 signInWithApple()
```

### iOS (Swift)
```swift
// 1. 로그인
let response = await api.post("/api/auth/login", body: [
  "email": "user@example.com",
  "password": "password123"
])

// 2. 토큰 저장
let accessToken = response.data.session.access_token

// 3. API 호출 시 헤더 포함
request.addValue("Bearer \(accessToken)",
                 forHTTPHeaderField: "Authorization")
```

---

## 📱 iOS 개발자를 위한 가이드

### API Base URL
```
개발: http://localhost:3000
프로덕션: https://dockdock-api.onrender.com
```

### 소셜 로그인 플로우
1. iOS에서 Apple/Kakao Sign In SDK로 ID Token 획득
2. `POST /api/auth/social-login`으로 ID Token 전송
3. 응답에서 `access_token`, `refresh_token` 저장
4. 이후 모든 API 호출 시 Bearer 토큰 사용

자세한 내용은 [Swagger 문서](https://dockdock-api.onrender.com/api-docs) 참고

---

## 🌐 배포

### Netlify (프론트엔드) + Render (백엔드)

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md) 또는 [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) 참고

**배포 아키텍처:**
```d
Netlify (프론트엔드) → Render (백엔드 API)
```

**간단 배포:**
```bash
# 1. GitHub에 푸시
git add .
git commit -m "feat: 배포 준비 완료"
git push origin main

# 2. Netlify에서 프론트엔드 배포
# https://app.netlify.com/ → Import from Git

# 3. Render에서 백엔드 배포
# https://dashboard.render.com/ → Blueprint
```

**배포 후 URL:**
- 프론트엔드: https://dockdock.netlify.app
- 백엔드 API: https://dockdock-api.onrender.com
- API 문서: https://dockdock-api.onrender.com/api-docs

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블

#### profiles
사용자 프로필 정보
```sql
- id (UUID, PK)
- email (String, Unique)
- display_name (String)
- avatar_url (String)
- created_at, updated_at
```

#### books
마스터 도서 데이터 (알라딘 API)
```sql
- id (UUID, PK)
- isbn13 (String, Unique)
- title (String)
- author (String)
- publisher (String)
- cover_image (String)
- description (Text)
```

#### reading_books
사용자의 독서 중인 책
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- book_id (UUID, FK → books)
- status (reading/completed/paused)
- current_page (Integer)
- total_pages (Integer)
- started_at, completed_at
```

#### reading_records
독서 기록 (메모, 인용구)
```sql
- id (UUID, PK)
- reading_book_id (UUID, FK → reading_books)
- record_type (note/quote/photo)
- content (Text)
- page_number (Integer)
- created_at
```

#### book_reviews
독서 후기
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- book_id (UUID, FK → books)
- rating (Integer, 1-5)
- review_text (Text)
- created_at, updated_at
```

전체 스키마는 Supabase Dashboard에서 확인 가능

---

## 🧪 테스트

### 회원가입/로그인 테스트
```bash
# 회원가입
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "테스터"
  }'

# 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 책 검색 테스트
```bash
# 제목으로 검색
curl "http://localhost:3000/api/books/search?query=클린코드&maxResults=5"

# ISBN으로 검색
curl "http://localhost:3000/api/books/isbn/9788966262281"
```

---

## 🛠️ 개발 가이드

### 코드 스타일
- TypeScript Strict Mode
- ESLint + Prettier
- Conventional Commits

### 브랜치 전략
```
main        # 프로덕션 배포
develop     # 개발 통합
feature/*   # 기능 개발
bugfix/*    # 버그 수정
```

### 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 설정 등
```

---

## 📝 로드맵

### ✅ Phase 1 (완료)
- [x] 프로젝트 초기 설정
- [x] Supabase 데이터베이스 구축
- [x] 사용자 인증 시스템
- [x] 책 검색 API (알라딘)
- [x] Swagger API 문서
- [x] Render.com 배포 설정

### 🚧 Phase 2 (진행 중)
- [ ] 독서 중인 책 관리 API
- [ ] 독서 기록 API (메모, 인용구, 사진)
- [ ] 독서 후기 API
- [ ] 프론트엔드 페이지 완성

### 📅 Phase 3 (예정)
- [ ] AI 기반 책 추천 (OpenAI)
- [ ] 독서 통계 대시보드
- [ ] 소셜 기능 (친구, 공유)
- [ ] iOS 네이티브 앱

---

## 🤝 기여

기여를 환영합니다! 다음 절차를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 👥 팀

- **Backend Developer** - [@cmhblue1225](https://github.com/cmhblue1225)
- **iOS Developer** - (예정)

---

## 📞 문의

프로젝트 관련 문의사항은 [Issues](https://github.com/cmhblue1225/dockdock/issues)에 남겨주세요.

---

**Made with ❤️ by DockDock Team**
