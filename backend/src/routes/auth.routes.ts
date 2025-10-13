import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [Authentication]
 *     description: |
 *       이메일과 비밀번호로 새 계정을 생성합니다
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - AuthService.swift
 *
 *       struct SignUpRequest: Encodable {
 *           let email: String
 *           let password: String
 *           let displayName: String?
 *       }
 *
 *       struct AuthResponse: Codable {
 *           let user: User
 *           let session: Session
 *       }
 *
 *       struct User: Codable {
 *           let id: String
 *           let email: String
 *           let user_metadata: UserMetadata?
 *       }
 *
 *       struct UserMetadata: Codable {
 *           let display_name: String?
 *       }
 *
 *       struct Session: Codable {
 *           let access_token: String
 *           let refresh_token: String
 *       }
 *
 *       func signUp(email: String, password: String, displayName: String? = nil) async throws -> AuthResponse {
 *           let request = SignUpRequest(
 *               email: email,
 *               password: password,
 *               displayName: displayName
 *           )
 *
 *           let response: AuthResponse = try await NetworkManager.shared.request(
 *               endpoint: .auth,
 *               path: "/signup",
 *               method: "POST",
 *               body: request
 *           )
 *
 *           // 토큰을 Keychain에 저장
 *           try await KeychainManager.shared.saveToken(response.session.access_token)
 *           try await KeychainManager.shared.saveRefreshToken(response.session.refresh_token)
 *
 *           return response
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class SignUpViewModel: ObservableObject {
 *           @Published var email: String = ""
 *           @Published var password: String = ""
 *           @Published var confirmPassword: String = ""
 *           @Published var displayName: String = ""
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *           @Published var isSignedUp = false
 *
 *           func signUp() async {
 *               guard validateInput() else { return }
 *
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   let response = try await AuthService.shared.signUp(
 *                       email: email,
 *                       password: password,
 *                       displayName: displayName.isEmpty ? nil : displayName
 *                   )
 *
 *                   // 사용자 정보 저장
 *                   UserDefaults.standard.set(response.user.id, forKey: "userId")
 *                   UserDefaults.standard.set(response.user.email, forKey: "userEmail")
 *
 *                   isSignedUp = true
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isLoading = false
 *           }
 *
 *           private func validateInput() -> Bool {
 *               guard !email.isEmpty else {
 *                   errorMessage = "이메일을 입력해주세요"
 *                   return false
 *               }
 *
 *               guard email.contains("@") && email.contains(".") else {
 *                   errorMessage = "올바른 이메일 형식이 아닙니다"
 *                   return false
 *               }
 *
 *               guard password.count >= 6 else {
 *                   errorMessage = "비밀번호는 6자 이상이어야 합니다"
 *                   return false
 *               }
 *
 *               guard password == confirmPassword else {
 *                   errorMessage = "비밀번호가 일치하지 않습니다"
 *                   return false
 *               }
 *
 *               return true
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct SignUpView: View {
 *           @StateObject private var viewModel = SignUpViewModel()
 *           @Environment(\.dismiss) private var dismiss
 *
 *           var body: some View {
 *               NavigationView {
 *                   Form {
 *                       Section {
 *                           TextField("이메일", text: $viewModel.email)
 *                               .textContentType(.emailAddress)
 *                               .keyboardType(.emailAddress)
 *                               .autocapitalization(.none)
 *
 *                           SecureField("비밀번호 (6자 이상)", text: $viewModel.password)
 *                               .textContentType(.newPassword)
 *
 *                           SecureField("비밀번호 확인", text: $viewModel.confirmPassword)
 *                               .textContentType(.newPassword)
 *                       } header: {
 *                           Text("계정 정보")
 *                       }
 *
 *                       Section {
 *                           TextField("이름 (선택사항)", text: $viewModel.displayName)
 *                               .textContentType(.name)
 *                       } header: {
 *                           Text("프로필")
 *                       }
 *
 *                       if let error = viewModel.errorMessage {
 *                           Section {
 *                               Text(error)
 *                                   .foregroundColor(.red)
 *                                   .font(.caption)
 *                           }
 *                       }
 *
 *                       Section {
 *                           Button {
 *                               Task {
 *                                   await viewModel.signUp()
 *                               }
 *                           } label: {
 *                               HStack {
 *                                   Spacer()
 *                                   if viewModel.isLoading {
 *                                       ProgressView()
 *                                   } else {
 *                                       Text("가입하기")
 *                                   }
 *                                   Spacer()
 *                               }
 *                           }
 *                           .disabled(viewModel.isLoading)
 *                       }
 *                   }
 *                   .navigationTitle("회원가입")
 *                   .navigationBarTitleDisplayMode(.inline)
 *                   .toolbar {
 *                       ToolbarItem(placement: .cancellationAction) {
 *                           Button("취소") {
 *                               dismiss()
 *                           }
 *                       }
 *                   }
 *                   .onChange(of: viewModel.isSignedUp) { _, isSignedUp in
 *                       if isSignedUp {
 *                           dismiss()
 *                       }
 *                   }
 *               }
 *           }
 *       }
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               displayName:
 *                 type: string
 *                 example: 홍길동
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/signup', authController.signUp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Authentication]
 *     description: |
 *       이메일과 비밀번호로 로그인합니다
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - AuthService.swift
 *
 *       struct LoginRequest: Encodable {
 *           let email: String
 *           let password: String
 *       }
 *
 *       func signIn(email: String, password: String) async throws -> AuthResponse {
 *           let request = LoginRequest(email: email, password: password)
 *
 *           let response: AuthResponse = try await NetworkManager.shared.request(
 *               endpoint: .auth,
 *               path: "/login",
 *               method: "POST",
 *               body: request
 *           )
 *
 *           // 토큰을 Keychain에 저장
 *           try await KeychainManager.shared.saveToken(response.session.access_token)
 *           try await KeychainManager.shared.saveRefreshToken(response.session.refresh_token)
 *
 *           // 사용자 정보 저장
 *           UserDefaults.standard.set(response.user.id, forKey: "userId")
 *           UserDefaults.standard.set(response.user.email, forKey: "userEmail")
 *
 *           return response
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class LoginViewModel: ObservableObject {
 *           @Published var email: String = ""
 *           @Published var password: String = ""
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *           @Published var isLoggedIn = false
 *
 *           func login() async {
 *               guard !email.isEmpty && !password.isEmpty else {
 *                   errorMessage = "이메일과 비밀번호를 입력해주세요"
 *                   return
 *               }
 *
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   _ = try await AuthService.shared.signIn(
 *                       email: email,
 *                       password: password
 *                   )
 *                   isLoggedIn = true
 *               } catch {
 *                   if let apiError = error as? APIError {
 *                       switch apiError {
 *                       case .unauthorized:
 *                           errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다"
 *                       default:
 *                           errorMessage = error.localizedDescription
 *                       }
 *                   } else {
 *                       errorMessage = error.localizedDescription
 *                   }
 *               }
 *
 *               isLoading = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct LoginView: View {
 *           @StateObject private var viewModel = LoginViewModel()
 *           @State private var showSignUp = false
 *           @State private var showResetPassword = false
 *
 *           var body: some View {
 *               NavigationView {
 *                   VStack(spacing: 20) {
 *                       // 로고 및 타이틀
 *                       VStack(spacing: 12) {
 *                           Image(systemName: "book.fill")
 *                               .font(.system(size: 60))
 *                               .foregroundColor(.blue)
 *
 *                           Text("독독")
 *                               .font(.largeTitle)
 *                               .bold()
 *
 *                           Text("나만의 독서 여정을 기록하세요")
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                       }
 *                       .padding(.top, 40)
 *
 *                       Spacer()
 *
 *                       // 로그인 폼
 *                       VStack(spacing: 16) {
 *                           TextField("이메일", text: $viewModel.email)
 *                               .textContentType(.emailAddress)
 *                               .keyboardType(.emailAddress)
 *                               .autocapitalization(.none)
 *                               .padding()
 *                               .background(Color(.systemGray6))
 *                               .cornerRadius(10)
 *
 *                           SecureField("비밀번호", text: $viewModel.password)
 *                               .textContentType(.password)
 *                               .padding()
 *                               .background(Color(.systemGray6))
 *                               .cornerRadius(10)
 *
 *                           if let error = viewModel.errorMessage {
 *                               Text(error)
 *                                   .foregroundColor(.red)
 *                                   .font(.caption)
 *                           }
 *
 *                           Button {
 *                               Task {
 *                                   await viewModel.login()
 *                               }
 *                           } label: {
 *                               HStack {
 *                                   if viewModel.isLoading {
 *                                       ProgressView()
 *                                           .tint(.white)
 *                                   } else {
 *                                       Text("로그인")
 *                                   }
 *                               }
 *                               .frame(maxWidth: .infinity)
 *                               .padding()
 *                               .background(Color.blue)
 *                               .foregroundColor(.white)
 *                               .cornerRadius(10)
 *                           }
 *                           .disabled(viewModel.isLoading)
 *
 *                           Button("비밀번호를 잊으셨나요?") {
 *                               showResetPassword = true
 *                           }
 *                           .font(.caption)
 *                           .foregroundColor(.blue)
 *                       }
 *                       .padding(.horizontal, 32)
 *
 *                       Spacer()
 *
 *                       // 회원가입 링크
 *                       HStack {
 *                           Text("계정이 없으신가요?")
 *                               .foregroundColor(.secondary)
 *                           Button("회원가입") {
 *                               showSignUp = true
 *                           }
 *                           .foregroundColor(.blue)
 *                       }
 *                       .padding(.bottom, 40)
 *                   }
 *                   .navigationBarHidden(true)
 *                   .sheet(isPresented: $showSignUp) {
 *                       SignUpView()
 *                   }
 *                   .sheet(isPresented: $showResetPassword) {
 *                       ResetPasswordView()
 *                   }
 *               }
 *           }
 *       }
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 로그인에 성공했습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                           description: API 호출 시 사용할 JWT 토큰
 *                         refresh_token:
 *                           type: string
 *                           description: 액세스 토큰 갱신용 토큰
 *       401:
 *         description: 인증 실패
 */
router.post('/login', authController.signIn);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Authentication]
 *     description: 현재 세션을 종료합니다
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authMiddleware, authController.signOut);

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     summary: 토큰 검증
 *     tags: [Authentication]
 *     description: JWT 토큰이 유효한지 확인합니다 (iOS용)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 유효한 토큰
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 유효한 토큰입니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     profile:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/verify-token', authMiddleware, authController.verifyToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 사용자 조회
 *     tags: [Authentication]
 *     description: 인증된 사용자의 정보를 조회합니다
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         user_metadata:
 *                           type: object
 *                     profile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         display_name:
 *                           type: string
 *                         avatar_url:
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 비밀번호 재설정 요청
 *     tags: [Authentication]
 *     description: 비밀번호 재설정 이메일을 전송합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 이메일 전송 성공
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/social-login:
 *   post:
 *     summary: 소셜 로그인 (iOS용)
 *     tags: [Authentication]
 *     description: |
 *       iOS 앱에서 Apple/Kakao Sign In SDK로 얻은 ID Token을 검증하고 세션을 생성합니다.
 *
 *       **iOS 사용 방법:**
 *       1. Apple/Kakao Sign In SDK로 로그인하여 ID Token 획득
 *       2. 이 API로 ID Token 전송
 *       3. 응답에서 access_token과 refresh_token 저장
 *       4. 이후 모든 API 호출 시 Authorization 헤더에 Bearer {access_token} 포함
 *
 *       ## 📱 Swift 코드 예시 (Apple Sign In)
 *
 *       ```swift
 *       // MARK: - AuthService.swift
 *
 *       import AuthenticationServices
 *
 *       enum SocialProvider: String, Codable {
 *           case apple = "apple"
 *           case kakao = "kakao"
 *       }
 *
 *       struct SocialLoginRequest: Encodable {
 *           let provider: String
 *           let idToken: String
 *       }
 *
 *       func socialLogin(provider: SocialProvider, idToken: String) async throws -> AuthResponse {
 *           let request = SocialLoginRequest(
 *               provider: provider.rawValue,
 *               idToken: idToken
 *           )
 *
 *           let response: AuthResponse = try await NetworkManager.shared.request(
 *               endpoint: .auth,
 *               path: "/social-login",
 *               method: "POST",
 *               body: request
 *           )
 *
 *           // 토큰을 Keychain에 저장
 *           try await KeychainManager.shared.saveToken(response.session.access_token)
 *           try await KeychainManager.shared.saveRefreshToken(response.session.refresh_token)
 *
 *           // 사용자 정보 저장
 *           UserDefaults.standard.set(response.user.id, forKey: "userId")
 *           UserDefaults.standard.set(response.user.email, forKey: "userEmail")
 *
 *           return response
 *       }
 *
 *       // MARK: - Apple Sign In Manager
 *
 *       @MainActor
 *       class AppleSignInManager: NSObject, ObservableObject {
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *
 *           func signInWithApple() async throws -> AuthResponse {
 *               return try await withCheckedThrowingContinuation { continuation in
 *                   let request = ASAuthorizationAppleIDProvider().createRequest()
 *                   request.requestedScopes = [.fullName, .email]
 *
 *                   let controller = ASAuthorizationController(authorizationRequests: [request])
 *                   let delegate = AppleSignInDelegate { result in
 *                       continuation.resume(with: result)
 *                   }
 *
 *                   controller.delegate = delegate
 *                   controller.presentationContextProvider = self
 *                   controller.performRequests()
 *
 *                   // delegate를 강하게 유지
 *                   objc_setAssociatedObject(controller, "delegate", delegate, .OBJC_ASSOCIATION_RETAIN)
 *               }
 *           }
 *       }
 *
 *       // MARK: - Apple Sign In Delegate
 *
 *       class AppleSignInDelegate: NSObject, ASAuthorizationControllerDelegate {
 *           private let completion: (Result<AuthResponse, Error>) -> Void
 *
 *           init(completion: @escaping (Result<AuthResponse, Error>) -> Void) {
 *               self.completion = completion
 *           }
 *
 *           func authorizationController(
 *               controller: ASAuthorizationController,
 *               didCompleteWithAuthorization authorization: ASAuthorization
 *           ) {
 *               guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
 *                     let identityToken = credential.identityToken,
 *                     let tokenString = String(data: identityToken, encoding: .utf8) else {
 *                   completion(.failure(NSError(domain: "AppleSignIn", code: -1)))
 *                   return
 *               }
 *
 *               Task {
 *                   do {
 *                       let response = try await AuthService.shared.socialLogin(
 *                           provider: .apple,
 *                           idToken: tokenString
 *                       )
 *                       completion(.success(response))
 *                   } catch {
 *                       completion(.failure(error))
 *                   }
 *               }
 *           }
 *
 *           func authorizationController(
 *               controller: ASAuthorizationController,
 *               didCompleteWithError error: Error
 *           ) {
 *               completion(.failure(error))
 *           }
 *       }
 *
 *       extension AppleSignInManager: ASAuthorizationControllerPresentationContextProviding {
 *           func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
 *               guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
 *                     let window = scene.windows.first else {
 *                   return UIWindow()
 *               }
 *               return window
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct SocialLoginView: View {
 *           @StateObject private var appleSignInManager = AppleSignInManager()
 *           @State private var isLoggedIn = false
 *
 *           var body: some View {
 *               VStack(spacing: 16) {
 *                   // Apple로 로그인 버튼
 *                   Button {
 *                       Task {
 *                           do {
 *                               _ = try await appleSignInManager.signInWithApple()
 *                               isLoggedIn = true
 *                           } catch {
 *                               appleSignInManager.errorMessage = error.localizedDescription
 *                           }
 *                       }
 *                   } label: {
 *                       HStack {
 *                           Image(systemName: "applelogo")
 *                           Text("Apple로 로그인")
 *                       }
 *                       .frame(maxWidth: .infinity)
 *                       .padding()
 *                       .background(Color.black)
 *                       .foregroundColor(.white)
 *                       .cornerRadius(10)
 *                   }
 *                   .disabled(appleSignInManager.isLoading)
 *
 *                   if let error = appleSignInManager.errorMessage {
 *                       Text(error)
 *                           .foregroundColor(.red)
 *                           .font(.caption)
 *                   }
 *               }
 *               .padding()
 *           }
 *       }
 *
 *       // MARK: - Info.plist 설정
 *       // Apple Sign In을 사용하려면 다음 설정이 필요합니다:
 *       //
 *       // 1. Xcode에서 Signing & Capabilities 탭 선택
 *       // 2. "+ Capability" 버튼 클릭
 *       // 3. "Sign in with Apple" 선택
 *       //
 *       // 또는 프로젝트의 .entitlements 파일에 다음 추가:
 *       // <key>com.apple.developer.applesignin</key>
 *       // <array>
 *       //     <string>Default</string>
 *       // </array>
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - idToken
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [apple, kakao]
 *                 example: apple
 *               idToken:
 *                 type: string
 *                 description: Provider에서 발급한 ID Token
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6...
 *     responses:
 *       200:
 *         description: 소셜 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 소셜 로그인에 성공했습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                           description: API 호출 시 사용할 JWT 토큰
 *                         refresh_token:
 *                           type: string
 *                           description: 액세스 토큰 갱신용 토큰
 *       400:
 *         description: 잘못된 요청 또는 소셜 로그인 실패
 */
router.post('/social-login', authController.socialLogin);

/**
 * @swagger
 * /api/auth/account:
 *   delete:
 *     summary: 회원 탈퇴
 *     tags: [Authentication]
 *     description: |
 *       사용자 계정과 관련된 모든 데이터를 삭제합니다.
 *       이 작업은 되돌릴 수 없으므로 신중하게 사용해야 합니다.
 *
 *       삭제되는 데이터:
 *       - 사용자 인증 정보 (Supabase Auth)
 *       - 프로필 정보
 *       - 독서 기록 (읽는 중, 완독, 위시리스트)
 *       - 독서 노트, 사진, 인용구
 *       - 리뷰 및 평점
 *       - 사용자 선호도 및 온보딩 레포트
 *       - 추천 정보
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 회원 탈퇴가 완료되었습니다. 그동안 독독을 이용해주셔서 감사합니다.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         description: 회원 탈퇴 실패
 */
router.delete('/account', authMiddleware, authController.deleteAccount);

export default router;
