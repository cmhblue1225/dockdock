# ✅ 배포 체크리스트

Render.com에 독독 프로젝트를 배포하기 전 확인해야 할 사항들입니다.

---

## 📦 배포 전 로컬 확인

### 1. 코드 빌드 테스트
```bash
# 백엔드 빌드 테스트
cd backend
npm run build
# dist/ 폴더가 생성되고 에러가 없는지 확인

# 프론트엔드 빌드 테스트
cd ../frontend
npm run build
# dist/ 폴더가 생성되고 에러가 없는지 확인
```

- [ ] 백엔드 빌드 성공 (dist/ 폴더 생성됨)
- [ ] 프론트엔드 빌드 성공 (dist/ 폴더 생성됨)
- [ ] TypeScript 컴파일 에러 없음

### 2. 로컬 환경 테스트
```bash
# 백엔드
cd backend
npm run dev
# → http://localhost:3000 접속 확인
# → http://localhost:3000/api-docs Swagger 확인
# → http://localhost:3000/health Health Check 확인

# 프론트엔드
cd frontend
npm run dev
# → http://localhost:5173 접속 확인
```

- [ ] 백엔드 서버 정상 실행
- [ ] Swagger 문서 정상 표시
- [ ] Health Check API 정상 응답
- [ ] 프론트엔드 정상 로드
- [ ] 회원가입/로그인 테스트 성공
- [ ] 책 검색 기능 테스트 성공

---

## 🔑 환경 변수 준비

### Supabase 키 확인
```
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: xshxbphonupqlhypglfu
3. Settings → API
```

- [ ] SUPABASE_URL 복사: `https://xshxbphonupqlhypglfu.supabase.co`
- [ ] SUPABASE_ANON_KEY 복사 (anon / public)
- [ ] SUPABASE_SERVICE_KEY 복사 (service_role - 주의!)

### Aladin API 키 확인
```
/Users/dev/독독/dockdock/backend/.env 파일에서 확인
또는 /Users/dev/독독/apis/.env 파일에서 확인
```

- [ ] ALADIN_API_KEY 준비됨

### 환경 변수 목록 작성
다음 값들을 메모장에 정리:

**백엔드 (dockdock-api):**
```
SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
ALADIN_API_KEY=ttb...
FRONTEND_URL=https://dockdock-web.onrender.com
```

**프론트엔드 (dockdock-web):**
```
VITE_SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_BASE_URL=https://dockdock-api.onrender.com
```

---

## 📤 GitHub 푸시

### 1. Git 상태 확인
```bash
cd /Users/dev/독독/dockdock
git status
```

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음 (커밋되지 않음)
- [ ] `node_modules/` 폴더가 제외되어 있음

### 2. 커밋 및 푸시
```bash
git add .
git commit -m "feat: 로그인 기능 및 Render 배포 설정 완료"
git push -u origin main
```

- [ ] GitHub 저장소에 코드 푸시 완료
- [ ] https://github.com/cmhblue1225/dockdock 에서 확인

---

## 🌐 Render.com 배포

### 1. Render 계정 생성/로그인
```
1. https://dashboard.render.com/ 접속
2. GitHub 계정으로 로그인
```

- [ ] Render 계정 생성/로그인 완료

### 2. Blueprint로 배포
```
1. Dashboard → "New" → "Blueprint"
2. GitHub 저장소 연결: cmhblue1225/dockdock
3. Blueprint 파일: render.yaml (자동 감지)
4. "Apply" 클릭
5. 배포 시작 (5-10분 소요)
```

- [ ] Blueprint 배포 시작됨
- [ ] 백엔드 서비스 (dockdock-api) 생성됨
- [ ] 프론트엔드 서비스 (dockdock-web) 생성됨

### 3. 백엔드 환경 변수 설정
```
1. Dashboard → dockdock-api 선택
2. "Environment" 탭 클릭
3. 아래 변수들 추가:
```

**추가할 환경 변수:**
```
SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_KEY=your_key_here
ALADIN_API_KEY=your_key_here
FRONTEND_URL=https://dockdock-web.onrender.com
```

- [ ] 모든 백엔드 환경 변수 설정 완료
- [ ] "Save Changes" 클릭
- [ ] 자동 재배포 대기

### 4. 프론트엔드 환경 변수 설정
```
1. Dashboard → dockdock-web 선택
2. "Environment" 탭 클릭
3. 아래 변수들 추가:
```

**추가할 환경 변수:**
```
VITE_SUPABASE_URL=https://xshxbphonupqlhypglfu.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_API_BASE_URL=https://dockdock-api.onrender.com
```

- [ ] 모든 프론트엔드 환경 변수 설정 완료
- [ ] "Save Changes" 클릭
- [ ] 자동 재배포 대기

### 5. 배포 URL 확인
```
배포 완료 후 Render Dashboard에서 URL 확인:
```

