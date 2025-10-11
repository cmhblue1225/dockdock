# 독독 (DockDock) 프로젝트 가이드라인

## 📋 프로젝트 개요

**독독(DockDock)**은 독서 기록 및 관리 플랫폼으로, 사용자가 읽고 있는 책을 등록하고 독서 과정을 기록하며, 완독 후 리뷰를 남길 수 있는 서비스입니다.

### 기술 스택

**프론트엔드 (Web)**
- React 19 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS (스타일링)
- React Router (라우팅)
- TanStack Query (React Query) - 서버 상태 관리
- Zustand - 클라이언트 상태 관리
- 배포: Netlify (https://dockdock.minhyuk.kr)

**백엔드**
- Express.js + TypeScript
- Swagger/OpenAPI (API 문서화)
- 배포: Railway (https://dockdock-production.up.railway.app)

**데이터베이스 & 인증**
- Supabase (PostgreSQL + Auth + Storage)
- Supabase 프로젝트: `xshxbphonupqlhypglfu` (서울 리전 - ap-northeast-2)
- Row Level Security (RLS) 적용

**iOS 앱 (동시 개발 중)**
- Native iOS 앱이 동시에 개발되고 있음
- 백엔드 API는 Web과 iOS 모두 지원해야 함

---

## 🎯 개발 원칙

### 1. API-First 설계

iOS 앱 개발이 동시에 진행되므로, 모든 API는 **API-First** 원칙으로 설계합니다:

- **RESTful API 설계**: 명확한 리소스 기반 엔드포인트
- **완벽한 Swagger 문서화**: https://dockdock-production.up.railway.app/api-docs/
  - 모든 엔드포인트는 요청/응답 스키마 명시
  - 에러 코드 및 예시 포함
  - iOS 개발자가 바로 이해하고 사용할 수 있어야 함
- **버전 관리**: `/api/v1/...` 형태로 버전 명시
- **일관된 응답 형식**:
  ```typescript
  // 성공 응답
  {
    success: true,
    data: T,
    message?: string
  }

  // 에러 응답
  {
    success: false,
    error: {
      code: string,
      message: string,
      details?: any
    }
  }
  ```

### 2. TypeScript 우선

- 모든 코드는 TypeScript로 작성
- `any` 타입 사용 최소화
- 프론트엔드와 백엔드 간 타입 공유 (types 디렉토리)
- Swagger 스키마와 TypeScript 타입 일치

### 3. 보안 우선

- **Supabase Auth 기반 인증**: JWT 토큰
- **RLS 정책**: 모든 테이블에 적용
- **입력 검증**: Zod 등 스키마 검증 라이브러리 사용
- **환경 변수 관리**: .env 파일 (절대 커밋하지 않음)

### 4. 모바일 친화적 설계

- **반응형 디자인**: Tailwind CSS 활용 (모바일 우선 → 데스크톱 확장)
- **오프라인 지원 고려**: 추후 PWA 전환 가능하도록 설계
- **이미지 최적화**: WebP 포맷, lazy loading
- **네트워크 에러 처리**: 재시도 로직 및 사용자 피드백

---

## 🎨 디자인 시스템

### 색상 팔레트

```css
:root {
  /* Primary Colors */
  --primary: #4F6815;           /* 올리브 그린 - 메인 포인트 컬러 */
  --primary-dark: #3D5010;      /* 더 진한 그린 (hover, active) */
  --primary-light: #6B8A1E;     /* 밝은 그린 (배경) */

  /* Background & Surface */
  --background: #F0E6DA;         /* 베이지 배경 */
  --surface: #FEFDFB;            /* 카드/서피스 색상 */
  --sidebar-bg: #FFFFFF;         /* 사이드바 배경 (데스크톱) */

  /* Text Colors */
  --text-primary: #2C2C2C;       /* 주요 텍스트 */
  --text-secondary: #8E8E93;     /* 보조 텍스트 */

  /* Border & Divider */
  --border-color: #E5E5E0;       /* 테두리 색상 */

  /* Shadows */
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.15);

  /* Status Colors */
  --success: #34C759;
  --warning: #FF9500;
  --error: #FF3B30;
}
```

### Tailwind 설정

```javascript
// tailwind.config.js
colors: {
  'ios-green': '#4F6815',        // Primary
  'ios-green-dark': '#3D5010',   // Primary Dark
  'ios-green-light': '#6B8A1E',  // Primary Light
  'surface': '#F0E6DA',           // Background
  'surface-light': '#FEFDFB',     // Surface/Card
  'text-primary': '#2C2C2C',
  'text-secondary': '#8E8E93',
  'border-gray': '#E5E5E0',
}
```

### 타이포그래피

```css
/* 폰트 패밀리 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Pro Display', 'Noto Sans KR', sans-serif;

/* 폰트 크기 */
--text-xs: 12px;      /* 작은 레이블, 메타 정보 */
--text-sm: 13px;      /* 보조 텍스트 */
--text-base: 14px;    /* 기본 텍스트 */
--text-lg: 16px;      /* 부제목 */
--text-xl: 20px;      /* 섹션 제목 */
--text-2xl: 24px;     /* 페이지 제목 */
--text-3xl: 32px;     /* 대형 제목 */
```

### 레이아웃

#### 데스크톱 (1024px+)
- **사이드바 (260px)** + 메인 콘텐츠
- 사이드바: 로고, 네비게이션, "계속 읽기" 위젯, 사용자 프로필
- 메인: 콘텐츠 영역

#### 모바일 (<1024px)
- **전체 화면** 콘텐츠
- **하단 탭바** (고정)

#### 반응형 Breakpoints
```javascript
sm: '640px',   // 모바일 가로
md: '768px',   // 태블릿
lg: '1024px',  // 데스크톱 시작
xl: '1280px',  // 큰 데스크톱
```

### 컴포넌트 스타일 가이드

#### 버튼
```css
/* Primary Button */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### 카드
```css
.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

#### 책 카드
```css
.book-card {
  cursor: pointer;
  transition: all 0.3s;
}

.book-cover {
  aspect-ratio: 2/3;
  border-radius: 8px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-card:hover .book-cover {
  box-shadow: var(--shadow-lg);
}
```

#### 진행률 바
```css
.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 애니메이션

```css
/* 페이지 전환 */
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 모달 등장 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 로딩 스피너 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 🗄️ 데이터베이스 스키마

### 핵심 테이블 구조

#### 1. profiles (사용자 프로필)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS 정책:**
- SELECT: 본인만 조회
- UPDATE: 본인만 수정

#### 2. books (책 마스터 데이터)
```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  published_date DATE,
  cover_image_url TEXT,
  description TEXT,
  page_count INTEGER,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS 정책:**
- SELECT: 모든 사용자 조회 가능
- INSERT/UPDATE/DELETE: 서버에서만 처리 (service_role)

#### 3. reading_books (읽고 있는/읽은 책)
```sql
CREATE TABLE reading_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('wishlist', 'reading', 'completed')),
  current_page INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);
