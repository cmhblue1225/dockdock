# 독독 (DockDock) 프로젝트 가이드라인

**마지막 업데이트**: 2025-10-13
**버전**: 1.2.0
**프로젝트 상태**: ✅ MVP 배포 완료, 활발히 개발 중

---

## 📋 프로젝트 개요

**독독(DockDock)**은 독서 기록 및 관리 플랫폼으로, 사용자가 읽고 있는 책을 등록하고 독서 과정을 기록하며, AI 기반 개인화 추천을 받을 수 있는 서비스입니다.

### 🌐 배포 URL

- **프론트엔드**: https://dockdock.minhyuk.kr
- **백엔드 API**: https://dockdock-production.up.railway.app
- **API 문서**: https://dockdock-production.up.railway.app/api-docs

### 기술 스택

#### 프론트엔드 (Web)
- **React 19** + TypeScript
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **React Router 7** (라우팅)
- **TanStack Query** (React Query v5) - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **Framer Motion** - 애니메이션
- **배포**: Netlify

#### 백엔드
- **Node.js 18+** + TypeScript
- **Express.js** - REST API 서버
- **Swagger/OpenAPI 3.0** - API 문서화 (모든 엔드포인트에 Swift 예시 포함!)
- **알라딘 API** - 책 검색 및 정보
- **OpenAI API** (GPT-4o) - AI 기반 책 추천
- **배포**: Railway

#### 데이터베이스 & 인증
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **프로젝트 ID**: `xshxbphonupqlhypglfu`
- **리전**: ap-northeast-2 (서울)
- **Row Level Security (RLS)** 적용

#### iOS 앱 (동시 개발 중)
- Native iOS 앱이 동시에 개발되고 있음
- 백엔드 API는 Web과 iOS 모두 지원
- **모든 API에 Swift 코드 예시 포함** ✨

---

## 🚀 최근 완료된 작업 (2025-10-13)

### ✅ Swift 코드 예시 추가 (완료)
- 모든 Swagger API 엔드포인트에 상세한 Swift 구현 예시 추가
- Service 레이어, ViewModel, SwiftUI View 완전한 예시 포함
- iOS 개발자가 바로 사용 가능한 프로덕션 레벨 코드

### ✅ 추천 시스템 구현 (완료)
- **AI 기반 개인화 추천**: OpenAI GPT-4o 활용
- **트렌딩 책 추천**: 실시간 인기 책 추천
- **유사 책 추천**: 책 기반 유사도 추천
- 캐싱 시스템 (24시간)

### ✅ 온보딩 시스템 (완료)
- 사용자 선호도 수집 (장르, 작가, 독서 목적 등)
- 확장된 선호도 분석 (독서 속도, 분위기, 감정, 테마)
- AI 기반 온보딩 리포트 생성

### ✅ 버그 수정
- 추천 책 상세 조회 404 오류 수정 (aladinId 필드 추가)
- Swagger 문서 GitHub 링크 404 오류 수정
- auth.routes.ts JSDoc 구문 오류 수정

---

## 🎯 핵심 기능 현황

### ✅ 완료된 기능

#### 1. 인증 시스템
- [x] 이메일 회원가입/로그인
- [x] 소셜 로그인 (Apple, Kakao) - iOS용 완전 구현
- [x] JWT 토큰 인증
- [x] 토큰 검증 및 갱신
- [x] 비밀번호 재설정
- [x] 회원 탈퇴

#### 2. 책 검색 및 관리
- [x] 알라딘 API 연동 (제목, 저자, ISBN 검색)
- [x] 책 상세 정보 조회
- [x] 통합 검색 (제목/ISBN 자동 판별)
- [x] 책 데이터베이스 저장 (중복 방지)

#### 3. 독서 목록 관리
- [x] 위시리스트 추가/삭제
- [x] 읽기 시작
- [x] 진행률 업데이트
- [x] 완독 처리
- [x] 상태별 필터링 (wishlist, reading, completed)

#### 4. 독서 기록 시스템
- [x] 독서 기록 작성 (날짜, 페이지, 메모)
- [x] 사진 첨부 (Supabase Storage)
- [x] 인상 깊은 구절 저장
- [x] 기록 수정/삭제
- [x] 타임라인 조회

#### 5. 리뷰 시스템
- [x] 완독 후 리뷰 작성
- [x] 별점 (1-5)
- [x] 한줄평
- [x] 키워드 태그
- [x] 리뷰 수정/삭제

#### 6. AI 추천 시스템
- [x] 개인화 추천 (독서 이력 기반)
- [x] 트렌딩 책 추천
- [x] 유사 책 추천
- [x] 캐싱 시스템 (성능 최적화)
- [x] 추천 새로고침