- [ ] 백엔드 URL: `https://dockdock-api.onrender.com`
- [ ] 프론트엔드 URL: `https://dockdock-web.onrender.com`

---

## 🧪 배포 후 테스트

### 1. 백엔드 API 테스트
```bash
# Health Check
curl https://dockdock-api.onrender.com/health

# 예상 응답:
# {"success":true,"message":"Server is running","timestamp":"...","environment":"production"}
```

- [ ] Health Check API 정상 응답
- [ ] Swagger 문서 접속: `https://dockdock-api.onrender.com/api-docs`
- [ ] Swagger에서 인증 API 테스트 성공

### 2. 프론트엔드 테스트
```
브라우저에서 접속: https://dockdock-web.onrender.com
```

- [ ] 프론트엔드 정상 로드
- [ ] 로그인 페이지 표시
- [ ] 회원가입 기능 테스트
- [ ] 로그인 기능 테스트
- [ ] 로그인 후 홈 페이지 이동
- [ ] 책 검색 기능 테스트

### 3. 통합 테스트
```bash
# 회원가입
curl -X POST https://dockdock-api.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"테스터"}'

# 로그인
curl -X POST https://dockdock-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 책 검색
curl "https://dockdock-api.onrender.com/api/books/search?query=클린코드&maxResults=5"
```

- [ ] 회원가입 API 정상 작동
- [ ] 로그인 API 정상 작동 (토큰 반환)
- [ ] 책 검색 API 정상 작동

---

## 🔧 배포 후 설정

### 1. Supabase CORS 설정
```
1. Supabase Dashboard → Project Settings → API
2. Site URL 설정: https://dockdock-web.onrender.com
3. Additional Redirect URLs 추가:
   - https://dockdock-web.onrender.com/auth/callback
4. "Save" 클릭
```

- [ ] Supabase Site URL 설정 완료
- [ ] Redirect URLs 설정 완료

### 2. 환경 변수 최종 확인
배포된 URL로 환경 변수를 다시 업데이트했는지 확인:

- [ ] 백엔드 `FRONTEND_URL` = `https://dockdock-web.onrender.com`
- [ ] 프론트엔드 `VITE_API_BASE_URL` = `https://dockdock-api.onrender.com`

---

## 📱 iOS 개발자에게 공유

### 1. API 정보 전달
**이메일/Slack 메시지 작성:**

```
안녕하세요,

독독 백엔드 API가 배포 완료되었습니다.

🌐 Base URL: https://dockdock-api.onrender.com
📚 API 문서: https://dockdock-api.onrender.com/api-docs
❤️ Health Check: https://dockdock-api.onrender.com/health

주요 엔드포인트:
- POST /api/auth/signup - 회원가입
- POST /api/auth/login - 로그인
- POST /api/auth/social-login - 소셜 로그인 (iOS용)
- POST /api/auth/verify-token - 토큰 검증
- GET /api/auth/me - 현재 사용자
- GET /api/books/search - 책 검색
- GET /api/books/isbn/:isbn - ISBN 검색

모든 보호된 API는 다음 헤더가 필요합니다:
Authorization: Bearer {access_token}

테스트 계정:
- Email: test@example.com
- Password: password123

상세 문서는 Swagger에서 확인해주세요.
```

- [ ] iOS 개발자에게 API 정보 전달 완료

---

## 🎯 최종 확인

### 배포 완료 체크
- [ ] ✅ 백엔드 배포 성공
- [ ] ✅ 프론트엔드 배포 성공
- [ ] ✅ 모든 환경 변수 설정 완료
- [ ] ✅ Supabase CORS 설정 완료
- [ ] ✅ Health Check API 정상
- [ ] ✅ Swagger 문서 접근 가능
- [ ] ✅ 회원가입/로그인 기능 작동
- [ ] ✅ 책 검색 기능 작동
- [ ] ✅ iOS 개발자에게 정보 공유

### 배포된 서비스 URL
```
🌐 프론트엔드: https://dockdock-web.onrender.com
🔌 백엔드 API: https://dockdock-api.onrender.com
📚 API 문서: https://dockdock-api.onrender.com/api-docs
```

---

## ⚠️ 주의사항

### Render Free Tier 제한
- **15분 동안 요청이 없으면 Sleep 모드**
- 첫 요청 시 Cold Start (30초~1분 소요)
- 월 750시간 무료 (1개 서비스 24/7 운영 가능)

### 프로덕션 권장사항
- Paid Plan 사용 ($7/month per service)
- 또는 UptimeRobot으로 주기적 Health Check

### 문제 발생 시
1. Render Dashboard → 서비스 선택 → "Logs" 탭에서 로그 확인
2. 환경 변수 재확인
3. 수동 재배포: "Manual Deploy" → "Deploy latest commit"

---

**🎉 배포 완료! 수고하셨습니다!**