```

**주요 결정사항:**
- `status` 필드로 위시리스트, 읽는 중, 완독 상태 통합 관리
- 별도 wishlist 테이블 불필요 (단순화)
- user_id + book_id 유니크 제약 (중복 등록 방지)

**RLS 정책:**
- SELECT: 본인 데이터만 조회
- INSERT: 본인 user_id로만 생성
- UPDATE/DELETE: 본인 데이터만 수정/삭제

#### 4. reading_records (독서 기록)
```sql
CREATE TABLE reading_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_book_id UUID NOT NULL REFERENCES reading_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  page_number INTEGER NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS 정책:**
- SELECT: 본인 데이터만 조회
- INSERT: 본인 user_id로만 생성
- UPDATE/DELETE: 본인 데이터만 수정/삭제

#### 5. reading_photos (독서 기록 사진)
```sql
CREATE TABLE reading_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_record_id UUID NOT NULL REFERENCES reading_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Supabase Storage:**
- Bucket: `reading-photos`
- 경로: `{user_id}/{record_id}/{filename}`
- 정책: 본인만 업로드/조회/삭제 가능

#### 6. reading_quotes (인상 깊은 구절)
```sql
CREATE TABLE reading_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_record_id UUID NOT NULL REFERENCES reading_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  page_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. book_reviews (완독 후 리뷰)
```sql
CREATE TABLE book_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_book_id UUID NOT NULL REFERENCES reading_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  one_liner TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);
```

