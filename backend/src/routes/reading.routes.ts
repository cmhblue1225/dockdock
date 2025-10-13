import { Router } from 'express';
import * as readingController from '../controllers/reading.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/reading-books:
 *   get:
 *     summary: 읽고 있는 책 목록 조회
 *     description: |
 *       사용자의 읽고 있는 책 목록을 조회합니다. status, 페이지네이션 필터링 지원
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingBookService.swift
 *
 *       struct ReadingBooksResponse: Codable {
 *           let items: [ReadingBookWithBook]
 *           let pagination: Pagination
 *       }
 *
 *       struct Pagination: Codable {
 *           let page: Int
 *           let limit: Int
 *           let total: Int
 *           let totalPages: Int
 *       }
 *
 *       struct ReadingBookWithBook: Codable {
 *           let id: String
 *           let user_id: String
 *           let book_id: String
 *           let status: String
 *           let current_page: Int
 *           let start_date: String?
 *           let end_date: String?
 *           let created_at: String
 *           let updated_at: String
 *           let book: BookInfo
 *       }
 *
 *       struct BookInfo: Codable {
 *           let id: String
 *           let title: String
 *           let author: String?
 *           let publisher: String?
 *           let cover_image_url: String?
 *           let page_count: Int?
 *       }
 *
 *       func getReadingBooks(
 *           status: String? = nil,
 *           page: Int = 1,
 *           limit: Int = 20
 *       ) async throws -> ReadingBooksResponse {
 *           var components = URLComponents(string: "\(APIConfig.baseAPIURL)/reading-books")
 *           var queryItems: [URLQueryItem] = [
 *               URLQueryItem(name: "page", value: "\(page)"),
 *               URLQueryItem(name: "limit", value: "\(limit)")
 *           ]
 *
 *           if let status = status {
 *               queryItems.append(URLQueryItem(name: "status", value: status))
 *           }
 *
 *           components?.queryItems = queryItems
 *
 *           guard let url = components?.url else {
 *               throw APIError.invalidURL
 *           }
 *
 *           return try await NetworkManager.shared.request(
 *               endpoint: url,
 *               method: "GET",
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class ReadingBooksViewModel: ObservableObject {
 *           @Published var books: [ReadingBookWithBook] = []
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *           @Published var currentPage = 1
 *           @Published var totalPages = 1
 *           @Published var selectedStatus: String? = nil
 *
 *           func loadBooks() async {
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   let response = try await ReadingBookService.shared.getReadingBooks(
 *                       status: selectedStatus,
 *                       page: currentPage,
 *                       limit: 20
 *                   )
 *
 *                   if currentPage == 1 {
 *                       books = response.items
 *                   } else {
 *                       books.append(contentsOf: response.items)
 *                   }
 *
 *                   totalPages = response.pagination.totalPages
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isLoading = false
 *           }
 *
 *           func loadMore() async {
 *               guard currentPage < totalPages, !isLoading else { return }
 *               currentPage += 1
 *               await loadBooks()
 *           }
 *
 *           func filterByStatus(_ status: String?) async {
 *               selectedStatus = status
 *               currentPage = 1
 *               await loadBooks()
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct ReadingBooksView: View {
 *           @StateObject private var viewModel = ReadingBooksViewModel()
 *
 *           var body: some View {
 *               NavigationView {
 *                   VStack {
 *                       // Status Filter
 *                       ScrollView(.horizontal, showsIndicators: false) {
 *                           HStack(spacing: 12) {
 *                               FilterButton(title: "전체", isSelected: viewModel.selectedStatus == nil) {
 *                                   Task { await viewModel.filterByStatus(nil) }
 *                               }
 *                               FilterButton(title: "위시리스트", isSelected: viewModel.selectedStatus == "wishlist") {
 *                                   Task { await viewModel.filterByStatus("wishlist") }
 *                               }
 *                               FilterButton(title: "읽는 중", isSelected: viewModel.selectedStatus == "reading") {
 *                                   Task { await viewModel.filterByStatus("reading") }
 *                               }
 *                               FilterButton(title: "완독", isSelected: viewModel.selectedStatus == "completed") {
 *                                   Task { await viewModel.filterByStatus("completed") }
 *                               }
 *                           }
 *                           .padding(.horizontal)
 *                       }
 *
 *                       // Book List
 *                       if viewModel.isLoading && viewModel.books.isEmpty {
 *                           ProgressView()
 *                               .frame(maxWidth: .infinity, maxHeight: .infinity)
 *                       } else if let error = viewModel.errorMessage {
 *                           Text(error)
 *                               .foregroundColor(.red)
 *                       } else {
 *                           ScrollView {
 *                               LazyVStack(spacing: 16) {
 *                                   ForEach(viewModel.books, id: \.id) { item in
 *                                       ReadingBookRow(item: item)
 *                                   }
 *
 *                                   if viewModel.currentPage < viewModel.totalPages {
 *                                       ProgressView()
 *                                           .onAppear {
 *                                               Task { await viewModel.loadMore() }
 *                                           }
 *                                   }
 *                               }
 *                               .padding()
 *                           }
 *                       }
 *                   }
 *                   .navigationTitle("내 서재")
 *                   .task {
 *                       await viewModel.loadBooks()
 *                   }
 *               }
 *           }
 *       }
 *
 *       struct FilterButton: View {
 *           let title: String
 *           let isSelected: Bool
 *           let action: () -> Void
 *
 *           var body: some View {
 *               Button(action: action) {
 *                   Text(title)
 *                       .padding(.horizontal, 16)
 *                       .padding(.vertical, 8)
 *                       .background(isSelected ? Color.blue : Color.gray.opacity(0.2))
 *                       .foregroundColor(isSelected ? .white : .primary)
 *                       .cornerRadius(20)
 *               }
 *           }
 *       }
 *
 *       struct ReadingBookRow: View {
 *           let item: ReadingBookWithBook
 *
 *           var body: some View {
 *               HStack(spacing: 12) {
 *                   AsyncImage(url: URL(string: item.book.cover_image_url ?? "")) { image in
 *                       image.resizable()
 *                   } placeholder: {
 *                       Color.gray.opacity(0.3)
 *                   }
 *                   .frame(width: 60, height: 90)
 *                   .cornerRadius(8)
 *
 *                   VStack(alignment: .leading, spacing: 4) {
 *                       Text(item.book.title)
 *                           .font(.headline)
 *
 *                       if let author = item.book.author {
 *                           Text(author)
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                       }
 *
 *                       if let pageCount = item.book.page_count, pageCount > 0 {
 *                           ProgressView(value: Double(item.current_page), total: Double(pageCount))
 *                           Text("\(item.current_page) / \(pageCount) 페이지")
 *                               .font(.caption)
 *                               .foregroundColor(.secondary)
 *                       }
 *                   }
 *
 *                   Spacer()
 *               }
 *               .padding()
 *               .background(Color(.systemBackground))
 *               .cornerRadius(12)
 *               .shadow(radius: 2)
 *           }
 *       }
 *       ```
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [wishlist, reading, completed]
 *         description: 책 상태 필터 (선택사항)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 아이템 수
 *     responses:
 *       200:
 *         description: 성공
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReadingBookWithBook'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', readingController.getReadingBooks);

/**
 * @swagger
 * /api/v1/reading-books/{id}:
 *   get:
 *     summary: 특정 읽고 있는 책 조회
 *     description: |
 *       읽고 있는 책의 상세 정보를 조회합니다 (책 정보 포함)
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingBookService.swift
 *
 *       func getReadingBookById(id: String) async throws -> ReadingBookWithBook {
 *           return try await NetworkManager.shared.request(
 *               endpoint: .readingBooks,
 *               path: "/\(id)",
 *               method: "GET",
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class ReadingBookDetailViewModel: ObservableObject {
 *           @Published var readingBook: ReadingBookWithBook?
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *
 *           func loadDetail(id: String) async {
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   readingBook = try await ReadingBookService.shared.getReadingBookById(id: id)
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
 *       struct ReadingBookDetailView: View {
 *           let readingBookId: String
 *           @StateObject private var viewModel = ReadingBookDetailViewModel()
 *
 *           var body: some View {
 *               Group {
 *                   if viewModel.isLoading {
 *                       ProgressView()
 *                           .frame(maxWidth: .infinity, maxHeight: .infinity)
 *                   } else if let error = viewModel.errorMessage {
 *                       VStack {
 *                           Text("오류가 발생했습니다")
 *                               .font(.headline)
 *                           Text(error)
 *                               .font(.caption)
 *                               .foregroundColor(.secondary)
 *                           Button("다시 시도") {
 *                               Task {
 *                                   await viewModel.loadDetail(id: readingBookId)
 *                               }
 *                           }
 *                           .buttonStyle(.bordered)
 *                       }
 *                   } else if let readingBook = viewModel.readingBook {
 *                       ScrollView {
 *                           VStack(alignment: .leading, spacing: 20) {
 *                               // 책 표지 및 기본 정보
 *                               HStack(alignment: .top, spacing: 16) {
 *                                   AsyncImage(url: URL(string: readingBook.book.cover_image_url ?? "")) { image in
 *                                       image.resizable()
 *                                   } placeholder: {
 *                                       Color.gray.opacity(0.3)
 *                                   }
 *                                   .frame(width: 120, height: 180)
 *                                   .cornerRadius(12)
 *
 *                                   VStack(alignment: .leading, spacing: 8) {
 *                                       Text(readingBook.book.title)
 *                                           .font(.title2)
 *                                           .bold()
 *
 *                                       if let author = readingBook.book.author {
 *                                           Text(author)
 *                                               .font(.subheadline)
 *                                               .foregroundColor(.secondary)
 *                                       }
 *
 *                                       if let publisher = readingBook.book.publisher {
 *                                           Text(publisher)
 *                                               .font(.caption)
 *                                               .foregroundColor(.secondary)
 *                                       }
 *
 *                                       // 상태 배지
 *                                       Text(statusText(readingBook.status))
 *                                           .font(.caption)
 *                                           .padding(.horizontal, 12)
 *                                           .padding(.vertical, 4)
 *                                           .background(statusColor(readingBook.status))
 *                                           .foregroundColor(.white)
 *                                           .cornerRadius(12)
 *                                   }
 *
 *                                   Spacer()
 *                               }
 *
 *                               Divider()
 *
 *                               // 독서 진행 상황
 *                               if let pageCount = readingBook.book.page_count, pageCount > 0 {
 *                                   VStack(alignment: .leading, spacing: 8) {
 *                                       Text("독서 진행률")
 *                                           .font(.headline)
 *
 *                                       ProgressView(
 *                                           value: Double(readingBook.current_page),
 *                                           total: Double(pageCount)
 *                                       )
 *
 *                                       HStack {
 *                                           Text("\(readingBook.current_page) / \(pageCount) 페이지")
 *                                               .font(.subheadline)
 *                                           Spacer()
 *                                           Text("\(Int((Double(readingBook.current_page) / Double(pageCount)) * 100))%")
 *                                               .font(.subheadline)
 *                                               .bold()
 *                                       }
 *                                   }
 *
 *                                   Divider()
 *                               }
 *
 *                               // 날짜 정보
 *                               VStack(alignment: .leading, spacing: 12) {
 *                                   if let startDate = readingBook.start_date {
 *                                       HStack {
 *                                           Label("시작일", systemImage: "calendar")
 *                                           Spacer()
 *                                           Text(formatDate(startDate))
 *                                               .foregroundColor(.secondary)
 *                                       }
 *                                   }
 *
 *                                   if let endDate = readingBook.end_date {
 *                                       HStack {
 *                                           Label("완료일", systemImage: "checkmark.circle")
 *                                           Spacer()
 *                                           Text(formatDate(endDate))
 *                                               .foregroundColor(.secondary)
 *                                       }
 *                                   }
 *                               }
 *                           }
 *                           .padding()
 *                       }
 *                   }
 *               }
 *               .navigationTitle("독서 상세")
 *               .task {
 *                   await viewModel.loadDetail(id: readingBookId)
 *               }
 *           }
 *
 *           func statusText(_ status: String) -> String {
 *               switch status {
 *               case "wishlist": return "위시리스트"
 *               case "reading": return "읽는 중"
 *               case "completed": return "완독"
 *               default: return status
 *               }
 *           }
 *
 *           func statusColor(_ status: String) -> Color {
 *               switch status {
 *               case "wishlist": return .purple
 *               case "reading": return .blue
 *               case "completed": return .green
 *               default: return .gray
 *               }
 *           }
 *
 *           func formatDate(_ dateString: String) -> String {
 *               let formatter = ISO8601DateFormatter()
 *               guard let date = formatter.date(from: dateString) else {
 *                   return dateString
 *               }
 *
 *               let displayFormatter = DateFormatter()
 *               displayFormatter.dateStyle = .medium
 *               displayFormatter.locale = Locale(identifier: "ko_KR")
 *               return displayFormatter.string(from: date)
 *           }
 *       }
 *       ```
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_book ID
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ReadingBookWithBook'
 *       404:
 *         description: 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', readingController.getReadingBookById);

/**
 * @swagger
 * /api/v1/reading-books:
 *   post:
 *     summary: 읽고 있는 책 등록
 *     description: |
 *       새로운 책을 위시리스트 또는 읽는 중으로 등록합니다
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingBookService.swift
 *
 *       struct AddToReadingBooksRequest: Encodable {
 *           let book_id: String
 *           let status: String
 *           let current_page: Int?
 *       }
 *
 *       // 위시리스트에 추가
 *       func addToWishlist(bookId: String) async throws -> ReadingBook {
 *           let request = AddToReadingBooksRequest(
 *               book_id: bookId,
 *               status: "wishlist",
 *               current_page: nil
 *           )
 *
 *           return try await NetworkManager.shared.request(
 *               endpoint: .readingBooks,
 *               method: "POST",
 *               body: request
 *           )
 *       }
 *
 *       // 읽기 시작
 *       func startReading(bookId: String) async throws -> ReadingBook {
 *           let request = AddToReadingBooksRequest(
 *               book_id: bookId,
 *               status: "reading",
 *               current_page: 0
 *           )
 *
 *           return try await NetworkManager.shared.request(
 *               endpoint: .readingBooks,
 *               method: "POST",
 *               body: request
 *           )
 *       }
 *
 *       // MARK: - SwiftUI View 예시
 *
 *       struct BookActionView: View {
 *           let book: Book
 *           @State private var isLoading = false
 *           @State private var showAlert = false
 *           @State private var alertMessage = ""
 *
 *           var body: some View {
 *               VStack(spacing: 12) {
 *                   Button {
 *                       Task {
 *                           await addToWishlist()
 *                       }
 *                   } label: {
 *                       Label("위시리스트에 추가", systemImage: "heart")
 *                           .frame(maxWidth: .infinity)
 *                   }
 *                   .buttonStyle(.borderedProminent)
 *                   .disabled(isLoading)
 *
 *                   Button {
 *                       Task {
 *                           await startReading()
 *                       }
 *                   } label: {
 *                       Label("읽기 시작", systemImage: "book")
 *                           .frame(maxWidth: .infinity)
 *                   }
 *                   .buttonStyle(.bordered)
 *                   .disabled(isLoading)
 *               }
 *               .overlay {
 *                   if isLoading {
 *                       ProgressView()
 *                   }
 *               }
 *               .alert("알림", isPresented: $showAlert) {
 *                   Button("확인", role: .cancel) { }
 *               } message: {
 *                   Text(alertMessage)
 *               }
 *           }
 *
 *           func addToWishlist() async {
 *               isLoading = true
 *               defer { isLoading = false }
 *
 *               do {
 *                   _ = try await ReadingBookService.shared.addToWishlist(bookId: book.id)
 *                   alertMessage = "위시리스트에 추가되었습니다"
 *                   showAlert = true
 *               } catch {
 *                   alertMessage = error.localizedDescription
 *                   showAlert = true
 *               }
 *           }
 *
 *           func startReading() async {
 *               isLoading = true
 *               defer { isLoading = false }
 *
 *               do {
 *                   _ = try await ReadingBookService.shared.startReading(bookId: book.id)
 *                   alertMessage = "독서를 시작했습니다"
 *                   showAlert = true
 *               } catch {
 *                   alertMessage = error.localizedDescription
 *                   showAlert = true
 *               }
 *           }
 *       }
 *       ```
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - book_id
 *               - status
 *             properties:
 *               book_id:
 *                 type: string
 *                 format: uuid
 *                 description: 책 ID (books 테이블)
 *               status:
 *                 type: string
 *                 enum: [wishlist, reading, completed]
 *                 description: 책 상태
 *               current_page:
 *                 type: integer
 *                 default: 0
 *                 description: 현재 페이지 (선택사항)
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: 시작 날짜 (선택사항, reading 시 자동 설정)
 *           examples:
 *             wishlist:
 *               summary: 위시리스트에 추가
 *               value:
 *                 book_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 status: "wishlist"
 *             reading:
 *               summary: 읽기 시작
 *               value:
 *                 book_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 status: "reading"
 *                 current_page: 0
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ReadingBook'
 *                 message:
 *                   type: string
 *                   example: "책이 등록되었습니다"
 *       409:
 *         description: 이미 등록된 책
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', readingController.createReadingBook);

/**
 * @swagger
 * /api/v1/reading-books/{id}:
 *   patch:
 *     summary: 읽고 있는 책 업데이트
 *     description: |
 *       책의 상태, 진행률 등을 업데이트합니다
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingBookService.swift
 *
 *       struct UpdateReadingBookRequest: Encodable {
 *           let status: String?
 *           let current_page: Int?
 *           let start_date: String?
 *           let end_date: String?
 *
 *           init(status: String? = nil, currentPage: Int? = nil, startDate: String? = nil, endDate: String? = nil) {
 *               self.status = status
 *               self.current_page = currentPage
 *               self.start_date = startDate
 *               self.end_date = endDate
 *           }
 *       }
 *
 *       func updateReadingBook(id: String, updates: UpdateReadingBookRequest) async throws -> ReadingBook {
 *           return try await NetworkManager.shared.request(
 *               endpoint: .readingBooks,
 *               path: "/\(id)",
 *               method: "PATCH",
 *               body: updates,
 *               authenticated: true
 *           )
 *       }
 *
 *       // 독서 진행률 업데이트
 *       func updateProgress(id: String, currentPage: Int) async throws -> ReadingBook {
 *           let updates = UpdateReadingBookRequest(currentPage: currentPage)
 *           return try await updateReadingBook(id: id, updates: updates)
 *       }
 *
 *       // 완독 처리
 *       func markAsCompleted(id: String) async throws -> ReadingBook {
 *           let updates = UpdateReadingBookRequest(
 *               status: "completed",
 *               endDate: ISO8601DateFormatter().string(from: Date())
 *           )
 *           return try await updateReadingBook(id: id, updates: updates)
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class ReadingProgressViewModel: ObservableObject {
 *           @Published var currentPage: Int = 0
 *           @Published var isUpdating = false
 *           @Published var showCompletionAlert = false
 *           @Published var errorMessage: String?
 *
 *           let readingBookId: String
 *           let totalPages: Int
 *
 *           init(readingBookId: String, totalPages: Int, initialPage: Int = 0) {
 *               self.readingBookId = readingBookId
 *               self.totalPages = totalPages
 *               self.currentPage = initialPage
 *           }
 *
 *           func updateProgress(to page: Int) async {
 *               isUpdating = true
 *               errorMessage = nil
 *
 *               do {
 *                   _ = try await ReadingBookService.shared.updateProgress(
 *                       id: readingBookId,
 *                       currentPage: page
 *                   )
 *                   currentPage = page
 *
 *                   // 완독 체크
 *                   if page >= totalPages {
 *                       showCompletionAlert = true
 *                   }
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isUpdating = false
 *           }
 *
 *           func markAsCompleted() async {
 *               isUpdating = true
 *               errorMessage = nil
 *
 *               do {
 *                   _ = try await ReadingBookService.shared.markAsCompleted(id: readingBookId)
 *                   currentPage = totalPages
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *               }
 *
 *               isUpdating = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct ReadingProgressView: View {
 *           @StateObject private var viewModel: ReadingProgressViewModel
 *           @State private var tempPage: Double = 0
 *
 *           init(readingBookId: String, totalPages: Int, currentPage: Int) {
 *               _viewModel = StateObject(wrappedValue: ReadingProgressViewModel(
 *                   readingBookId: readingBookId,
 *                   totalPages: totalPages,
 *                   initialPage: currentPage
 *               ))
 *               _tempPage = State(initialValue: Double(currentPage))
 *           }
 *
 *           var body: some View {
 *               VStack(spacing: 20) {
 *                   // 진행률 표시
 *                   VStack(spacing: 8) {
 *                       Text("독서 진행률")
 *                           .font(.headline)
 *
 *                       ZStack {
 *                           Circle()
 *                               .stroke(Color.gray.opacity(0.2), lineWidth: 15)
 *
 *                           Circle()
 *                               .trim(from: 0, to: progress)
 *                               .stroke(Color.blue, style: StrokeStyle(lineWidth: 15, lineCap: .round))
 *                               .rotationEffect(.degrees(-90))
 *                               .animation(.easeInOut, value: progress)
 *
 *                           VStack {
 *                               Text("\(Int(progress * 100))%")
 *                                   .font(.system(size: 36, weight: .bold))
 *                               Text("\(viewModel.currentPage) / \(viewModel.totalPages)")
 *                                   .font(.caption)
 *                                   .foregroundColor(.secondary)
 *                           }
 *                       }
 *                       .frame(width: 200, height: 200)
 *                   }
 *
 *                   Divider()
 *
 *                   // 페이지 입력
 *                   VStack(alignment: .leading, spacing: 8) {
 *                       HStack {
 *                           Text("현재 페이지")
 *                               .font(.headline)
 *                           Spacer()
 *                           Text("\(Int(tempPage))")
 *                               .font(.title3)
 *                               .bold()
 *                       }
 *
 *                       Slider(
 *                           value: $tempPage,
 *                           in: 0...Double(viewModel.totalPages),
 *                           step: 1
 *                       )
 *
 *                       HStack {
 *                           Button("업데이트") {
 *                               Task {
 *                                   await viewModel.updateProgress(to: Int(tempPage))
 *                               }
 *                           }
 *                           .buttonStyle(.borderedProminent)
 *                           .disabled(viewModel.isUpdating || Int(tempPage) == viewModel.currentPage)
 *
 *                           if Int(tempPage) >= viewModel.totalPages {
 *                               Button("완독 처리") {
 *                                   Task {
 *                                       await viewModel.markAsCompleted()
 *                                   }
 *                               }
 *                               .buttonStyle(.bordered)
 *                               .disabled(viewModel.isUpdating)
 *                           }
 *                       }
 *                   }
 *                   .padding()
 *                   .background(Color(.systemGray6))
 *                   .cornerRadius(12)
 *
 *                   if let error = viewModel.errorMessage {
 *                       Text(error)
 *                           .font(.caption)
 *                           .foregroundColor(.red)
 *                   }
 *
 *                   Spacer()
 *               }
 *               .padding()
 *               .disabled(viewModel.isUpdating)
 *               .overlay {
 *                   if viewModel.isUpdating {
 *                       ProgressView()
 *                   }
 *               }
 *               .alert("축하합니다!", isPresented: $viewModel.showCompletionAlert) {
 *                   Button("완독 처리") {
 *                       Task {
 *                           await viewModel.markAsCompleted()
 *                       }
 *                   }
 *                   Button("나중에", role: .cancel) { }
 *               } message: {
 *                   Text("책을 다 읽으셨네요! 완독 처리하시겠습니까?")
 *               }
 *           }
 *
 *           var progress: CGFloat {
 *               guard viewModel.totalPages > 0 else { return 0 }
 *               return CGFloat(viewModel.currentPage) / CGFloat(viewModel.totalPages)
 *           }
 *       }
 *       ```
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [wishlist, reading, completed]
 *                 description: 책 상태 (선택사항)
 *               current_page:
 *                 type: integer
 *                 description: 현재 페이지 (선택사항)
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: 시작 날짜 (선택사항)
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: 완료 날짜 (선택사항, completed 시 자동 설정)
 *           examples:
 *             updateProgress:
 *               summary: 진행률 업데이트
 *               value:
 *                 current_page: 150
 *             markCompleted:
 *               summary: 완독 표시
 *               value:
 *                 status: "completed"
 *     responses:
 *       200:
 *         description: 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ReadingBook'
 *                 message:
 *                   type: string
 *                   example: "책 정보가 업데이트되었습니다"
 */
router.patch('/:id', readingController.updateReadingBook);

/**
 * @swagger
 * /api/v1/reading-books/{id}:
 *   delete:
 *     summary: 읽고 있는 책 삭제
 *     description: |
 *       읽고 있는 책을 삭제합니다 (연관된 독서 기록도 함께 삭제됨)
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingBookService.swift
 *
 *       func deleteReadingBook(id: String) async throws {
 *           let _: EmptyResponse = try await NetworkManager.shared.request(
 *               endpoint: .readingBooks,
 *               path: "/\(id)",
 *               method: "DELETE",
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - EmptyResponse 모델
 *
 *       struct EmptyResponse: Codable {
 *           let success: Bool
 *           let data: String?
 *           let message: String
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class ReadingBookDeleteViewModel: ObservableObject {
 *           @Published var isDeleting = false
 *           @Published var showDeleteAlert = false
 *           @Published var errorMessage: String?
 *           @Published var onDeleteSuccess: (() -> Void)?
 *
 *           func confirmDelete() {
 *               showDeleteAlert = true
 *           }
 *
 *           func deleteBook(id: String) async -> Bool {
 *               isDeleting = true
 *               errorMessage = nil
 *
 *               do {
 *                   try await ReadingBookService.shared.deleteReadingBook(id: id)
 *                   onDeleteSuccess?()
 *                   return true
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *                   return false
 *               }
 *
 *               isDeleting = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View 예시 1: 스와이프 삭제
 *
 *       struct ReadingBooksListView: View {
 *           @StateObject private var viewModel = ReadingBooksViewModel()
 *
 *           var body: some View {
 *               List {
 *                   ForEach(viewModel.books, id: \.id) { book in
 *                       ReadingBookRow(item: book)
 *                   }
 *                   .onDelete { indexSet in
 *                       Task {
 *                           await deleteBooks(at: indexSet)
 *                       }
 *                   }
 *               }
 *               .navigationTitle("내 서재")
 *           }
 *
 *           func deleteBooks(at offsets: IndexSet) async {
 *               for index in offsets {
 *                   let book = viewModel.books[index]
 *                   do {
 *                       try await ReadingBookService.shared.deleteReadingBook(id: book.id)
 *                       await viewModel.loadBooks() // 목록 새로고침
 *                   } catch {
 *                       print("삭제 실패: \(error)")
 *                   }
 *               }
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View 예시 2: 확인 대화상자가 있는 삭제
 *
 *       struct ReadingBookDetailDeleteView: View {
 *           let readingBook: ReadingBookWithBook
 *           @StateObject private var deleteViewModel = ReadingBookDeleteViewModel()
 *           @Environment(\.dismiss) private var dismiss
 *
 *           var body: some View {
 *               VStack(spacing: 20) {
 *                   // 책 정보 표시
 *                   HStack(spacing: 16) {
 *                       AsyncImage(url: URL(string: readingBook.book.cover_image_url ?? "")) { image in
 *                           image.resizable()
 *                       } placeholder: {
 *                           Color.gray.opacity(0.3)
 *                       }
 *                       .frame(width: 80, height: 120)
 *                       .cornerRadius(8)
 *
 *                       VStack(alignment: .leading, spacing: 4) {
 *                           Text(readingBook.book.title)
 *                               .font(.headline)
 *                           if let author = readingBook.book.author {
 *                               Text(author)
 *                                   .font(.subheadline)
 *                                   .foregroundColor(.secondary)
 *                           }
 *                       }
 *
 *                       Spacer()
 *                   }
 *                   .padding()
 *
 *                   Spacer()
 *
 *                   // 삭제 버튼
 *                   Button(role: .destructive) {
 *                       deleteViewModel.confirmDelete()
 *                   } label: {
 *                       Label("서재에서 제거", systemImage: "trash")
 *                           .frame(maxWidth: .infinity)
 *                   }
 *                   .buttonStyle(.bordered)
 *                   .disabled(deleteViewModel.isDeleting)
 *
 *                   if let error = deleteViewModel.errorMessage {
 *                       Text(error)
 *                           .font(.caption)
 *                           .foregroundColor(.red)
 *                   }
 *               }
 *               .padding()
 *               .overlay {
 *                   if deleteViewModel.isDeleting {
 *                       ProgressView()
 *                   }
 *               }
 *               .alert("책을 삭제하시겠습니까?", isPresented: $deleteViewModel.showDeleteAlert) {
 *                   Button("취소", role: .cancel) { }
 *                   Button("삭제", role: .destructive) {
 *                       Task {
 *                           let success = await deleteViewModel.deleteBook(id: readingBook.id)
 *                           if success {
 *                               dismiss()
 *                           }
 *                       }
 *                   }
 *               } message: {
 *                   Text("이 책과 관련된 모든 독서 기록이 삭제됩니다.")
 *               }
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View 예시 3: Context Menu를 이용한 삭제
 *
 *       struct ReadingBookCardView: View {
 *           let book: ReadingBookWithBook
 *           @State private var showDeleteConfirmation = false
 *           let onDelete: () -> Void
 *
 *           var body: some View {
 *               VStack(alignment: .leading, spacing: 8) {
 *                   AsyncImage(url: URL(string: book.book.cover_image_url ?? "")) { image in
 *                       image.resizable()
 *                   } placeholder: {
 *                       Color.gray.opacity(0.3)
 *                   }
 *                   .aspectRatio(2/3, contentMode: .fit)
 *                   .cornerRadius(8)
 *
 *                   Text(book.book.title)
 *                       .font(.caption)
 *                       .lineLimit(2)
 *               }
 *               .contextMenu {
 *                   Button {
 *                       // 책 상세 보기
 *                   } label: {
 *                       Label("상세 보기", systemImage: "book")
 *                   }
 *
 *                   Button {
 *                       // 진행률 업데이트
 *                   } label: {
 *                       Label("진행률 업데이트", systemImage: "chart.bar")
 *                   }
 *
 *                   Divider()
 *
 *                   Button(role: .destructive) {
 *                       showDeleteConfirmation = true
 *                   } label: {
 *                       Label("서재에서 제거", systemImage: "trash")
 *                   }
 *               }
 *               .confirmationDialog("이 책을 삭제하시겠습니까?", isPresented: $showDeleteConfirmation, titleVisibility: .visible) {
 *                   Button("삭제", role: .destructive) {
 *                       Task {
 *                           do {
 *                               try await ReadingBookService.shared.deleteReadingBook(id: book.id)
 *                               onDelete()
 *                           } catch {
 *                               print("삭제 실패: \(error)")
 *                           }
 *                       }
 *                   }
 *                   Button("취소", role: .cancel) { }
 *               } message: {
 *                   Text("이 작업은 되돌릴 수 없습니다.")
 *               }
 *           }
 *       }
 *       ```
 *     tags: [Reading Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_book ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "책이 삭제되었습니다"
 */
router.delete('/:id', readingController.deleteReadingBook);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     ReadingBook:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         book_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [wishlist, reading, completed]
 *         current_page:
 *           type: integer
 *         start_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         end_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     ReadingBookWithBook:
 *       allOf:
 *         - $ref: '#/components/schemas/ReadingBook'
 *         - type: object
 *           properties:
 *             book:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 title:
 *                   type: string
 *                 author:
 *                   type: string
 *                   nullable: true
 *                 publisher:
 *                   type: string
 *                   nullable: true
 *                 cover_image_url:
 *                   type: string
 *                   nullable: true
 *                 page_count:
 *                   type: integer
 *                   nullable: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "NOT_FOUND"
 *             message:
 *               type: string
 *               example: "리소스를 찾을 수 없습니다"
 *             details:
 *               type: object
 *               nullable: true
 */