#### 7. 온보딩 시스템
- [x] 사용자 선호도 수집
- [x] AI 기반 온보딩 리포트 생성
- [x] 확장된 선호도 분석

#### 8. 파일 업로드
- [x] Supabase Storage 연동
- [x] 이미지 리사이징 (클라이언트)
- [x] RLS 정책 적용

### 🔄 개발 중

- [ ] 독서 통계 대시보드
- [ ] 소셜 기능 (친구, 공유)
- [ ] 독서 챌린지
- [ ] 독서 목표 설정
- [ ] 알림 시스템

---

## 🎯 개발 원칙

### 1. API-First 설계 ⭐

iOS 앱 개발이 동시에 진행되므로, 모든 API는 **API-First** 원칙으로 설계:

- **RESTful API 설계**: 명확한 리소스 기반 엔드포인트
- **완벽한 Swagger 문서화**: https://dockdock-production.up.railway.app/api-docs
  - ✅ **모든 엔드포인트에 Swift 코드 예시 포함**
  - ✅ Service 레이어, ViewModel, SwiftUI View 완전 구현
  - ✅ 에러 처리, 인증, 네트워킹 패턴
  - iOS 개발자가 복사해서 바로 사용 가능!
- **버전 관리**: `/api/v1/...` 형태
- **일관된 응답 형식**:
  ```typescript
  // 성공
  {
    success: true,
    data: T,
    message?: string
  }

  // 에러
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
- 프론트엔드와 백엔드 간 타입 공유
- Swagger 스키마와 TypeScript 타입 일치

### 3. 보안 우선

- **Supabase Auth 기반 인증**: JWT 토큰
- **RLS 정책**: 모든 테이블에 적용
- **입력 검증**: 서버 측 검증
- **환경 변수 관리**: .env 파일 (절대 커밋 금지)

### 4. 성능 최적화

- **React Query 캐싱**: staleTime, cacheTime 적절히 설정
- **이미지 최적화**: 클라이언트 리사이징, lazy loading
- **코드 스플리팅**: React.lazy, Suspense
- **API 캐싱**: 추천 시스템 24시간 캐싱

---

## 🗄️ 데이터베이스 스키마

### 핵심 테이블

#### 1. profiles (사용자)
```sql
- id: UUID (auth.users 참조)
- email: TEXT
- display_name: TEXT
- avatar_url: TEXT
- created_at, updated_at: TIMESTAMP
```

#### 2. books (책 마스터)
```sql
- id: UUID
- isbn, isbn13: TEXT
- title: TEXT (필수)
- author, publisher: TEXT
- cover_image_url: TEXT
- page_count: INTEGER
- description: TEXT
- category: TEXT
- aladin_id: TEXT (알라딘 상품 ID) ⭐ 중요!
- created_at: TIMESTAMP
```

#### 3. reading_books (독서 목록)
```sql
- id: UUID
- user_id: UUID → profiles
- book_id: UUID → books
- status: TEXT (wishlist | reading | completed)
- current_page: INTEGER
- start_date, end_date: DATE
- created_at, updated_at: TIMESTAMP
- UNIQUE(user_id, book_id)
```

#### 4. reading_records (독서 기록)
```sql
- id: UUID
- reading_book_id: UUID → reading_books
- user_id: UUID → profiles
- record_date: DATE
- page_number: INTEGER
- content: TEXT
- created_at, updated_at: TIMESTAMP
```

#### 5. reading_photos (독서 사진)
```sql
- id: UUID
- reading_record_id: UUID → reading_records
- user_id: UUID → profiles
- photo_url: TEXT
- caption: TEXT
- created_at: TIMESTAMP
```

#### 6. reading_quotes (인용구)
```sql
- id: UUID
- reading_record_id: UUID → reading_records
- user_id: UUID → profiles
- quote_text: TEXT
- page_number: INTEGER
- created_at: TIMESTAMP
```

#### 7. book_reviews (리뷰)
```sql
- id: UUID
- reading_book_id: UUID → reading_books
- user_id: UUID → profiles
- book_id: UUID → books
- rating: INTEGER (1-5)
- review_text: TEXT
- one_liner: TEXT
- tags: TEXT[]
- created_at, updated_at: TIMESTAMP
- UNIQUE(user_id, book_id)
```

#### 8. user_preferences (사용자 선호도)
```sql
- id: UUID
- user_id: UUID → profiles
- preferred_genres: TEXT[]
- preferred_authors: TEXT[]
- reading_purposes: TEXT[]
- preferred_length: TEXT
- reading_pace: TEXT
- preferred_difficulty: TEXT
- preferred_moods: TEXT[]
- preferred_emotions: TEXT[]
- narrative_styles: TEXT[]
- preferred_themes: TEXT[]
- onboarding_completed: BOOLEAN
- created_at, updated_at: TIMESTAMP
```

#### 9. recommendations (추천 캐시)
```sql
- id: UUID
- user_id: UUID → profiles
- book_id: UUID → books
- recommendation_type: TEXT (personalized | trending | similar)
- score: NUMERIC
- reason: TEXT
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
```

#### 10. trending_books (트렌딩)
```sql
- id: UUID
- book_id: UUID → books
- rank: INTEGER
- score: NUMERIC
- period: TEXT (daily | weekly)
- updated_at: TIMESTAMP
```

---

## 📝 주요 API 엔드포인트

### 인증 (`/api/auth`)
```
POST   /signup              # 회원가입
POST   /login               # 로그인
POST   /logout              # 로그아웃
POST   /social-login        # 소셜 로그인 (Apple, Kakao)
POST   /verify-token        # 토큰 검증
GET    /me                  # 현재 사용자 조회
POST   /reset-password      # 비밀번호 재설정
DELETE /account             # 회원 탈퇴
```

### 책 (`/api/v1/books`)
```
GET    /search              # 책 검색 (제목, 저자 등)
GET    /isbn/:isbn          # ISBN으로 검색
GET    /:bookId             # 책 상세 조회 (알라딘 ID)
POST   /                    # 책 DB 저장
GET    /                    # 통합 검색
```

### 독서 목록 (`/api/v1/reading-books`)
```
GET    /                    # 목록 조회 (?status=wishlist/reading/completed)
POST   /                    # 추가 (위시리스트/읽기 시작)
GET    /:id                 # 상세 조회
PATCH  /:id                 # 업데이트 (진행률, 상태 변경)
DELETE /:id                 # 삭제
GET    /:id/with-details    # 상세 정보 포함 조회
```

### 독서 기록 (`/api/v1/reading-records`)
```
POST   /                    # 기록 작성
GET    /                    # 목록 조회 (?reading_book_id=xxx)
GET    /:id                 # 상세 조회
PATCH  /:id                 # 수정
DELETE /:id                 # 삭제
```

### 리뷰 (`/api/v1/reviews`)
```
POST   /                    # 리뷰 작성
GET    /                    # 목록 조회
GET    /:id                 # 상세 조회
PATCH  /:id                 # 수정
DELETE /:id                 # 삭제
```

### 사진 (`/api/v1/photos`)
```
POST   /upload              # 사진 업로드
GET    /                    # 목록 조회
DELETE /:id                 # 삭제
```

### 추천 (`/api/v1/recommendations`)
```
GET    /personalized        # 개인화 추천 (?limit=10&force_refresh=false)
GET    /trending            # 트렌딩 책 (?limit=10)
GET    /similar/:bookId     # 유사 책 추천 (?limit=5)
POST   /refresh             # 추천 새로고침
```

### 온보딩 (`/api/v1/onboarding`)
```
POST   /preferences         # 선호도 저장
GET    /preferences         # 선호도 조회
POST   /complete            # 온보딩 완료
POST   /report              # 온보딩 리포트 생성
```

---

## 🎨 디자인 시스템

### 색상 팔레트

```css
:root {
  /* Primary */
  --primary: #4F6815;           /* 올리브 그린 */
  --primary-dark: #3D5010;
  --primary-light: #6B8A1E;

  /* Background */
  --background: #F0E6DA;         /* 베이지 */
  --surface: #FEFDFB;            /* 카드 */

  /* Text */
  --text-primary: #2C2C2C;
  --text-secondary: #8E8E93;

  /* Border */
  --border-color: #E5E5E0;

  /* Shadows */
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### Tailwind 설정

```javascript
colors: {
  'ios-green': '#4F6815',
  'background': '#F0E6DA',
  'surface': '#FEFDFB',
  'text-primary': '#2C2C2C',
  'text-secondary': '#8E8E93',
  'border-color': '#E5E5E0',
}
```

### 레이아웃

- **데스크톱 (1024px+)**: 사이드바(260px) + 메인 콘텐츠
- **모바일 (<1024px)**: 전체 화면 + 하단 탭바

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
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3000
```

**Backend (.env)**
```bash
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALADIN_API_KEY=your_aladin_key
OPENAI_API_KEY=your_openai_key
```

### 배포

- **Railway (백엔드)**: GitHub 자동 배포
- **Netlify (프론트엔드)**: GitHub 자동 배포

---

## 💡 중요한 기술적 결정사항

### 1. 추천 시스템 ID 처리 ⭐ 중요!

**문제**: 추천 API와 책 상세 API 간 ID 불일치
- 추천 API는 데이터베이스 UUID `id` 반환
- 책 상세 API는 알라딘 상품 ID 기대

**해결**:
- `books` 테이블에 `aladin_id` 컬럼 추가
- 추천 응답에 `aladinId` 필드 포함
- 프론트엔드에서 `book.aladinId || book.id` 사용

**관련 파일**:
- `backend/src/services/recommendation.service.ts`
- `backend/src/types/recommendation.types.ts`
- `frontend/src/types/recommendation.ts`
- `frontend/src/pages/SearchPage.tsx`

### 2. Swagger 문서 Swift 예시

**모든 API 엔드포인트에 Swift 구현 예시 포함**:
- Service 레이어 (async/await)
- ViewModel (ObservableObject, @Published)
- SwiftUI View
- Codable 모델
- 에러 처리

iOS 개발자가 복사해서 바로 사용 가능!

### 3. 상태 관리

- **Zustand**: 인증 상태, UI 상태
- **React Query**: 서버 데이터 (캐싱, 자동 재검증)

### 4. 파일 업로드

- **Supabase Storage**: `reading-photos` 버킷
- **클라이언트 리사이징**: browser-image-compression
- **RLS 정책**: 본인만 업로드/조회/삭제

---

## ⚠️ 주의사항

### 커밋 전 확인
- [ ] .env 파일이 .gitignore에 있는지 확인
- [ ] API 키가 하드코딩되지 않았는지 확인
- [ ] TypeScript 에러 없는지 확인 (`npm run build`)
- [ ] 테스트 (있다면)

### 배포 전 체크리스트
- [ ] 환경 변수 모두 설정
- [ ] CORS 설정 확인
- [ ] Swagger 문서 최신화
- [ ] 프로덕션 빌드 테스트

### iOS 개발자 협업
- API 변경 시 즉시 공유
- Swagger 문서 업데이트 필수
- Breaking change는 버전 업그레이드 고려

---

## 📚 유용한 링크

### 문서
- [Swagger API 문서](https://dockdock-production.up.railway.app/api-docs)
- [기능 구조 정리](/Users/dev/독독/dockdock/기능구조정리.md)
- [OAuth 설정](/Users/dev/독독/dockdock/OAUTH_SETUP.md)
- [Mockup 디자인](/Users/dev/독독/mockup/web-mockup.html)

### 대시보드
- [Supabase](https://supabase.com/dashboard/project/xshxbphonupqlhypglfu)
- [Railway](https://railway.app)
- [Netlify](https://app.netlify.com)

### 프로덕션
- **Frontend**: https://dockdock.minhyuk.kr
- **Backend**: https://dockdock-production.up.railway.app
- **API Docs**: https://dockdock-production.up.railway.app/api-docs

---

## 🔄 다음 작업 제안

### 우선순위 높음
- [ ] 독서 통계 대시보드 구현
- [ ] 실시간 알림 시스템
- [ ] 성능 최적화 (이미지 lazy loading)
- [ ] 에러 바운더리 추가

### 우선순위 중간
- [ ] PWA 지원 (오프라인 모드)
- [ ] SEO 최적화
- [ ] 소셜 공유 기능
- [ ] 독서 챌린지

### 우선순위 낮음
- [ ] 다크 모드
- [ ] 다국어 지원
- [ ] 독서 목표 설정
- [ ] 친구 시스템

---

## 🎯 프로젝트 구조

```
dockdock/
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── stores/        # Zustand 스토어
│   │   ├── lib/           # API 클라이언트, 유틸
│   │   └── types/         # TypeScript 타입
│   └── public/
│
├── backend/               # Express 백엔드
│   ├── src/
│   │   ├── routes/        # API 라우트
│   │   ├── controllers/   # 컨트롤러
│   │   ├── services/      # 비즈니스 로직
│   │   ├── middleware/    # 미들웨어
│   │   ├── types/         # TypeScript 타입
│   │   └── utils/         # 유틸리티
│   └── swagger/           # Swagger 설정
│
├── mockup/                # 디자인 목업
└── CLAUDE.md             # 이 문서!
```

---

## 🐛 알려진 이슈 및 해결

### ✅ 해결됨
1. **추천 책 상세 조회 404 오류** (2025-10-13 해결)
   - 원인: ID 불일치 (DB UUID vs 알라딘 ID)
   - 해결: `aladinId` 필드 추가

2. **Swagger GitHub 링크 404** (2025-10-13 해결)
   - 원인: 존재하지 않는 문서 링크
   - 해결: 링크 제거 및 안내 문구로 대체

3. **auth.routes.ts 컴파일 오류** (2025-10-13 해결)
   - 원인: JSDoc 내 `/* */` 주석
   - 해결: `//` 주석으로 변경

---

**이 문서를 통해 프로젝트에 빠르게 온보딩하고 개발을 시작할 수 있습니다!** 🚀

궁금한 점이 있다면 Swagger 문서를 먼저 확인하세요: https://dockdock-production.up.railway.app/api-docs
