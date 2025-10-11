# 🚀 독독 (DockDock) 배포 가이드

Netlify(프론트엔드) + Render(백엔드)를 사용한 독독 프로젝트 배포 가이드입니다.

---

## 📋 배포 전 준비사항

### 1. GitHub 저장소 푸시
```bash
cd /Users/dev/독독/dockdock
git add .
git commit -m "feat: 로그인 기능 및 배포 설정 완료"
git push -u origin main
```

### 2. 필요한 환경 변수 값 준비

다음 값들을 미리 준비해두세요:

#### Supabase (필수)
```
SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc... (Supabase Dashboard에서 확인)
```

#### Aladin API (필수)
```
ALADIN_API_KEY=your_aladin_api_key
```

---

## 🌐 배포 아키텍처

```
┌─────────────────┐
│  Netlify        │  ← 프론트엔드 (React)
│  Static Site    │     https://dockdock.netlify.app
└────────┬────────┘
         │ API 요청
         ↓
┌─────────────────┐
│  Render         │  ← 백엔드 (Express API)
│  Web Service    │     https://dockdock-api.onrender.com
└─────────────────┘
```

---

## 🎨 프론트엔드 배포 (Netlify)

### 1. Netlify 계정 생성
- https://app.netlify.com/ 접속
- GitHub으로 로그인

### 2. 새 사이트 생성
```
1. Dashboard → "Add new site" → "Import an existing project"
2. GitHub 연결 → 저장소 선택: cmhblue1225/dockdock
3. 배포 설정:
   - Base directory: frontend
   - Build command: npm run build
   - Publish directory: frontend/dist
4. "Deploy site" 클릭
```

### 3. 환경 변수 설정
```
1. Site settings → Environment variables
2. 다음 변수들 추가:
```

**필수 환경 변수:**
```
VITE_SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://dockdock-api.onrender.com
```

### 4. 도메인 설정 (선택)
```
1. Site settings → Domain management
2. Custom domain 설정 또는 Netlify 서브도메인 사용
   예: dockdock.netlify.app
```

### 5. 재배포
환경 변수 추가 후 재배포:
```
Deploys → Trigger deploy → Deploy site
```

---

## 🔌 백엔드 배포 (Render)

### 1. Render 계정 생성
- https://dashboard.render.com/ 접속
- GitHub으로 로그인

### 2. 백엔드 서비스 생성

#### Option A: Blueprint 사용 (추천)
```
1. Dashboard → "New" → "Blueprint"
2. GitHub 저장소 연결: cmhblue1225/dockdock
3. render.yaml 자동 감지
4. "Apply" 클릭
```

#### Option B: 수동 생성
```
1. Dashboard → "New" → "Web Service"
2. GitHub 저장소 연결
3. 설정:
   - Name: dockdock-api
   - Region: Singapore
   - Branch: main
   - Root Directory: backend
   - Environment: Node
   - Build Command: npm install && npm run build
   - Start Command: npm start
   - Instance Type: Free
```

### 3. 환경 변수 설정
```
Dashboard → dockdock-api → Environment
```

**필수 환경 변수:**
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ALADIN_API_KEY=ttb...
FRONTEND_URL=https://dockdock.netlify.app
```

⚠️ `FRONTEND_URL`은 Netlify 배포 후 실제 URL로 업데이트하세요!

---

## 🔧 배포 후 설정

### 1. 프론트엔드 환경 변수 업데이트

Netlify에서 백엔드 URL 업데이트:
```
Site settings → Environment variables → VITE_API_BASE_URL 편집
VITE_API_BASE_URL=https://dockdock-api.onrender.com
```

### 2. Supabase CORS 설정

Supabase Dashboard에서 허용된 도메인 추가:
```
1. Project Settings → API → Configuration
2. Site URL: https://dockdock.netlify.app
3. Additional Redirect URLs:
   - https://dockdock.netlify.app/auth/callback
```

### 3. 백엔드 CORS 확인

`backend/src/index.ts`의 CORS 설정이 Netlify URL을 허용하는지 확인:
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
```

Render 환경 변수에서 `FRONTEND_URL`이 Netlify URL로 설정되어 있어야 합니다.

---

## 📱 iOS 개발자에게 공유할 정보

### API 엔드포인트
```
Base URL: https://dockdock-api.onrender.com

📚 API 문서: https://dockdock-api.onrender.com/api-docs
❤️ Health Check: https://dockdock-api.onrender.com/health
```

### 인증 API
```
POST /api/auth/signup          - 회원가입
POST /api/auth/login           - 로그인
POST /api/auth/logout          - 로그아웃
POST /api/auth/verify-token    - 토큰 검증
GET  /api/auth/me              - 현재 사용자
POST /api/auth/reset-password  - 비밀번호 재설정
POST /api/auth/social-login    - 소셜 로그인 (iOS용)
```

