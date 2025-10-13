import { Router } from 'express';
import * as onboardingController from '../controllers/onboarding.controller';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/onboarding/genres:
 *   get:
 *     summary: 온보딩 장르 목록 조회
 *     tags: [Onboarding]
 *     description: |
 *       온보딩 과정에서 사용자에게 표시할 장르 목록을 조회합니다.
 *       인증이 필요하지 않습니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - OnboardingService.swift
 *
 *       struct GenreItem: Codable, Identifiable {
 *           let id: String
 *           let name: String
 *           let description: String?
 *           let icon: String?
 *       }
 *
 *       struct GenresResponse: Codable {
 *           let success: Bool
 *           let message: String
 *           let data: [GenreItem]
 *       }
 *
 *       func getOnboardingGenres() async throws -> [GenreItem] {
 *           return try await NetworkManager.shared.request(
 *               endpoint: .onboarding,
 *               path: "/genres",
 *               method: "GET",
 *               authenticated: false
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class GenreSelectionViewModel: ObservableObject {
 *           @Published var genres: [GenreItem] = []
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *
 *           func loadGenres() async {
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   genres = try await OnboardingService.shared.getOnboardingGenres()
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isLoading = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct GenreSelectionView: View {
 *           @StateObject private var viewModel = GenreSelectionViewModel()
 *
 *           var body: some View {
 *               Group {
 *                   if viewModel.isLoading {
 *                       ProgressView("장르 목록 로딩 중...")
 *                   } else if let error = viewModel.errorMessage {
 *                       VStack {
 *                           Text("오류 발생")
 *                               .font(.headline)
 *                           Text(error)
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                           Button("다시 시도") {
 *                               Task { await viewModel.loadGenres() }
 *                           }
 *                       }
 *                   } else {
 *                       ScrollView {
 *                           LazyVStack(spacing: 16) {
 *                               ForEach(viewModel.genres) { genre in
 *                                   GenreRow(genre: genre)
 *                               }
 *                           }
 *                           .padding()
 *                       }
 *                   }
 *               }
 *               .task {
 *                   await viewModel.loadGenres()
 *               }
 *           }
 *       }
 *
 *       struct GenreRow: View {
 *           let genre: GenreItem
 *
 *           var body: some View {
 *               HStack {
 *                   if let icon = genre.icon {
 *                       Text(icon)
 *                           .font(.title)
 *                   }
 *
 *                   VStack(alignment: .leading) {
 *                       Text(genre.name)
 *                           .font(.headline)
 *                       if let description = genre.description {
 *                           Text(description)
 *                               .font(.caption)
 *                               .foregroundColor(.secondary)
 *                       }
 *                   }
 *
 *                   Spacer()
 *               }
 *               .padding()
 *               .background(Color(.systemGray6))
 *               .cornerRadius(10)
 *           }
 *       }
 *       ```
 *     responses:
 *       200:
 *         description: 장르 목록 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/genres', onboardingController.getOnboardingGenres);

/**
 * @swagger
 * /api/v1/onboarding/books/{genre}:
 *   get:
 *     summary: 특정 장르의 책 목록 조회
 *     tags: [Onboarding]
 *     description: |
 *       특정 장르에 속하는 추천 책 목록을 조회합니다.
 *       온보딩 과정에서 사용자가 선호하는 책을 선택할 때 사용합니다.
 *       인증이 필요하지 않습니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - OnboardingService.swift
 *
 *       struct OnboardingBook: Codable, Identifiable {
 *           let id: String
 *           let title: String
 *           let author: String?
 *           let cover_image_url: String?
 *           let publisher: String?
 *           let description: String?
 *           let category: String?
 *       }
 *
 *       struct GenreBooksResponse: Codable {
 *           let success: Bool
 *           let message: String
 *           let data: GenreBooksData
 *       }
 *
 *       struct GenreBooksData: Codable {
 *           let genre: String
 *           let books: [OnboardingBook]
 *           let total: Int
 *       }
 *
 *       func getGenreBooks(genre: String, limit: Int = 5) async throws -> [OnboardingBook] {
 *           var components = URLComponents(string: "\(APIConfig.baseAPIURL)/onboarding/books/\(genre)")
 *           components?.queryItems = [
 *               URLQueryItem(name: "limit", value: "\(limit)")
 *           ]
 *
 *           guard let url = components?.url else {
 *               throw APIError.invalidURL
 *           }
 *
 *           var request = URLRequest(url: url)
 *           request.httpMethod = "GET"
 *
 *           let (data, response) = try await URLSession.shared.data(for: request)
 *
 *           guard let httpResponse = response as? HTTPURLResponse,
 *                 (200...299).contains(httpResponse.statusCode) else {
 *               throw APIError.serverError("Failed to fetch books")
 *           }
 *
 *           let apiResponse = try JSONDecoder().decode(
 *               GenreBooksResponse.self,
 *               from: data
 *           )
 *
 *           return apiResponse.data.books
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class GenreBooksViewModel: ObservableObject {
 *           @Published var books: [OnboardingBook] = []
 *           @Published var selectedBookIds: Set<String> = []
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *
 *           let genre: String
 *
 *           init(genre: String) {
 *               self.genre = genre
 *           }
 *
 *           func loadBooks() async {
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   books = try await OnboardingService.shared.getGenreBooks(
 *                       genre: genre,
 *                       limit: 10
 *                   )
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isLoading = false
 *           }
 *
 *           func toggleBookSelection(_ bookId: String) {
 *               if selectedBookIds.contains(bookId) {
 *                   selectedBookIds.remove(bookId)
 *               } else {
 *                   selectedBookIds.insert(bookId)
 *               }
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct GenreBooksView: View {
 *           @StateObject private var viewModel: GenreBooksViewModel
 *
 *           init(genre: String) {
 *               _viewModel = StateObject(wrappedValue: GenreBooksViewModel(genre: genre))
 *           }
 *
 *           var body: some View {
 *               VStack {
 *                   Text("\(viewModel.genre) 추천 도서")
 *                       .font(.title2)
 *                       .bold()
 *                       .padding(.top)
 *
 *                   if viewModel.isLoading {
 *                       ProgressView("책 목록 로딩 중...")
 *                           .padding()
 *                   } else if let error = viewModel.errorMessage {
 *                       VStack {
 *                           Text("오류 발생")
 *                               .font(.headline)
 *                           Text(error)
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                           Button("다시 시도") {
 *                               Task { await viewModel.loadBooks() }
 *                           }
 *                       }
 *                   } else {
 *                       ScrollView {
 *                           LazyVStack(spacing: 16) {
 *                               ForEach(viewModel.books) { book in
 *                                   BookSelectionCard(
 *                                       book: book,
 *                                       isSelected: viewModel.selectedBookIds.contains(book.id)
 *                                   ) {
 *                                       viewModel.toggleBookSelection(book.id)
 *                                   }
 *                               }
 *                           }
 *                           .padding()
 *                       }
 *                   }
 *               }
 *               .task {
 *                   await viewModel.loadBooks()
 *               }
 *           }
 *       }
 *
 *       struct BookSelectionCard: View {
 *           let book: OnboardingBook
 *           let isSelected: Bool
 *           let action: () -> Void
 *
 *           var body: some View {
 *               Button(action: action) {
 *                   HStack(spacing: 12) {
 *                       // 책 커버 이미지
 *                       AsyncImage(url: URL(string: book.cover_image_url ?? "")) { image in
 *                           image
 *                               .resizable()
 *                               .aspectRatio(contentMode: .fit)
 *                       } placeholder: {
 *                           Rectangle()
 *                               .fill(Color.gray.opacity(0.3))
 *                       }
 *                       .frame(width: 60, height: 90)
 *                       .cornerRadius(8)
 *
 *                       VStack(alignment: .leading, spacing: 4) {
 *                           Text(book.title)
 *                               .font(.headline)
 *                               .lineLimit(2)
 *                               .multilineTextAlignment(.leading)
 *
 *                           if let author = book.author {
 *                               Text(author)
 *                                   .font(.subheadline)
 *                                   .foregroundColor(.secondary)
 *                           }
 *
 *                           if let publisher = book.publisher {
 *                               Text(publisher)
 *                                   .font(.caption)
 *                                   .foregroundColor(.secondary)
 *                           }
 *                       }
 *
 *                       Spacer()
 *
 *                       // 선택 체크마크
 *                       Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
 *                           .foregroundColor(isSelected ? .blue : .gray)
 *                           .font(.title2)
 *                   }
 *                   .padding()
 *                   .background(isSelected ? Color.blue.opacity(0.1) : Color(.systemGray6))
 *                   .cornerRadius(12)
 *                   .overlay(
 *                       RoundedRectangle(cornerRadius: 12)
 *                           .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
 *                   )
 *               }
 *               .buttonStyle(PlainButtonStyle())
 *           }
 *       }
 *       ```
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: 장르 이름
 *         example: "소설"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 5
 *         description: 반환할 최대 책 수
 *     responses:
 *       200:
 *         description: 장르별 책 목록 조회 성공
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 장르를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/books/:genre', onboardingController.getGenreBooks);

/**
 * @swagger
 * /api/v1/onboarding/preferences:
 *   post:
 *     summary: 사용자 선호도 저장
 *     tags: [Onboarding]
 *     description: |
 *       사용자가 온보딩 과정에서 선택한 선호 장르와 책을 저장합니다
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - OnboardingService.swift
 *
 *       struct SavePreferencesRequest: Encodable {
 *           let preferred_genres: [String]
 *           let selected_book_ids: [String]?
 *       }
 *
 *       struct PreferencesResponse: Codable {
 *           let success: Bool
 *           let message: String
 *           let data: UserPreferences?
 *       }
 *
 *       struct UserPreferences: Codable {
 *           let id: String
 *           let user_id: String
 *           let preferred_genres: [String]
 *           let onboarding_completed: Bool
 *           let created_at: String
 *           let updated_at: String
 *       }
 *
 *       func savePreferences(genres: [String], bookIds: [String]? = nil) async throws -> PreferencesResponse {
 *           let request = SavePreferencesRequest(
 *               preferred_genres: genres,
 *               selected_book_ids: bookIds
 *           )
 *
 *           return try await NetworkManager.shared.request(
 *               endpoint: .onboarding,
 *               path: "/preferences",
 *               method: "POST",
 *               body: request,
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class OnboardingViewModel: ObservableObject {
 *           @Published var selectedGenres: Set<String> = []
 *           @Published var selectedBooks: Set<String> = []
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *           @Published var onboardingCompleted = false
 *
 *           let availableGenres = [
 *               "소설", "시/에세이", "자기계발", "경제/경영",
 *               "인문", "역사", "과학", "예술", "종교", "여행"
 *           ]
 *
 *           func savePreferences() async {
 *               guard !selectedGenres.isEmpty else {
 *                   errorMessage = "최소 1개 이상의 장르를 선택해주세요"
 *                   return
 *               }
 *
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   let genresArray = Array(selectedGenres)
 *                   let booksArray = selectedBooks.isEmpty ? nil : Array(selectedBooks)
 *
 *                   _ = try await OnboardingService.shared.savePreferences(
 *                       genres: genresArray,
 *                       bookIds: booksArray
 *                   )
 *
 *                   onboardingCompleted = true
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isLoading = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct OnboardingGenreSelectionView: View {
 *           @StateObject private var viewModel = OnboardingViewModel()
 *           @Environment(\.dismiss) private var dismiss
 *
 *           let columns = [
 *               GridItem(.flexible()),
 *               GridItem(.flexible())
 *           ]
 *
 *           var body: some View {
 *               NavigationView {
 *                   VStack(spacing: 20) {
 *                       // 헤더
 *                       VStack(spacing: 8) {
 *                           Text("어떤 장르를 좋아하시나요?")
 *                               .font(.title2)
 *                               .bold()
 *
 *                           Text("관심있는 장르를 모두 선택해주세요")
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                       }
 *                       .padding(.top)
 *
 *                       // 장르 선택
 *                       ScrollView {
 *                           LazyVGrid(columns: columns, spacing: 12) {
 *                               ForEach(viewModel.availableGenres, id: \.self) { genre in
 *                                   GenreButton(
 *                                       genre: genre,
 *                                       isSelected: viewModel.selectedGenres.contains(genre)
 *                                   ) {
 *                                       if viewModel.selectedGenres.contains(genre) {
 *                                           viewModel.selectedGenres.remove(genre)
 *                                       } else {
 *                                           viewModel.selectedGenres.insert(genre)
 *                                       }
 *                                   }
 *                               }
 *                           }
 *                           .padding()
 *                       }
 *
 *                       if let error = viewModel.errorMessage {
 *                           Text(error)
 *                               .foregroundColor(.red)
 *                               .font(.caption)
 *                               .padding(.horizontal)
 *                       }
 *
 *                       // 다음 버튼
 *                       Button {
 *                           Task {
 *                               await viewModel.savePreferences()
 *                           }
 *                       } label: {
 *                           HStack {
 *                               if viewModel.isLoading {
 *                                   ProgressView()
 *                                       .tint(.white)
 *                               } else {
 *                                   Text("다음 (\(viewModel.selectedGenres.count)/\(viewModel.availableGenres.count))")
 *                               }
 *                           }
 *                           .frame(maxWidth: .infinity)
 *                           .padding()
 *                           .background(viewModel.selectedGenres.isEmpty ? Color.gray : Color.blue)
 *                           .foregroundColor(.white)
 *                           .cornerRadius(12)
 *                       }
 *                       .disabled(viewModel.selectedGenres.isEmpty || viewModel.isLoading)
 *                       .padding(.horizontal)
 *                       .padding(.bottom)
 *                   }
 *                   .navigationBarTitleDisplayMode(.inline)
 *                   .onChange(of: viewModel.onboardingCompleted) { _, completed in
 *                       if completed {
 *                           dismiss()
 *                       }
 *                   }
 *               }
 *           }
 *       }
 *
 *       struct GenreButton: View {
 *           let genre: String
 *           let isSelected: Bool
 *           let action: () -> Void
 *
 *           var body: some View {
 *               Button(action: action) {
 *                   Text(genre)
 *                       .font(.body)
 *                       .padding(.vertical, 12)
 *                       .padding(.horizontal, 20)
 *                       .frame(maxWidth: .infinity)
 *                       .background(isSelected ? Color.blue : Color(.systemGray6))
 *                       .foregroundColor(isSelected ? .white : .primary)
 *                       .cornerRadius(10)
 *                       .overlay(
 *                           RoundedRectangle(cornerRadius: 10)
 *                               .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
 *                       )
 *               }
 *           }
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preferred_genres
 *             properties:
 *               preferred_genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 사용자가 선택한 선호 장르 목록
 *                 example: ["소설", "시/에세이", "자기계발"]
 *               selected_book_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: 사용자가 선택한 책 ID 목록 (선택사항)
 *     responses:
 *       200:
 *         description: 선호도 저장 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post('/preferences', authenticate, onboardingController.saveUserPreferences);

/**
 * @swagger
 * /api/v1/onboarding/status:
 *   get:
 *     summary: 온보딩 상태 확인
 *     tags: [Onboarding]
 *     description: |
 *       현재 로그인한 사용자의 온보딩 완료 여부를 확인합니다.
 *       앱 시작 시 온보딩 화면 표시 여부를 결정할 때 사용합니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - OnboardingService.swift
 *
 *       struct OnboardingStatusResponse: Codable {
 *           let success: Bool
 *           let message: String
 *           let data: OnboardingStatus
 *       }
 *
 *       struct OnboardingStatus: Codable {
 *           let onboarding_completed: Bool
 *           let preferred_genres: [String]?
 *           let completed_at: String?
 *       }
 *
 *       func getOnboardingStatus() async throws -> OnboardingStatus {
 *           return try await NetworkManager.shared.request(
 *               endpoint: .onboarding,
 *               path: "/status",
 *               method: "GET",
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class AppViewModel: ObservableObject {
 *           @Published var showOnboarding = false
 *           @Published var isCheckingOnboarding = true
 *
 *           func checkOnboardingStatus() async {
 *               isCheckingOnboarding = true
 *
 *               do {
 *                   let status = try await OnboardingService.shared.getOnboardingStatus()
 *                   showOnboarding = !status.onboarding_completed
 *               } catch {
 *                   // 온보딩 상태 조회 실패 시 온보딩 표시
 *                   showOnboarding = true
 *                   print("Failed to check onboarding status: \(error)")
 *               }
 *
 *               isCheckingOnboarding = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       @main
 *       struct DockDockApp: App {
 *           @StateObject private var appViewModel = AppViewModel()
 *
 *           var body: some Scene {
 *               WindowGroup {
 *                   Group {
 *                       if appViewModel.isCheckingOnboarding {
 *                           // 스플래시 화면
 *                           SplashView()
 *                       } else if appViewModel.showOnboarding {
 *                           // 온보딩 화면
 *                           OnboardingFlowView()
 *                       } else {
 *                           // 메인 화면
 *                           MainTabView()
 *                       }
 *                   }
 *                   .task {
 *                       await appViewModel.checkOnboardingStatus()
 *                   }
 *               }
 *           }
 *       }
 *
 *       struct SplashView: View {
 *           var body: some View {
 *               VStack {
 *                   Image("AppLogo")
 *                       .resizable()
 *                       .scaledToFit()
 *                       .frame(width: 120, height: 120)
 *
 *                   ProgressView()
 *                       .padding(.top, 20)
 *               }
 *           }
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 온보딩 상태 조회 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/status', authenticate, onboardingController.getOnboardingStatus);

/**
 * @swagger
 * /api/v1/onboarding/report/generate:
 *   post:
 *     summary: 온보딩 레포트 생성
 *     tags: [Onboarding]
 *     description: |
 *       사용자의 온보딩 데이터를 기반으로 개인화된 독서 성향 레포트를 생성합니다.
 *       OpenAI GPT를 사용하여 사용자의 독서 취향을 분석하고 추천을 제공합니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - OnboardingService.swift
 *
 *       struct GenerateReportRequest: Encodable {
 *           let onboardingData: OnboardingData
 *       }
 *
 *       struct OnboardingData: Codable {
 *           let preferred_genres: [String]
 *           let selected_books: [SelectedBook]?
 *           let reading_frequency: String?
 *           let reading_goals: [String]?
 *       }
 *
 *       struct SelectedBook: Codable {
 *           let id: String
 *           let title: String
 *           let author: String?
 *       }
 *
 *       struct ReportResponse: Codable {
 *           let success: Bool
 *           let message: String
 *           let data: ReadingReport
 *       }
 *
 *       struct ReadingReport: Codable, Identifiable {
 *           let id: String
 *           let user_id: String
 *           let reading_personality: String
 *           let genre_analysis: String
 *           let book_recommendations: [BookRecommendation]
 *           let reading_tips: [String]
 *           let created_at: String
 *       }
 *
 *       struct BookRecommendation: Codable, Identifiable {
 *           let id: String
 *           let title: String
 *           let author: String
 *           let reason: String
 *       }
 *
 *       func generateReport(onboardingData: OnboardingData) async throws -> ReadingReport {
 *           let request = GenerateReportRequest(onboardingData: onboardingData)
 *
 *           return try await NetworkManager.shared.request(
 *               endpoint: .onboarding,
 *               path: "/report/generate",
 *               method: "POST",
 *               body: request,
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class ReportGenerationViewModel: ObservableObject {
 *           @Published var report: ReadingReport?
 *           @Published var isGenerating = false
 *           @Published var errorMessage: String?
 *           @Published var progress: Double = 0.0
 *
 *           func generateReport(
 *               genres: [String],
 *               selectedBooks: [SelectedBook]?,
 *               readingFrequency: String?,
 *               readingGoals: [String]?
 *           ) async {
 *               isGenerating = true
 *               errorMessage = nil
 *               progress = 0.0
 *
 *               let onboardingData = OnboardingData(
 *                   preferred_genres: genres,
 *                   selected_books: selectedBooks,
 *                   reading_frequency: readingFrequency,
 *                   reading_goals: readingGoals
 *               )
 *
 *               // 진행률 애니메이션
 *               Task {
 *                   while isGenerating && progress < 0.9 {
 *                       try? await Task.sleep(nanoseconds: 500_000_000) // 0.5초
 *                       progress += 0.1
 *                   }
 *               }
 *
 *               do {
 *                   report = try await OnboardingService.shared.generateReport(
 *                       onboardingData: onboardingData
 *                   )
 *                   progress = 1.0
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isGenerating = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct ReportGenerationView: View {
 *           @StateObject private var viewModel = ReportGenerationViewModel()
 *           let genres: [String]
 *           let selectedBooks: [SelectedBook]?
 *
 *           var body: some View {
 *               VStack(spacing: 20) {
 *                   if viewModel.isGenerating {
 *                       VStack(spacing: 16) {
 *                           Text("📚 독서 성향 분석 중...")
 *                               .font(.title3)
 *                               .bold()
 *
 *                           ProgressView(value: viewModel.progress)
 *                               .progressViewStyle(LinearProgressViewStyle())
 *                               .padding(.horizontal, 40)
 *
 *                           Text("\(Int(viewModel.progress * 100))%")
 *                               .font(.caption)
 *                               .foregroundColor(.secondary)
 *
 *                           Text("당신만의 독서 레포트를 작성하고 있어요")
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                               .multilineTextAlignment(.center)
 *                       }
 *                       .padding()
 *                   } else if let report = viewModel.report {
 *                       ReportDetailView(report: report)
 *                   } else if let error = viewModel.errorMessage {
 *                       VStack {
 *                           Text("레포트 생성 실패")
 *                               .font(.headline)
 *                           Text(error)
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                           Button("다시 시도") {
 *                               Task {
 *                                   await viewModel.generateReport(
 *                                       genres: genres,
 *                                       selectedBooks: selectedBooks,
 *                                       readingFrequency: nil,
 *                                       readingGoals: nil
 *                                   )
 *                               }
 *                           }
 *                       }
 *                   }
 *               }
 *               .task {
 *                   await viewModel.generateReport(
 *                       genres: genres,
 *                       selectedBooks: selectedBooks,
 *                       readingFrequency: nil,
 *                       readingGoals: nil
 *                   )
 *               }
 *           }
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - onboardingData
 *             properties:
 *               onboardingData:
 *                 type: object
 *                 properties:
 *                   preferred_genres:
 *                     type: array
 *                     items:
 *                       type: string
 *                   selected_books:
 *                     type: array
 *                     items:
 *                       type: object
 *                   reading_frequency:
 *                     type: string
 *                   reading_goals:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: 레포트 생성 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post('/report/generate', authenticate, reportController.generateReport);

/**
 * @swagger
 * /api/v1/onboarding/report:
 *   get:
 *     summary: 사용자 독서 레포트 조회
 *     tags: [Onboarding]
 *     description: |
 *       현재 로그인한 사용자의 독서 성향 레포트를 조회합니다.
 *       이미 생성된 레포트가 있는 경우 해당 레포트를 반환합니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - OnboardingService.swift
 *
 *       func getUserReport() async throws -> ReadingReport {
 *           return try await NetworkManager.shared.request(
 *               endpoint: .onboarding,
 *               path: "/report",
 *               method: "GET",
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class UserReportViewModel: ObservableObject {
 *           @Published var report: ReadingReport?
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *
 *           func loadReport() async {
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   report = try await OnboardingService.shared.getUserReport()
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isLoading = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct ReportDetailView: View {
 *           let report: ReadingReport
 *
 *           var body: some View {
 *               ScrollView {
 *                   VStack(alignment: .leading, spacing: 24) {
 *                       // 헤더
 *                       VStack(alignment: .leading, spacing: 8) {
 *                           Text("📚 나의 독서 성향")
 *                               .font(.title)
 *                               .bold()
 *
 *                           Text("생성일: \(formatDate(report.created_at))")
 *                               .font(.caption)
 *                               .foregroundColor(.secondary)
 *                       }
 *
 *                       Divider()
 *
 *                       // 독서 성향
 *                       VStack(alignment: .leading, spacing: 12) {
 *                           Label("독서 성향", systemImage: "person.fill")
 *                               .font(.headline)
 *
 *                           Text(report.reading_personality)
 *                               .font(.body)
 *                               .foregroundColor(.secondary)
 *                       }
 *                       .padding()
 *                       .background(Color(.systemGray6))
 *                       .cornerRadius(12)
 *
 *                       // 장르 분석
 *                       VStack(alignment: .leading, spacing: 12) {
 *                           Label("장르 분석", systemImage: "chart.bar.fill")
 *                               .font(.headline)
 *
 *                           Text(report.genre_analysis)
 *                               .font(.body)
 *                               .foregroundColor(.secondary)
 *                       }
 *                       .padding()
 *                       .background(Color(.systemGray6))
 *                       .cornerRadius(12)
 *
 *                       // 추천 도서
 *                       VStack(alignment: .leading, spacing: 12) {
 *                           Label("추천 도서", systemImage: "book.fill")
 *                               .font(.headline)
 *
 *                           ForEach(report.book_recommendations) { recommendation in
 *                               VStack(alignment: .leading, spacing: 8) {
 *                                   HStack {
 *                                       Text(recommendation.title)
 *                                           .font(.subheadline)
 *                                           .bold()
 *                                       Spacer()
 *                                   }
 *
 *                                   Text(recommendation.author)
 *                                       .font(.caption)
 *                                       .foregroundColor(.secondary)
 *
 *                                   Text(recommendation.reason)
 *                                       .font(.caption)
 *                                       .foregroundColor(.secondary)
 *                                       .padding(.top, 4)
 *                               }
 *                               .padding()
 *                               .background(Color(.systemBackground))
 *                               .cornerRadius(8)
 *                           }
 *                       }
 *                       .padding()
 *                       .background(Color(.systemGray6))
 *                       .cornerRadius(12)
 *
 *                       // 독서 팁
 *                       VStack(alignment: .leading, spacing: 12) {
 *                           Label("독서 팁", systemImage: "lightbulb.fill")
 *                               .font(.headline)
 *
 *                           ForEach(Array(report.reading_tips.enumerated()), id: \.offset) { index, tip in
 *                               HStack(alignment: .top, spacing: 8) {
 *                                   Text("\(index + 1).")
 *                                       .font(.subheadline)
 *                                       .bold()
 *
 *                                   Text(tip)
 *                                       .font(.subheadline)
 *                                       .foregroundColor(.secondary)
 *                               }
 *                           }
 *                       }
 *                       .padding()
 *                       .background(Color(.systemGray6))
 *                       .cornerRadius(12)
 *                   }
 *                   .padding()
 *               }
 *               .navigationTitle("독서 레포트")
 *               .navigationBarTitleDisplayMode(.inline)
 *           }
 *
 *           private func formatDate(_ dateString: String) -> String {
 *               let formatter = ISO8601DateFormatter()
 *               guard let date = formatter.date(from: dateString) else {
 *                   return dateString
 *               }
 *
 *               let displayFormatter = DateFormatter()
 *               displayFormatter.dateFormat = "yyyy년 MM월 dd일"
 *               return displayFormatter.string(from: date)
 *           }
 *       }
 *
 *       // 사용 예시
 *       struct MyReportView: View {
 *           @StateObject private var viewModel = UserReportViewModel()
 *
 *           var body: some View {
 *               Group {
 *                   if viewModel.isLoading {
 *                       ProgressView("레포트 불러오는 중...")
 *                   } else if let report = viewModel.report {
 *                       ReportDetailView(report: report)
 *                   } else if let error = viewModel.errorMessage {
 *                       VStack {
 *                           Text("레포트를 불러올 수 없습니다")
 *                               .font(.headline)
 *                           Text(error)
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                           Button("다시 시도") {
 *                               Task { await viewModel.loadReport() }
 *                           }
 *                       }
 *                   }
 *               }
 *               .task {
 *                   await viewModel.loadReport()
 *               }
 *           }
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 레포트 조회 성공
 *       404:
 *         description: 레포트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/report', authenticate, reportController.getUserReport);

/**
 * @swagger
 * /api/v1/onboarding/report/regenerate:
 *   post:
 *     summary: 독서 레포트 재생성
 *     tags: [Onboarding]
 *     description: |
 *       기존 레포트를 삭제하고 새로운 온보딩 데이터로 레포트를 재생성합니다.
 *       사용자가 선호 장르나 책을 변경했을 때 사용합니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - OnboardingService.swift
 *
 *       struct RegenerateReportRequest: Encodable {
 *           let onboardingData: OnboardingData
 *       }
 *
 *       func regenerateReport(onboardingData: OnboardingData) async throws -> ReadingReport {
 *           let request = RegenerateReportRequest(onboardingData: onboardingData)
 *
 *           return try await NetworkManager.shared.request(
 *               endpoint: .onboarding,
 *               path: "/report/regenerate",
 *               method: "POST",
 *               body: request,
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class ReportRegenerationViewModel: ObservableObject {
 *           @Published var report: ReadingReport?
 *           @Published var isRegenerating = false
 *           @Published var errorMessage: String?
 *           @Published var showConfirmation = false
 *
 *           func regenerateReport(
 *               genres: [String],
 *               selectedBooks: [SelectedBook]?,
 *               readingFrequency: String?,
 *               readingGoals: [String]?
 *           ) async {
 *               isRegenerating = true
 *               errorMessage = nil
 *
 *               let onboardingData = OnboardingData(
 *                   preferred_genres: genres,
 *                   selected_books: selectedBooks,
 *                   reading_frequency: readingFrequency,
 *                   reading_goals: readingGoals
 *               )
 *
 *               do {
 *                   report = try await OnboardingService.shared.regenerateReport(
 *                       onboardingData: onboardingData
 *                   )
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isRegenerating = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct ReportSettingsView: View {
 *           @StateObject private var viewModel = ReportRegenerationViewModel()
 *           @State private var selectedGenres: Set<String> = []
 *
 *           let availableGenres = [
 *               "소설", "시/에세이", "자기계발", "경제/경영",
 *               "인문", "역사", "과학", "예술", "종교", "여행"
 *           ]
 *
 *           var body: some View {
 *               NavigationView {
 *                   Form {
 *                       Section(header: Text("선호 장르 수정")) {
 *                           ForEach(availableGenres, id: \.self) { genre in
 *                               HStack {
 *                                   Text(genre)
 *                                   Spacer()
 *                                   if selectedGenres.contains(genre) {
 *                                       Image(systemName: "checkmark")
 *                                           .foregroundColor(.blue)
 *                                   }
 *                               }
 *                               .contentShape(Rectangle())
 *                               .onTapGesture {
 *                                   if selectedGenres.contains(genre) {
 *                                       selectedGenres.remove(genre)
 *                                   } else {
 *                                       selectedGenres.insert(genre)
 *                                   }
 *                               }
 *                           }
 *                       }
 *
 *                       Section {
 *                           Button(action: {
 *                               viewModel.showConfirmation = true
 *                           }) {
 *                               HStack {
 *                                   Spacer()
 *                                   if viewModel.isRegenerating {
 *                                       ProgressView()
 *                                   } else {
 *                                       Text("레포트 재생성")
 *                                           .bold()
 *                                   }
 *                                   Spacer()
 *                               }
 *                           }
 *                           .disabled(selectedGenres.isEmpty || viewModel.isRegenerating)
 *                       }
 *
 *                       if let error = viewModel.errorMessage {
 *                           Section {
 *                               Text(error)
 *                                   .foregroundColor(.red)
 *                                   .font(.caption)
 *                           }
 *                       }
 *                   }
 *                   .navigationTitle("레포트 설정")
 *                   .alert("레포트 재생성", isPresented: $viewModel.showConfirmation) {
 *                       Button("취소", role: .cancel) { }
 *                       Button("재생성", role: .destructive) {
 *                           Task {
 *                               await viewModel.regenerateReport(
 *                                   genres: Array(selectedGenres),
 *                                   selectedBooks: nil,
 *                                   readingFrequency: nil,
 *                                   readingGoals: nil
 *                               )
 *                           }
 *                       }
 *                   } message: {
 *                       Text("기존 레포트가 삭제되고 새로운 레포트가 생성됩니다. 계속하시겠습니까?")
 *                   }
 *                   .sheet(item: $viewModel.report) { report in
 *                       NavigationView {
 *                           ReportDetailView(report: report)
 *                               .navigationTitle("새 레포트")
 *                               .navigationBarTitleDisplayMode(.inline)
 *                               .toolbar {
 *                                   ToolbarItem(placement: .navigationBarTrailing) {
 *                                       Button("완료") {
 *                                           viewModel.report = nil
 *                                       }
 *                                   }
 *                               }
 *                       }
 *                   }
 *               }
 *           }
 *       }
 *
 *       // 레포트 상세 화면에서 재생성 버튼 추가
 *       struct ReportDetailWithRegenerateView: View {
 *           let report: ReadingReport
 *           @State private var showSettings = false
 *
 *           var body: some View {
 *               ReportDetailView(report: report)
 *                   .toolbar {
 *                       ToolbarItem(placement: .navigationBarTrailing) {
 *                           Button {
 *                               showSettings = true
 *                           } label: {
 *                               Image(systemName: "arrow.clockwise")
 *                           }
 *                       }
 *                   }
 *                   .sheet(isPresented: $showSettings) {
 *                       ReportSettingsView()
 *                   }
 *           }
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - onboardingData
 *             properties:
 *               onboardingData:
 *                 type: object
 *                 properties:
 *                   preferred_genres:
 *                     type: array
 *                     items:
 *                       type: string
 *                   selected_books:
 *                     type: array
 *                     items:
 *                       type: object
 *                   reading_frequency:
 *                     type: string
 *                   reading_goals:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: 레포트 재생성 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post('/report/regenerate', authenticate, reportController.regenerateReport);

export default router;