---

## 🎨 UI/UX 설계

### 네비게이션 구조

#### 탭바 (모바일 하단 고정)
1. 🏠 홈 (Home) - `/`
2. 🔍 검색 (Search) - `/search`
3. 💫 위시리스트 (Wishlist) - `/wishlist`
4. 👤 프로필 (Profile) - `/profile`

#### 사이드바 (데스크톱 왼쪽 고정)
- **로고 영역**: 📚 독독
- **네비게이션 메뉴**:
  - 홈
  - 검색
  - 위시리스트
  - 프로필
- **"계속 읽기" 위젯**: 현재 읽고 있는 책 1개 표시
- **사용자 프로필 위젯**: 아바타 + 이름 + 설정 버튼

### 주요 화면 구조

#### 홈 화면 (`/`)
1. **읽고 있는 책 섹션**
   - 그리드 레이아웃 (auto-fill)
   - 책 카드: 표지 + 제목 + 진행률
   - 빈 상태: "+ 등록하기" 버튼

2. **최근 독서 기록 섹션**
   - 타임라인 형태
   - 날짜, 책 제목, 요약 문장

3. **완독한 책 섹션**
   - 그리드 레이아웃
   - 책 카드: 표지 + 제목 + 평점
   - "전체 보기" 버튼

#### 검색 화면 (`/search`)
- 검색 바 (Aladin API 연동)
- 검색 결과 리스트
- 책 상세 모달
- "위시리스트 추가" / "읽기 시작" 버튼

#### 위시리스트 화면 (`/wishlist`)
- 위시리스트 책 목록 (status='wishlist')
- 정렬 옵션: 추가순, 제목순, 작가순
- "읽기 시작" 버튼 → status를 'reading'으로 변경

#### 프로필 화면 (`/profile`)
- 사용자 정보 (이름, 이메일, 아바타)
- 독서 통계 카드:
  - 이번 달 읽은 책 수
  - 누적 페이지 수
  - 평균 평점
- 그래프/차트
- 로그아웃 버튼

#### 독서 기록 화면 (`/reading/:id`)
- 책 정보 표시
- 현재 진행률
- 기록 작성 폼:
  - 페이지 입력
  - 감상 메모
  - 사진 첨부
  - 인상 깊은 구절
- 과거 기록 타임라인
- 마지막 페이지 입력 → 자동 완독 전환

#### 완독 리뷰 모달
- 평점 (별점 1-5)
- 리뷰 텍스트
- 한줄평
- 키워드 태그
- 완료 버튼 → reading_books.status = 'completed'

---

## 📝 API 설계 규칙

### 엔드포인트 네이밍

#### 책 관련
```
GET    /api/v1/books                    # 책 목록 조회 (검색)
GET    /api/v1/books/:id                # 책 상세 조회
POST   /api/v1/books                    # 책 등록 (Aladin API로부터)
```

#### 읽고 있는 책
```
GET    /api/v1/reading-books            # 읽고 있는 책 목록
  - ?status=wishlist                     # 위시리스트
  - ?status=reading                      # 읽는 중
  - ?status=completed                    # 완독
GET    /api/v1/reading-books/:id        # 특정 읽고 있는 책 조회
POST   /api/v1/reading-books            # 책 등록 (읽기 시작/위시리스트)
PATCH  /api/v1/reading-books/:id        # 상태 업데이트 (진행률, 완독 등)
DELETE /api/v1/reading-books/:id        # 등록 취소
```