### 책 검색 API
```
GET  /api/books/search         - 책 검색 (제목, 저자)
GET  /api/books/isbn/:isbn     - ISBN으로 검색
GET  /api/books/:bookId        - 책 상세 조회
GET  /api/books                - 통합 검색
```

### 인증 헤더
```http
Authorization: Bearer {access_token}
```

---

## 🐛 트러블슈팅

### Netlify 빌드 실패

**에러: 환경 변수 누락**
```
해결: Site settings → Environment variables에서 모든 VITE_ 변수 확인
```

**에러: 404 on reload**
```
해결: netlify.toml에 리다이렉트 규칙이 있는지 확인
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Render 백엔드 문제

**에러: CORS 오류**
```
해결: Render 환경 변수 FRONTEND_URL을 Netlify URL로 설정
```

**에러: Cold Start (첫 요청 느림)**
```
원인: Render Free Tier는 15분 동안 요청이 없으면 Sleep
해결:
  1. Paid Plan 사용 ($7/month)
  2. UptimeRobot으로 주기적 Health Check
```

### Supabase 연결 실패
```
해결: SUPABASE_URL과 키들이 정확한지 확인
```

### 로그 확인
```
Netlify: Site → Deploys → 배포 선택 → Deploy log
Render: Dashboard → 서비스 선택 → Logs 탭
```

---

## 🔄 재배포

### 프론트엔드 (Netlify)
```bash
# 코드 변경 후
git add .
git commit -m "변경 사항"
git push origin main
# Netlify가 자동으로 감지하고 재배포
```

수동 재배포:
```
Netlify Dashboard → Deploys → Trigger deploy
```

### 백엔드 (Render)
```bash
# 코드 변경 후
git add .
git commit -m "변경 사항"
git push origin main
# Render가 자동으로 감지하고 재배포
```

수동 재배포:
```
Render Dashboard → Manual Deploy → Deploy latest commit
```

---

## 📊 모니터링

### Health Check
```bash
# 백엔드
curl https://dockdock-api.onrender.com/health

# 예상 응답
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "environment": "production"
}
```

### API 테스트
```bash
# 회원가입
curl -X POST https://dockdock-api.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"테스터"}'

# 로그인
curl -X POST https://dockdock-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📝 환경 변수 전체 목록

### 프론트엔드 (Netlify)
| 변수명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| VITE_SUPABASE_URL | ✅ | Supabase 프로젝트 URL | https://xxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | ✅ | Supabase Anon Key | eyJhbGc... |
| VITE_API_BASE_URL | ✅ | 백엔드 API URL | https://dockdock-api.onrender.com |

### 백엔드 (Render)
| 변수명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| NODE_ENV | ✅ | 환경 | production |
| PORT | ✅ | 포트 (자동) | 10000 |
| SUPABASE_URL | ✅ | Supabase 프로젝트 URL | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | ✅ | Supabase Anon Key | eyJhbGc... |
| SUPABASE_SERVICE_KEY | ✅ | Supabase Service Role Key | eyJhbGc... |
| ALADIN_API_KEY | ✅ | 알라딘 API Key | ttb... |
| FRONTEND_URL | ✅ | 프론트엔드 URL (CORS) | https://dockdock.netlify.app |

---

## ✅ 배포 체크리스트

- [ ] GitHub에 코드 푸시 완료
- [ ] Netlify 사이트 생성
- [ ] Netlify 환경 변수 설정
- [ ] Netlify 배포 성공
- [ ] Render 백엔드 생성
- [ ] Render 환경 변수 설정
- [ ] Render 배포 성공
- [ ] 프론트엔드에서 백엔드 URL 업데이트
- [ ] 백엔드에서 프론트엔드 URL 업데이트
- [ ] Supabase CORS 설정
- [ ] Health Check API 확인
- [ ] Swagger 문서 확인
- [ ] 회원가입/로그인 테스트
- [ ] 책 검색 테스트
- [ ] iOS 개발자에게 API URL 공유

---

## 🎯 배포 완료 후 URL

**프론트엔드:**
- 🌐 웹사이트: https://dockdock.netlify.app

**백엔드:**
- 🔌 API: https://dockdock-api.onrender.com
- 📚 API 문서: https://dockdock-api.onrender.com/api-docs
- ❤️ Health Check: https://dockdock-api.onrender.com/health

---

## 💰 비용

### Netlify
- **Free Tier**: 100GB 대역폭/월, 300 빌드 분/월
- 무료로 충분히 사용 가능

### Render
- **Free Tier**: 750시간/월 (1개 서비스 24/7 운영 가능)
- ⚠️ 15분 동안 요청이 없으면 Sleep (Cold Start)
- **Starter Plan**: $7/월 (Sleep 없음, 추천)

---

**배포 완료! 🎉**
