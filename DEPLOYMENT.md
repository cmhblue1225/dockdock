# 🚀 독독 (DockDock) 배포 가이드

Render.com을 사용한 독독 프로젝트 배포 가이드입니다.

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

## 🌐 Render.com 배포 (추천)

### Option 1: Blueprint로 한 번에 배포 (추천)

#### 1. Render.com 계정 생성
- https://dashboard.render.com/ 접속
- GitHub으로 로그인

#### 2. Blueprint로 배포
```
1. Dashboard → "New" → "Blueprint"
2. GitHub 저장소 연결: cmhblue1225/dockdock
3. Blueprint 파일: render.yaml (자동 감지됨)
4. "Apply" 클릭
```

#### 3. 환경 변수 설정

**백엔드 서비스 (dockdock-api):**
```
SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Settings → Service Role Key)
ALADIN_API_KEY=your_aladin_api_key
FRONTEND_URL=https://dockdock-web.onrender.com (프론트엔드 URL로 교체)
```

**프론트엔드 서비스 (dockdock-web):**
```
VITE_SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://dockdock-api.onrender.com (백엔드 URL로 교체)
```

#### 4. 배포 완료 확인
```
✅ 백엔드: https://dockdock-api.onrender.com
   - Health Check: https://dockdock-api.onrender.com/health
   - Swagger: https://dockdock-api.onrender.com/api-docs

✅ 프론트엔드: https://dockdock-web.onrender.com
```

---

### Option 2: 수동으로 개별 배포

Blueprint 대신 수동으로 배포하려면:

#### 백엔드 배포
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
4. 환경 변수 추가 (위 참고)
5. "Create Web Service"
```

#### 프론트엔드 배포
```
1. Dashboard → "New" → "Static Site"
2. GitHub 저장소 연결
3. 설정:
   - Name: dockdock-web
   - Region: Singapore
   - Branch: main
   - Root Directory: frontend
   - Build Command: npm install && npm run build
   - Publish Directory: dist
4. 환경 변수 추가 (위 참고)
5. "Create Static Site"
```

---

## 🔧 배포 후 설정

### 1. Supabase CORS 설정

Supabase Dashboard에서 허용된 도메인 추가:
```
1. Project Settings → API → Configuration
2. Site URL: https://dockdock-web.onrender.com
3. Additional Redirect URLs:
   - https://dockdock-web.onrender.com/auth/callback
```

### 2. CORS 확인

백엔드의 CORS 설정이 프론트엔드 URL을 허용하는지 확인:
```javascript
// backend/src/index.ts
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 3. 환경 변수 업데이트

배포 후 실제 URL로 환경 변수 업데이트:

**백엔드 (dockdock-api):**
```
FRONTEND_URL=https://dockdock-web.onrender.com
```

**프론트엔드 (dockdock-web):**
```
VITE_API_BASE_URL=https://dockdock-api.onrender.com
```

> ⚠️ 환경 변수를 변경하면 서비스가 자동으로 재배포됩니다.

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

### Free Tier 제한사항

Render.com Free Tier는 다음 제한이 있습니다:
- **15분 동안 요청이 없으면 서버가 Sleep 모드로 전환**
- 첫 요청 시 Cold Start로 30초~1분 소요
- 월 750시간 무료 (1개 서비스 24/7 운영 가능)

**해결책:**
- 프로덕션 환경에서는 Paid Plan ($7/month) 사용 권장
- 또는 주기적으로 Health Check 요청 (UptimeRobot 등)

### 빌드 실패 시

**에러: 환경 변수 누락**
```
해결: Render Dashboard → Service → Environment에서 모든 환경 변수 확인
```

**에러: CORS 오류**
```
해결: 백엔드 FRONTEND_URL 환경 변수를 프론트엔드 URL로 설정
```

**에러: Supabase 연결 실패**
```
해결: SUPABASE_URL과 키들이 정확한지 확인
```

### 로그 확인
```
Render Dashboard → 서비스 선택 → "Logs" 탭
```

---

## 🔄 재배포

코드 변경 후 재배포:
```bash
git add .
git commit -m "변경 사항 설명"
git push origin main
```

Render가 자동으로 감지하고 재배포합니다.

수동 재배포:
```
Render Dashboard → 서비스 선택 → "Manual Deploy" → "Deploy latest commit"
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

### 백엔드 (dockdock-api)
| 변수명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| NODE_ENV | ✅ | 환경 (자동 설정) | production |
| PORT | ✅ | 포트 (자동 설정) | 10000 |
| SUPABASE_URL | ✅ | Supabase 프로젝트 URL | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | ✅ | Supabase Anon Key | eyJhbGc... |
| SUPABASE_SERVICE_KEY | ✅ | Supabase Service Role Key | eyJhbGc... |
| ALADIN_API_KEY | ✅ | 알라딘 API Key | ttb... |
| FRONTEND_URL | ✅ | 프론트엔드 URL (CORS) | https://dockdock-web.onrender.com |

### 프론트엔드 (dockdock-web)
| 변수명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| VITE_SUPABASE_URL | ✅ | Supabase 프로젝트 URL | https://xxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | ✅ | Supabase Anon Key | eyJhbGc... |
| VITE_API_BASE_URL | ✅ | 백엔드 API URL | https://dockdock-api.onrender.com |

---

## ✅ 배포 체크리스트

- [ ] GitHub에 코드 푸시 완료
- [ ] Supabase 환경 변수 확인
- [ ] Aladin API Key 확인
- [ ] Render.com Blueprint 배포
- [ ] 백엔드 환경 변수 설정
- [ ] 프론트엔드 환경 변수 설정
- [ ] 백엔드 Health Check 확인
- [ ] 프론트엔드 접속 확인
- [ ] Swagger 문서 확인
- [ ] 회원가입/로그인 테스트
- [ ] Supabase CORS 설정
- [ ] iOS 개발자에게 API URL 공유

---

**배포 완료 후 URL:**
- 🌐 프론트엔드: https://dockdock-web.onrender.com
- 🔌 백엔드 API: https://dockdock-api.onrender.com
- 📚 API 문서: https://dockdock-api.onrender.com/api-docs