#### 독서 기록
```
GET    /api/v1/reading-records          # 독서 기록 목록
  - ?reading_book_id={id}                # 특정 책의 기록
POST   /api/v1/reading-records          # 독서 기록 작성
GET    /api/v1/reading-records/:id      # 특정 기록 조회
PATCH  /api/v1/reading-records/:id      # 기록 수정
DELETE /api/v1/reading-records/:id      # 기록 삭제
```

#### 사진
```
POST   /api/v1/reading-photos           # 사진 업로드
DELETE /api/v1/reading-photos/:id       # 사진 삭제
```

#### 리뷰
```
GET    /api/v1/reviews                  # 리뷰 목록
  - ?reading_book_id={id}                # 특정 책 리뷰
POST   /api/v1/reviews                  # 리뷰 작성
PATCH  /api/v1/reviews/:id              # 리뷰 수정
DELETE /api/v1/reviews/:id              # 리뷰 삭제
```

#### 프로필 및 통계
```
GET    /api/v1/profile                  # 내 프로필 조회
PATCH  /api/v1/profile                  # 프로필 수정
GET    /api/v1/profile/statistics       # 독서 통계
```

### 인증

모든 API는 Bearer 토큰 인증:
```
Authorization: Bearer <supabase_jwt_token>
```

### 페이지네이션

```typescript
// 요청
GET /api/v1/reading-books?page=1&limit=20

// 응답
{
  success: true,
  data: {
    items: [...],
    pagination: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5
    }
  }
}
```

### 에러 처리

```typescript
{
  success: false,
  error: {
    code: 'BOOK_NOT_FOUND',
    message: '책을 찾을 수 없습니다',
    details: {
      bookId: 'abc-123'
    }
  }
}
```

**에러 코드 예시:**
- `UNAUTHORIZED`: 인증 실패
- `FORBIDDEN`: 권한 없음
- `NOT_FOUND`: 리소스 없음
- `VALIDATION_ERROR`: 입력 검증 실패
- `ALREADY_EXISTS`: 이미 존재함 (중복)
- `INTERNAL_ERROR`: 서버 오류

---

## 🔧 개발 환경 설정

### 로컬 개발

**프론트엔드**
```bash
cd /Users/dev/독독/dockdock/frontend
npm install
npm run dev  # http://localhost:5173
```

**백엔드**
```bash
cd /Users/dev/독독/dockdock/backend
npm install
npm run dev  # http://localhost:3000
```

### 환경 변수

**Frontend (.env)**
```bash
VITE_SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000  # 로컬 개발
# VITE_API_BASE_URL=https://dockdock-production.up.railway.app  # 프로덕션
```

**Backend (.env)**
```bash
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALADIN_API_KEY=your_aladin_api_key
```

### 배포

**Railway (백엔드)**
- nixpacks.toml 사용
- GitHub 연동 자동 배포
- 환경 변수 설정 필수

**Netlify (프론트엔드)**
- Vite 빌드
- 환경 변수 설정 필수
- Redirects 설정 (SPA)

---

## 🚀 Git 워크플로우

