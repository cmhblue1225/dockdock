# 소셜 로그인 설정 가이드 (Kakao & Apple)

독독(DockDock) 애플리케이션에서 카카오와 애플 소셜 로그인을 사용하려면 Supabase 프로젝트에서 OAuth 설정이 필요합니다.

## 📋 목차

1. [Supabase 기본 설정](#1-supabase-기본-설정)
2. [카카오 OAuth 설정](#2-카카오-oauth-설정)
3. [애플 OAuth 설정](#3-애플-oauth-설정)
4. [테스트](#4-테스트)

---

## 1. Supabase 기본 설정

### 1.1 Supabase 대시보드 접속

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택: `xshxbphonupqlhypglfu`

### 1.2 사이트 URL 설정

1. **Settings** → **Authentication** 이동
2. **Site URL** 설정:
   - 개발: `http://localhost:5173`
   - 프로덕션: 실제 배포 URL (예: `https://dockdock.com`)

3. **Redirect URLs** 추가:
   ```
   http://localhost:5173/auth/callback
   https://your-production-domain.com/auth/callback
   ```

---

## 2. 카카오 OAuth 설정

### 2.1 카카오 개발자 콘솔에서 앱 등록

1. [Kakao Developers](https://developers.kakao.com/) 접속 및 로그인
2. **내 애플리케이션** 메뉴에서 **애플리케이션 추가하기** 클릭
3. 앱 이름: `독독 (DockDock)`
4. 회사명: 회사/개인 정보 입력

### 2.2 플랫폼 등록

1. 생성한 앱 선택 → **플랫폼** 메뉴
2. **Web 플랫폼 등록** 클릭
3. **사이트 도메인** 입력:
   - 개발: `http://localhost:5173`
   - 프로덕션: `https://your-production-domain.com`

### 2.3 Redirect URI 설정

1. **제품 설정** → **카카오 로그인** 메뉴
2. **Redirect URI 등록** 클릭
3. Supabase 콜백 URL 입력:
   ```
   https://xshxbphonupqlhypglfu.supabase.co/auth/v1/callback
   ```

### 2.4 동의 항목 설정

1. **제품 설정** → **카카오 로그인** → **동의항목** 메뉴
2. 필수 동의 항목 설정:
   - ✅ **닉네임** (필수)
   - ✅ **이메일** (필수)
   - ⬜ 프로필 사진 (선택)

### 2.5 Supabase에 카카오 OAuth 설정

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Kakao** 찾기 → **Enable** 토글
3. 카카오 개발자 콘솔의 **앱 설정** → **앱 키**에서 정보 복사:
   - **Client ID**: REST API 키
   - **Client Secret**: 카카오 개발자 콘솔 → **제품 설정** → **카카오 로그인** → **보안** → **Client Secret** 발급 및 복사
4. Supabase에 입력 후 **Save** 클릭

---

## 3. 애플 OAuth 설정

### 3.1 Apple Developer 계정 필요

⚠️ **주의**: Apple OAuth는 **Apple Developer Program** 멤버십이 필요합니다 (연간 $99).

### 3.2 App ID 생성

1. [Apple Developer Portal](https://developer.apple.com/account/) 접속
2. **Certificates, Identifiers & Profiles** 이동
3. **Identifiers** → **+** 버튼 클릭
4. **App IDs** 선택 → **Continue**
5. 정보 입력:
   - **Description**: `DockDock App`
   - **Bundle ID**: `com.dockdock.app` (고유한 값 사용)
6. **Capabilities**에서 **Sign In with Apple** 체크
7. **Continue** → **Register**

### 3.3 Services ID 생성

1. **Identifiers** → **+** 버튼 클릭
2. **Services IDs** 선택 → **Continue**
3. 정보 입력:
   - **Description**: `DockDock Web Service`
   - **Identifier**: `com.dockdock.service` (고유한 값)
4. **Sign In with Apple** 체크
5. **Configure** 클릭:
   - **Primary App ID**: 앞서 만든 App ID 선택
   - **Domains and Subdomains**: `xshxbphonupqlhypglfu.supabase.co`
   - **Return URLs**: `https://xshxbphonupqlhypglfu.supabase.co/auth/v1/callback`
6. **Save** → **Continue** → **Register**

### 3.4 Key 생성

1. **Keys** → **+** 버튼 클릭
2. **Key Name**: `DockDock Sign In Key`
3. **Sign In with Apple** 체크 → **Configure** 클릭
4. **Primary App ID** 선택 → **Save**
5. **Continue** → **Register**
6. **Download** 버튼으로 `.p8` 파일 다운로드
7. ⚠️ **Key ID** 기록 (다시 볼 수 없음)

### 3.5 Team ID 확인

1. Apple Developer Portal 우측 상단 계정 클릭
2. **Membership** 정보에서 **Team ID** 확인 및 기록

### 3.6 Supabase에 Apple OAuth 설정

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Apple** 찾기 → **Enable** 토글
3. 정보 입력:
   - **Client ID**: Services ID (예: `com.dockdock.service`)
   - **Client Secret**: 생성 필요 (아래 참고)
   - **Team ID**: 앞서 기록한 Team ID
   - **Key ID**: 앞서 기록한 Key ID
   - **Private Key**: 다운로드한 `.p8` 파일 내용 전체 복사

4. **Client Secret 생성 방법**:
   - Supabase가 자동으로 JWT를 생성하므로, Private Key만 정확히 입력하면 됩니다.
   - 또는 [jwt.io](https://jwt.io/) 에서 수동 생성:
     - Algorithm: ES256
     - Header:
       ```json
       {
         "alg": "ES256",
         "kid": "YOUR_KEY_ID"
       }
       ```
     - Payload:
       ```json
       {
         "iss": "YOUR_TEAM_ID",
         "iat": 1234567890,
         "exp": 1234567890,
         "aud": "https://appleid.apple.com",
         "sub": "com.dockdock.service"
       }
       ```

5. **Save** 클릭

---

## 4. 테스트

### 4.1 로컬 테스트

1. 프론트엔드 개발 서버 실행:
   ```bash
   cd /Users/dev/독독/dockdock/frontend
   npm run dev
   ```

2. `http://localhost:5173/login` 접속

3. **카카오 로그인** 또는 **Apple로 로그인** 버튼 클릭

4. OAuth 인증 플로우 진행:
   - 카카오/애플 로그인 페이지로 리다이렉트
   - 로그인 및 동의
   - `/auth/callback`으로 리다이렉트
   - 홈페이지(`/`)로 자동 이동

### 4.2 확인 사항

#### Supabase 대시보드에서 확인:

1. **Authentication** → **Users** 메뉴
2. 새로운 사용자 확인 (OAuth provider 표시)

#### 데이터베이스에서 확인:

1. **Table Editor** → **profiles** 테이블
2. 새로운 프로필이 자동 생성되었는지 확인

### 4.3 문제 해결

#### 카카오 로그인 실패

- **오류**: "Redirect URI mismatch"
  - **해결**: 카카오 개발자 콘솔의 Redirect URI가 정확한지 확인
  - 올바른 형식: `https://xshxbphonupqlhypglfu.supabase.co/auth/v1/callback`

- **오류**: "Invalid client_id"
  - **해결**: Supabase의 Client ID가 카카오의 REST API 키와 일치하는지 확인

#### 애플 로그인 실패

- **오류**: "invalid_client"
  - **해결**: Services ID, Team ID, Key ID가 모두 정확한지 확인
  - Private Key (.p8 파일)가 올바르게 복사되었는지 확인

- **오류**: "redirect_uri_mismatch"
  - **해결**: Services ID 설정의 Return URLs 확인

#### 프로필 생성 실패

- **오류**: 로그인은 되지만 홈페이지에서 오류 발생
  - **해결**: 데이터베이스 트리거가 정상 작동하는지 확인
  - Supabase SQL Editor에서 실행:
    ```sql
    SELECT * FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created';
    ```

---

## 📝 추가 참고 자료

### 카카오
- [Kakao Developers 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Kakao 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

### 애플
- [Sign in with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Configuring Your Webpage](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple)

### Supabase
- [Supabase Auth with OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

## ✅ 체크리스트

설정 완료 확인:

- [ ] Supabase Site URL 설정
- [ ] Supabase Redirect URLs 추가
- [ ] 카카오 앱 생성 및 플랫폼 등록
- [ ] 카카오 Redirect URI 설정
- [ ] 카카오 동의 항목 설정
- [ ] Supabase에 카카오 OAuth 설정
- [ ] Apple Developer 계정 확인
- [ ] Apple App ID 생성
- [ ] Apple Services ID 생성
- [ ] Apple Key 생성 및 다운로드
- [ ] Supabase에 Apple OAuth 설정
- [ ] 로컬 테스트 성공
- [ ] 프로필 자동 생성 확인

모든 항목을 완료하면 소셜 로그인이 정상 작동합니다! 🎉
