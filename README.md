# 📚 독독 (DockDock) - 독서 관리 플랫폼

책을 읽고, 기록하고, 공유하는 독서 관리 플랫폼

## 🎯 프로젝트 개요

- **플랫폼**: iOS 앱 + 웹 애플리케이션
- **데이터베이스**: Supabase (PostgreSQL)
- **외부 API**: 알라딘 Open API, OpenAI API
- **프로젝트 ID**: `xshxbphonupqlhypglfu` (서울 리전)

## 🏗️ 프로젝트 구조

```
dockdock/
├── backend/          # Express API 서버 (TypeScript)
├── frontend/         # React 웹 앱 (TypeScript + Vite + Tailwind)
├── shared/           # 공유 타입 정의 (Web + iOS)
├── CLAUDE.md         # 상세 개발 가이드
└── README.md         # 이 파일
```

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# 루트 디렉토리에서
cp .env.example .env

# Frontend 디렉토리에서
cd frontend
cp .env.example .env
```

환경 변수 파일을 열어 실제 API 키를 입력하세요.

### 2. Backend 서버 실행

```bash
cd backend
npm install
npm run dev
# → http://localhost:3000
# → Swagger: http://localhost:3000/api-docs
```

### 3. Frontend 웹 앱 실행

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## 📱 주요 기능

### 독서 관리
- 📖 독서 중인 책 관리
- 📝 독서 기록 (진행률, 메모, 사진, 인용구)
- ⭐ 독서 완료 후기 및 평점
- 📊 독서 통계 및 인사이트

### 책 검색
- 🔍 알라딘 API 통합 검색
- 📚 ISBN 조회 (바코드 스캔 지원)
- 🎯 통합 검색 (제목/ISBN 자동 판별)

### AI 기능
- 🤖 OpenAI 기반 책 추천
- 💡 독서 인사이트 생성

### 소셜 기능
- 📱 인스타그램 공유 (iOS)
- 👥 공개 후기 및 평점

## 🛠️ 기술 스택

### Backend
- Node.js + Express
- TypeScript
- Supabase (DB + Auth + Storage)
- Swagger (API 문서화)
- 알라딘 Open API
- OpenAI API

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS v3
- React Router
- React Query
- Zustand
- Supabase Client

## 📚 API 문서

Swagger UI로 모든 API 엔드포인트를 확인할 수 있습니다:

- 로컬: http://localhost:3000/api-docs
- 배포: (배포 URL)/api-docs

## 🎨 디자인

웹 목업 디자인: https://zesty-sorbet-0b01e1.netlify.app/web-mockup

**컬러 팔레트:**
- Primary: `#D4A574` (브라운/골드)
- Secondary: `#8B7355` (다크 브라운)
- Background: `#F5F5F0` (아이보리/베이지)
- iOS Green: `#5E6B3D` (올리브 그린)

## 📖 상세 문서

프로젝트 개발 가이드, API 설계, 데이터베이스 스키마 등 상세 정보는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 🔗 참고 프로젝트

- **APIs 프로젝트**: `/Users/dev/독독/apis` - 알라딘 API 통합 참고
- **Mockup 프로젝트**: `/Users/dev/독독/mockup` - 디자인 시스템 참고

## 📝 라이선스

MIT License

---

**📚 책과 함께하는 즐거운 여정**