### 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 설정 등
```

---

## 💡 기술적 결정사항

### 1. 위시리스트 구현
- ✅ **결정**: reading_books 테이블의 status 필드 사용 ('wishlist' | 'reading' | 'completed')
- **이유**: 테이블 단순화, 상태 전환 용이, 중복 데이터 방지
- **장점**: 하나의 책이 위시리스트 → 읽는 중 → 완독으로 자연스럽게 전환

### 2. 네비게이션 구조
- ✅ **결정**: 반응형 네비게이션 (데스크톱 사이드바 + 모바일 탭바)
- **이유**: 각 디바이스에 최적화된 UX 제공
- **구현**: Tailwind breakpoints (lg:) 활용

### 3. 파일 업로드
- ✅ **결정**: Supabase Storage 사용
- **이유**: Supabase 생태계 통합, RLS 정책 적용 가능, CDN 제공
- **정책**:
  - Bucket: `reading-photos`
  - 본인만 업로드/조회/삭제
  - 클라이언트 리사이징 (max 1200px) 후 업로드

### 4. 상태 관리
- ✅ **결정**: Zustand (클라이언트) + React Query (서버)
- **이유**: 경량화, 보일러플레이트 최소화, 캐싱 및 동기화 자동화
- **역할 분담**:
  - Zustand: 인증 상태, UI 상태 (모달, 토스트)
  - React Query: 서버 데이터 (책, 기록, 리뷰)

### 5. 이미지 처리
- ✅ **결정**: 클라이언트 리사이징 후 업로드
- **이유**: 서버 부하 감소, 빠른 업로드, 스토리지 비용 절감
- **라이브러리**: browser-image-compression

### 6. 디자인 시스템
- ✅ **결정**: `/Users/dev/독독/mockup` 디자인 참고
- **색상**: #4F6815 (primary), #F0E6DA (background)
- **레이아웃**: 데스크톱 사이드바 + 모바일 탭바
- **애니메이션**: CSS transitions + keyframes

---

## ⚠️ 주의사항

### 1. 커밋 전 확인사항
- .env 파일이 .gitignore에 포함되어 있는지 확인
- API 키나 시크릿이 코드에 하드코딩되지 않았는지 확인
- TypeScript 에러가 없는지 확인 (`npm run build`)
- ESLint 경고 확인 (`npm run lint`)

### 2. 배포 전 체크리스트
- 환경 변수가 모두 설정되어 있는지 확인
- CORS 설정이 올바른지 확인
- Swagger 문서가 최신 상태인지 확인
- 프로덕션 빌드 테스트 (`npm run build && npm run preview`)

### 3. iOS 개발자 협업
- API 변경 시 Slack/Discord로 즉시 공유
- Swagger 문서 업데이트 필수
- Breaking change는 버전 업그레이드 고려 (/api/v2/...)

### 4. 데이터베이스 마이그레이션
- Supabase Dashboard에서 직접 수정
- SQL 마이그레이션 파일 백업
- RLS 정책 변경 시 테스트 필수

---

## 📚 참고 문서

- [기능 구조 정리](/Users/dev/독독/dockdock/기능구조정리.md)
- [OAuth 설정 가이드](/Users/dev/독독/dockdock/OAUTH_SETUP.md)
- [Mockup 디자인](/Users/dev/독독/mockup/web-mockup.html)
- [Swagger API 문서](https://dockdock-production.up.railway.app/api-docs/)
- [Supabase Dashboard](https://supabase.com/dashboard/project/xshxbphonupqlhypglfu)
- [Railway Dashboard](https://railway.app/)
- [Netlify Dashboard](https://app.netlify.com/)

---

## 🔄 개발 로드맵

### Phase 1: 디자인 시스템 및 기초 (현재)
- [x] CLAUDE.md 생성
- [ ] Tailwind 색상 업데이트
- [ ] 공통 컴포넌트 생성
- [ ] 반응형 레이아웃

### Phase 2: 핵심 플로우
- [ ] 백엔드 API 구조 개선
- [ ] 책 등록 플로우
- [ ] 홈 화면
- [ ] 독서 기록
- [ ] 완독 리뷰

### Phase 3: 부가 기능
- [ ] 위시리스트
- [ ] 프로필 통계
- [ ] 사진 첨부

### Phase 4: 최적화 및 배포
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] PWA 지원
- [ ] 프로덕션 배포

---

**마지막 업데이트**: 2025-10-11
**버전**: 1.0.0
