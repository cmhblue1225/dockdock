import { Router } from 'express';
import * as recordController from '../controllers/record.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/reading-records:
 *   get:
 *     summary: 독서 기록 목록 조회
 *     description: |
 *       사용자의 독서 기록 목록을 조회합니다. reading_book_id로 특정 책의 기록만 필터링 가능
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingRecordService.swift
 *
 *       struct ReadingRecordsResponse: Codable {
 *           let items: [ReadingRecordWithBook]
 *           let pagination: Pagination
 *       }
 *
 *       struct ReadingRecordWithBook: Codable, Identifiable {
 *           let id: String
 *           let reading_book_id: String
 *           let user_id: String
 *           let content: String
 *           let page_number: Int?
 *           let record_type: String
 *           let created_at: String
 *           let updated_at: String
 *           let reading_book: ReadingBookInfo
 *       }
 *
 *       struct ReadingBookInfo: Codable {
 *           let id: String
 *           let book_id: String
 *           let status: String
 *           let book: BookBasicInfo
 *       }
 *
 *       struct BookBasicInfo: Codable {
 *           let id: String
 *           let title: String
 *           let author: String?
 *           let cover_image_url: String?
 *       }
 *
 *       // 모든 독서 기록 조회
 *       func getReadingRecords(page: Int = 1, limit: Int = 50) async throws -> ReadingRecordsResponse {
 *           var components = URLComponents(string: "\(APIConfig.baseAPIURL)/reading-records")
 *           components?.queryItems = [
 *               URLQueryItem(name: "page", value: "\(page)"),
 *               URLQueryItem(name: "limit", value: "\(limit)")
 *           ]
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
 *       // 특정 책의 기록만 조회
 *       func getRecordsForBook(readingBookId: String, page: Int = 1, limit: Int = 50) async throws -> ReadingRecordsResponse {
 *           var components = URLComponents(string: "\(APIConfig.baseAPIURL)/reading-records")
 *           components?.queryItems = [
 *               URLQueryItem(name: "reading_book_id", value: readingBookId),
 *               URLQueryItem(name: "page", value: "\(page)"),
 *               URLQueryItem(name: "limit", value: "\(limit)")
 *           ]
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
 *       class ReadingRecordsViewModel: ObservableObject {
 *           @Published var records: [ReadingRecordWithBook] = []
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *           @Published var currentPage = 1
 *           @Published var totalPages = 1
 *           @Published var filterByBookId: String?
 *
 *           func loadRecords() async {
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   let response: ReadingRecordsResponse
 *
 *                   if let bookId = filterByBookId {
 *                       response = try await ReadingRecordService.shared.getRecordsForBook(
 *                           readingBookId: bookId,
 *                           page: currentPage,
 *                           limit: 50
 *                       )
 *                   } else {
 *                       response = try await ReadingRecordService.shared.getReadingRecords(
 *                           page: currentPage,
 *                           limit: 50
 *                       )
 *                   }
 *
 *                   if currentPage == 1 {
 *                       records = response.items
 *                   } else {
 *                       records.append(contentsOf: response.items)
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
 *               await loadRecords()
 *           }
 *
 *           func refresh() async {
 *               currentPage = 1
 *               await loadRecords()
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct ReadingRecordsView: View {
 *           @StateObject private var viewModel = ReadingRecordsViewModel()
 *           @State private var showCreateRecord = false
 *
 *           var body: some View {
 *               NavigationView {
 *                   Group {
 *                       if viewModel.isLoading && viewModel.records.isEmpty {
 *                           ProgressView()
 *                               .frame(maxWidth: .infinity, maxHeight: .infinity)
 *                       } else if let error = viewModel.errorMessage {
 *                           VStack {
 *                               Text("오류가 발생했습니다")
 *                                   .font(.headline)
 *                               Text(error)
 *                                   .font(.caption)
 *                                   .foregroundColor(.secondary)
 *                               Button("다시 시도") {
 *                                   Task { await viewModel.refresh() }
 *                               }
 *                               .buttonStyle(.bordered)
 *                           }
 *                       } else if viewModel.records.isEmpty {
 *                           VStack(spacing: 16) {
 *                               Image(systemName: "book.pages")
 *                                   .font(.system(size: 60))
 *                                   .foregroundColor(.secondary)
 *                               Text("아직 독서 기록이 없습니다")
 *                                   .font(.headline)
 *                               Text("책을 읽으며 메모, 인용구, 생각을 기록해보세요")
 *                                   .font(.caption)
 *                                   .foregroundColor(.secondary)
 *                           }
 *                       } else {
 *                           ScrollView {
 *                               LazyVStack(spacing: 16) {
 *                                   ForEach(viewModel.records) { record in
 *                                       RecordCardView(record: record)
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
 *                           .refreshable {
 *                               await viewModel.refresh()
 *                           }
 *                       }
 *                   }
 *                   .navigationTitle("독서 기록")
 *                   .task {
 *                       await viewModel.loadRecords()
 *                   }
 *               }
 *           }
 *       }
 *
 *       struct RecordCardView: View {
 *           let record: ReadingRecordWithBook
 *
 *           var body: some View {
 *               VStack(alignment: .leading, spacing: 12) {
 *                   HStack {
 *                       Image(systemName: recordTypeIcon)
 *                           .foregroundColor(recordTypeColor)
 *                       Text(recordTypeText)
 *                           .font(.caption)
 *                           .foregroundColor(recordTypeColor)
 *                       Spacer()
 *                       if let pageNum = record.page_number {
 *                           Text("p.\(pageNum)")
 *                               .font(.caption)
 *                               .foregroundColor(.secondary)
 *                       }
 *                   }
 *
 *                   Text(record.content)
 *                       .font(.body)
 *
 *                   HStack(spacing: 8) {
 *                       if let coverUrl = record.reading_book.book.cover_image_url {
 *                           AsyncImage(url: URL(string: coverUrl)) { image in
 *                               image.resizable()
 *                           } placeholder: {
 *                               Color.gray.opacity(0.3)
 *                           }
 *                           .frame(width: 30, height: 45)
 *                           .cornerRadius(4)
 *                       }
 *
 *                       VStack(alignment: .leading, spacing: 2) {
 *                           Text(record.reading_book.book.title)
 *                               .font(.caption)
 *                               .bold()
 *                           if let author = record.reading_book.book.author {
 *                               Text(author)
 *                                   .font(.caption2)
 *                                   .foregroundColor(.secondary)
 *                           }
 *                       }
 *
 *                       Spacer()
 *
 *                       Text(formatDate(record.created_at))
 *                           .font(.caption2)
 *                           .foregroundColor(.secondary)
 *                   }
 *               }
 *               .padding()
 *               .background(Color(.systemBackground))
 *               .cornerRadius(12)
 *               .shadow(radius: 2)
 *           }
 *
 *           var recordTypeIcon: String {
 *               switch record.record_type {
 *               case "note": return "note.text"
 *               case "quote": return "quote.bubble"
 *               case "thought": return "lightbulb"
 *               default: return "doc.text"
 *               }
 *           }
 *
 *           var recordTypeText: String {
 *               switch record.record_type {
 *               case "note": return "메모"
 *               case "quote": return "인용구"
 *               case "thought": return "생각"
 *               default: return "기록"
 *               }
 *           }
 *
 *           var recordTypeColor: Color {
 *               switch record.record_type {
 *               case "note": return .blue
 *               case "quote": return .purple
 *               case "thought": return .orange
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
 *               let displayFormatter = RelativeDateTimeFormatter()
 *               displayFormatter.locale = Locale(identifier: "ko_KR")
 *               return displayFormatter.localizedString(for: date, relativeTo: Date())
 *           }
 *       }
 *       ```
 *     tags: [Reading Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reading_book_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 특정 책의 기록만 조회 (선택사항)
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
 *           default: 50
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
 *                         $ref: '#/components/schemas/ReadingRecordWithBook'
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
 */
router.get('/', recordController.getReadingRecords);

/**
 * @swagger
 * /api/v1/reading-records/{id}:
 *   get:
 *     summary: 특정 독서 기록 조회
 *     tags: [Reading Records]
 *     description: |
 *       독서 기록의 상세 정보를 조회합니다.
 *       기록의 전체 정보와 연관된 책 정보를 함께 반환합니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingRecordService.swift
 *
 *       func getReadingRecordById(id: String) async throws -> ReadingRecordWithBook {
 *           return try await NetworkManager.shared.request(
 *               endpoint: .readingRecords,
 *               path: "/\(id)",
 *               method: "GET",
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class RecordDetailViewModel: ObservableObject {
 *           @Published var record: ReadingRecordWithBook?
 *           @Published var isLoading = false
 *           @Published var errorMessage: String?
 *
 *           func loadRecord(id: String) async {
 *               isLoading = true
 *               errorMessage = nil
 *
 *               do {
 *                   record = try await ReadingRecordService.shared.getReadingRecordById(id: id)
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
 *       struct RecordDetailView: View {
 *           let recordId: String
 *           @StateObject private var viewModel = RecordDetailViewModel()
 *           @State private var showEditSheet = false
 *
 *           var body: some View {
 *               Group {
 *                   if viewModel.isLoading {
 *                       ProgressView()
 *                   } else if let record = viewModel.record {
 *                       ScrollView {
 *                           VStack(alignment: .leading, spacing: 20) {
 *                               // 기록 유형 헤더
 *                               HStack {
 *                                   Image(systemName: recordTypeIcon(record.record_type))
 *                                       .foregroundColor(recordTypeColor(record.record_type))
 *                                   Text(recordTypeText(record.record_type))
 *                                       .font(.headline)
 *                                       .foregroundColor(recordTypeColor(record.record_type))
 *
 *                                   Spacer()
 *
 *                                   if let pageNum = record.page_number {
 *                                       Label("p.\(pageNum)", systemImage: "book.pages")
 *                                           .font(.caption)
 *                                           .foregroundColor(.secondary)
 *                                   }
 *                               }
 *                               .padding()
 *                               .background(recordTypeColor(record.record_type).opacity(0.1))
 *                               .cornerRadius(12)
 *
 *                               // 기록 내용
 *                               VStack(alignment: .leading, spacing: 8) {
 *                                   Text("내용")
 *                                       .font(.caption)
 *                                       .foregroundColor(.secondary)
 *
 *                                   Text(record.content)
 *                                       .font(.body)
 *                               }
 *                               .padding()
 *                               .background(Color(.systemGray6))
 *                               .cornerRadius(12)
 *
 *                               // 책 정보
 *                               VStack(alignment: .leading, spacing: 12) {
 *                                   Text("책 정보")
 *                                       .font(.caption)
 *                                       .foregroundColor(.secondary)
 *
 *                                   HStack(spacing: 12) {
 *                                       if let coverUrl = record.reading_book.book.cover_image_url {
 *                                           AsyncImage(url: URL(string: coverUrl)) { image in
 *                                               image.resizable()
 *                                           } placeholder: {
 *                                               Color.gray.opacity(0.3)
 *                                           }
 *                                           .frame(width: 60, height: 90)
 *                                           .cornerRadius(8)
 *                                       }
 *
 *                                       VStack(alignment: .leading, spacing: 4) {
 *                                           Text(record.reading_book.book.title)
 *                                               .font(.headline)
 *
 *                                           if let author = record.reading_book.book.author {
 *                                               Text(author)
 *                                                   .font(.subheadline)
 *                                                   .foregroundColor(.secondary)
 *                                           }
 *
 *                                           StatusBadge(status: record.reading_book.status)
 *                                       }
 *                                   }
 *                               }
 *                               .padding()
 *                               .background(Color(.systemGray6))
 *                               .cornerRadius(12)
 *
 *                               // 생성 시간
 *                               Text("작성일: \(formatDate(record.created_at))")
 *                                   .font(.caption)
 *                                   .foregroundColor(.secondary)
 *                           }
 *                           .padding()
 *                       }
 *                       .navigationTitle("기록 상세")
 *                       .navigationBarTitleDisplayMode(.inline)
 *                       .toolbar {
 *                           ToolbarItem(placement: .navigationBarTrailing) {
 *                               Button("편집") {
 *                                   showEditSheet = true
 *                               }
 *                           }
 *                       }
 *                       .sheet(isPresented: $showEditSheet) {
 *                           EditRecordView(record: record)
 *                       }
 *                   } else if let error = viewModel.errorMessage {
 *                       VStack {
 *                           Text("오류 발생")
 *                               .font(.headline)
 *                           Text(error)
 *                               .font(.subheadline)
 *                               .foregroundColor(.secondary)
 *                           Button("다시 시도") {
 *                               Task { await viewModel.loadRecord(id: recordId) }
 *                           }
 *                       }
 *                   }
 *               }
 *               .task {
 *                   await viewModel.loadRecord(id: recordId)
 *               }
 *           }
 *
 *           private func recordTypeIcon(_ type: String) -> String {
 *               switch type {
 *               case "note": return "note.text"
 *               case "quote": return "quote.bubble"
 *               case "thought": return "lightbulb"
 *               default: return "doc.text"
 *               }
 *           }
 *
 *           private func recordTypeText(_ type: String) -> String {
 *               switch type {
 *               case "note": return "메모"
 *               case "quote": return "인용구"
 *               case "thought": return "생각"
 *               default: return "기록"
 *               }
 *           }
 *
 *           private func recordTypeColor(_ type: String) -> Color {
 *               switch type {
 *               case "note": return .blue
 *               case "quote": return .purple
 *               case "thought": return .orange
 *               default: return .gray
 *               }
 *           }
 *
 *           private func formatDate(_ dateString: String) -> String {
 *               let formatter = ISO8601DateFormatter()
 *               guard let date = formatter.date(from: dateString) else {
 *                   return dateString
 *               }
 *
 *               let displayFormatter = DateFormatter()
 *               displayFormatter.dateStyle = .long
 *               displayFormatter.timeStyle = .short
 *               return displayFormatter.string(from: date)
 *           }
 *       }
 *
 *       struct StatusBadge: View {
 *           let status: String
 *
 *           var body: some View {
 *               Text(statusText)
 *                   .font(.caption2)
 *                   .padding(.horizontal, 8)
 *                   .padding(.vertical, 4)
 *                   .background(statusColor)
 *                   .foregroundColor(.white)
 *                   .cornerRadius(4)
 *           }
 *
 *           private var statusText: String {
 *               switch status {
 *               case "wishlist": return "읽고 싶어요"
 *               case "reading": return "읽는 중"
 *               case "completed": return "완독"
 *               default: return status
 *               }
 *           }
 *
 *           private var statusColor: Color {
 *               switch status {
 *               case "wishlist": return .gray
 *               case "reading": return .blue
 *               case "completed": return .green
 *               default: return .gray
 *               }
 *           }
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_record ID
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
 *                   $ref: '#/components/schemas/ReadingRecordWithBook'
 *       404:
 *         description: 찾을 수 없음
 */
router.get('/:id', recordController.getReadingRecordById);

/**
 * @swagger
 * /api/v1/reading-records:
 *   post:
 *     summary: 독서 기록 생성
 *     description: |
 *       새로운 독서 기록을 생성합니다 (메모, 인용구, 생각)
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingRecordService.swift
 *
 *       enum RecordType: String, Codable {
 *           case note = "note"       // 메모
 *           case quote = "quote"     // 인용구
 *           case thought = "thought" // 생각
 *       }
 *
 *       struct CreateReadingRecordRequest: Encodable {
 *           let reading_book_id: String
 *           let content: String
 *           let page_number: Int?
 *           let record_type: String
 *
 *           init(readingBookId: String, content: String, pageNumber: Int? = nil, recordType: RecordType = .note) {
 *               self.reading_book_id = readingBookId
 *               self.content = content
 *               self.page_number = pageNumber
 *               self.record_type = recordType.rawValue
 *           }
 *       }
 *
 *       struct ReadingRecord: Codable, Identifiable {
 *           let id: String
 *           let reading_book_id: String
 *           let user_id: String
 *           let content: String
 *           let page_number: Int?
 *           let record_type: String
 *           let created_at: String
 *           let updated_at: String
 *       }
 *
 *       func createReadingRecord(
 *           readingBookId: String,
 *           content: String,
 *           pageNumber: Int? = nil,
 *           recordType: RecordType = .note
 *       ) async throws -> ReadingRecord {
 *           let request = CreateReadingRecordRequest(
 *               readingBookId: readingBookId,
 *               content: content,
 *               pageNumber: pageNumber,
 *               recordType: recordType
 *           )
 *
 *           return try await NetworkManager.shared.request(
 *               endpoint: .readingRecords,
 *               method: "POST",
 *               body: request,
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class CreateRecordViewModel: ObservableObject {
 *           @Published var content: String = ""
 *           @Published var pageNumber: String = ""
 *           @Published var selectedRecordType: RecordType = .note
 *           @Published var isCreating = false
 *           @Published var errorMessage: String?
 *           @Published var showSuccess = false
 *
 *           func createRecord(for readingBookId: String) async -> Bool {
 *               guard !content.isEmpty else {
 *                   errorMessage = "내용을 입력해주세요"
 *                   return false
 *               }
 *
 *               isCreating = true
 *               errorMessage = nil
 *
 *               do {
 *                   let pageNum = Int(pageNumber)
 *                   _ = try await ReadingRecordService.shared.createReadingRecord(
 *                       readingBookId: readingBookId,
 *                       content: content,
 *                       pageNumber: pageNum,
 *                       recordType: selectedRecordType
 *                   )
 *
 *                   showSuccess = true
 *                   content = ""
 *                   pageNumber = ""
 *                   return true
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *                   return false
 *               }
 *
 *               isCreating = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct CreateRecordView: View {
 *           let readingBookId: String
 *           let bookTitle: String
 *           @StateObject private var viewModel = CreateRecordViewModel()
 *           @Environment(\.dismiss) private var dismiss
 *
 *           var body: some View {
 *               NavigationView {
 *                   Form {
 *                       Section {
 *                           Text(bookTitle)
 *                               .font(.headline)
 *                       } header: {
 *                           Text("책 제목")
 *                       }
 *
 *                       Section {
 *                           Picker("기록 유형", selection: $viewModel.selectedRecordType) {
 *                               HStack {
 *                                   Image(systemName: "note.text")
 *                                   Text("메모")
 *                               }
 *                               .tag(RecordType.note)
 *
 *                               HStack {
 *                                   Image(systemName: "quote.bubble")
 *                                   Text("인용구")
 *                               }
 *                               .tag(RecordType.quote)
 *
 *                               HStack {
 *                                   Image(systemName: "lightbulb")
 *                                   Text("생각")
 *                               }
 *                               .tag(RecordType.thought)
 *                           }
 *                           .pickerStyle(.segmented)
 *                       }
 *
 *                       Section {
 *                           TextEditor(text: $viewModel.content)
 *                               .frame(minHeight: 150)
 *                       } header: {
 *                           Text("내용")
 *                       } footer: {
 *                           Text(recordTypeDescription)
 *                               .font(.caption)
 *                               .foregroundColor(.secondary)
 *                       }
 *
 *                       Section {
 *                           TextField("페이지 번호 (선택사항)", text: $viewModel.pageNumber)
 *                               .keyboardType(.numberPad)
 *                       } header: {
 *                           Text("페이지")
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
 *                   .navigationTitle("독서 기록 작성")
 *                   .navigationBarTitleDisplayMode(.inline)
 *                   .toolbar {
 *                       ToolbarItem(placement: .cancellationAction) {
 *                           Button("취소") {
 *                               dismiss()
 *                           }
 *                       }
 *
 *                       ToolbarItem(placement: .confirmationAction) {
 *                           Button("저장") {
 *                               Task {
 *                                   let success = await viewModel.createRecord(for: readingBookId)
 *                                   if success {
 *                                       dismiss()
 *                                   }
 *                               }
 *                           }
 *                           .disabled(viewModel.content.isEmpty || viewModel.isCreating)
 *                       }
 *                   }
 *                   .overlay {
 *                       if viewModel.isCreating {
 *                           ProgressView()
 *                       }
 *                   }
 *               }
 *           }
 *
 *           var recordTypeDescription: String {
 *               switch viewModel.selectedRecordType {
 *               case .note:
 *                   return "책을 읽으면서 떠오른 생각이나 요약을 메모하세요"
 *               case .quote:
 *                   return "기억하고 싶은 문장이나 구절을 저장하세요"
 *               case .thought:
 *                   return "책을 통해 얻은 인사이트나 깨달음을 기록하세요"
 *               }
 *           }
 *       }
 *       ```
 *     tags: [Reading Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reading_book_id
 *               - content
 *             properties:
 *               reading_book_id:
 *                 type: string
 *                 format: uuid
 *                 description: 읽고 있는 책 ID
 *               content:
 *                 type: string
 *                 description: 기록 내용
 *               page_number:
 *                 type: integer
 *                 description: 페이지 번호 (선택사항)
 *               record_type:
 *                 type: string
 *                 enum: [note, quote, thought]
 *                 default: note
 *                 description: 기록 유형 (note=메모, quote=인용구, thought=생각)
 *           examples:
 *             note:
 *               summary: 메모 작성
 *               value:
 *                 reading_book_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 content: "주인공의 선택이 인상적이었다"
 *                 page_number: 127
 *                 record_type: "note"
 *             quote:
 *               summary: 인용구 저장
 *               value:
 *                 reading_book_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 content: "삶은 B(Birth)와 D(Death) 사이의 C(Choice)다"
 *                 page_number: 89
 *                 record_type: "quote"
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
 *                   $ref: '#/components/schemas/ReadingRecord'
 *                 message:
 *                   type: string
 *                   example: "독서 기록이 생성되었습니다"
 */
router.post('/', recordController.createReadingRecord);

/**
 * @swagger
 * /api/v1/reading-records/{id}:
 *   patch:
 *     summary: 독서 기록 업데이트
 *     tags: [Reading Records]
 *     description: |
 *       독서 기록의 내용, 페이지, 유형을 업데이트합니다.
 *       모든 필드는 선택사항이며, 제공된 필드만 업데이트됩니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingRecordService.swift
 *
 *       struct UpdateReadingRecordRequest: Encodable {
 *           let content: String?
 *           let page_number: Int?
 *           let record_type: String?
 *
 *           init(content: String? = nil, pageNumber: Int? = nil, recordType: RecordType? = nil) {
 *               self.content = content
 *               self.page_number = pageNumber
 *               self.record_type = recordType?.rawValue
 *           }
 *       }
 *
 *       func updateReadingRecord(
 *           id: String,
 *           content: String? = nil,
 *           pageNumber: Int? = nil,
 *           recordType: RecordType? = nil
 *       ) async throws -> ReadingRecord {
 *           let request = UpdateReadingRecordRequest(
 *               content: content,
 *               pageNumber: pageNumber,
 *               recordType: recordType
 *           )
 *
 *           return try await NetworkManager.shared.request(
 *               endpoint: .readingRecords,
 *               path: "/\(id)",
 *               method: "PATCH",
 *               body: request,
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class EditRecordViewModel: ObservableObject {
 *           @Published var content: String
 *           @Published var pageNumber: String
 *           @Published var selectedRecordType: RecordType
 *           @Published var isUpdating = false
 *           @Published var errorMessage: String?
 *
 *           let recordId: String
 *
 *           init(record: ReadingRecordWithBook) {
 *               self.recordId = record.id
 *               self.content = record.content
 *               self.pageNumber = record.page_number.map { "\($0)" } ?? ""
 *               self.selectedRecordType = RecordType(rawValue: record.record_type) ?? .note
 *           }
 *
 *           func updateRecord() async -> Bool {
 *               guard !content.isEmpty else {
 *                   errorMessage = "내용을 입력해주세요"
 *                   return false
 *               }
 *
 *               isUpdating = true
 *               errorMessage = nil
 *
 *               do {
 *                   let pageNum = Int(pageNumber)
 *                   _ = try await ReadingRecordService.shared.updateReadingRecord(
 *                       id: recordId,
 *                       content: content,
 *                       pageNumber: pageNum,
 *                       recordType: selectedRecordType
 *                   )
 *                   return true
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *                   return false
 *               }
 *
 *               isUpdating = false
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View
 *
 *       struct EditRecordView: View {
 *           let record: ReadingRecordWithBook
 *           @StateObject private var viewModel: EditRecordViewModel
 *           @Environment(\.dismiss) private var dismiss
 *
 *           init(record: ReadingRecordWithBook) {
 *               self.record = record
 *               _viewModel = StateObject(wrappedValue: EditRecordViewModel(record: record))
 *           }
 *
 *           var body: some View {
 *               NavigationView {
 *                   Form {
 *                       Section {
 *                           Picker("기록 유형", selection: $viewModel.selectedRecordType) {
 *                               HStack {
 *                                   Image(systemName: "note.text")
 *                                   Text("메모")
 *                               }
 *                               .tag(RecordType.note)
 *
 *                               HStack {
 *                                   Image(systemName: "quote.bubble")
 *                                   Text("인용구")
 *                               }
 *                               .tag(RecordType.quote)
 *
 *                               HStack {
 *                                   Image(systemName: "lightbulb")
 *                                   Text("생각")
 *                               }
 *                               .tag(RecordType.thought)
 *                           }
 *                           .pickerStyle(.segmented)
 *                       }
 *
 *                       Section {
 *                           TextEditor(text: $viewModel.content)
 *                               .frame(minHeight: 150)
 *                       } header: {
 *                           Text("내용")
 *                       }
 *
 *                       Section {
 *                           TextField("페이지 번호 (선택사항)", text: $viewModel.pageNumber)
 *                               .keyboardType(.numberPad)
 *                       } header: {
 *                           Text("페이지")
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
 *                   .navigationTitle("기록 수정")
 *                   .navigationBarTitleDisplayMode(.inline)
 *                   .toolbar {
 *                       ToolbarItem(placement: .cancellationAction) {
 *                           Button("취소") {
 *                               dismiss()
 *                           }
 *                       }
 *
 *                       ToolbarItem(placement: .confirmationAction) {
 *                           Button("저장") {
 *                               Task {
 *                                   let success = await viewModel.updateRecord()
 *                                   if success {
 *                                       dismiss()
 *                                   }
 *                               }
 *                           }
 *                           .disabled(viewModel.content.isEmpty || viewModel.isUpdating)
 *                       }
 *                   }
 *                   .overlay {
 *                       if viewModel.isUpdating {
 *                           ProgressView()
 *                       }
 *                   }
 *               }
 *           }
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 기록 내용
 *               page_number:
 *                 type: integer
 *                 description: 페이지 번호
 *               record_type:
 *                 type: string
 *                 enum: [note, quote, thought]
 *                 description: 기록 유형
 *     responses:
 *       200:
 *         description: 업데이트 성공
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 기록을 찾을 수 없음
 */
router.patch('/:id', recordController.updateReadingRecord);

/**
 * @swagger
 * /api/v1/reading-records/{id}:
 *   delete:
 *     summary: 독서 기록 삭제
 *     tags: [Reading Records]
 *     description: |
 *       독서 기록을 영구적으로 삭제합니다.
 *       삭제된 기록은 복구할 수 없으므로 주의가 필요합니다.
 *
 *       ## 📱 Swift 코드 예시
 *
 *       ```swift
 *       // MARK: - ReadingRecordService.swift
 *
 *       func deleteReadingRecord(id: String) async throws {
 *           try await NetworkManager.shared.request(
 *               endpoint: .readingRecords,
 *               path: "/\(id)",
 *               method: "DELETE",
 *               authenticated: true
 *           )
 *       }
 *
 *       // MARK: - SwiftUI ViewModel
 *
 *       @MainActor
 *       class RecordManagementViewModel: ObservableObject {
 *           @Published var records: [ReadingRecordWithBook] = []
 *           @Published var isDeleting = false
 *           @Published var errorMessage: String?
 *           @Published var showDeleteConfirmation = false
 *           @Published var recordToDelete: ReadingRecordWithBook?
 *
 *           func deleteRecord(id: String) async -> Bool {
 *               isDeleting = true
 *               errorMessage = nil
 *
 *               do {
 *                   try await ReadingRecordService.shared.deleteReadingRecord(id: id)
 *                   // 로컬 목록에서도 제거
 *                   records.removeAll { $0.id == id }
 *                   return true
 *               } catch {
 *                   errorMessage = error.localizedDescription
 *                   return false
 *               }
 *
 *               isDeleting = false
 *           }
 *
 *           func confirmDelete(record: ReadingRecordWithBook) {
 *               recordToDelete = record
 *               showDeleteConfirmation = true
 *           }
 *       }
 *
 *       // MARK: - SwiftUI View with Delete Action
 *
 *       struct RecordListView: View {
 *           @StateObject private var viewModel = RecordManagementViewModel()
 *
 *           var body: some View {
 *               List {
 *                   ForEach(viewModel.records) { record in
 *                       NavigationLink(destination: RecordDetailView(recordId: record.id)) {
 *                           RecordRow(record: record)
 *                       }
 *                       .swipeActions(edge: .trailing, allowsFullSwipe: false) {
 *                           Button(role: .destructive) {
 *                               viewModel.confirmDelete(record: record)
 *                           } label: {
 *                               Label("삭제", systemImage: "trash")
 *                           }
 *                       }
 *                   }
 *               }
 *               .alert("기록 삭제", isPresented: $viewModel.showDeleteConfirmation) {
 *                   Button("취소", role: .cancel) { }
 *                   Button("삭제", role: .destructive) {
 *                       if let record = viewModel.recordToDelete {
 *                           Task {
 *                               await viewModel.deleteRecord(id: record.id)
 *                           }
 *                       }
 *                   }
 *               } message: {
 *                   Text("이 기록을 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다.")
 *               }
 *               .overlay {
 *                   if viewModel.isDeleting {
 *                       ProgressView()
 *                           .frame(maxWidth: .infinity, maxHeight: .infinity)
 *                           .background(Color.black.opacity(0.2))
 *                   }
 *               }
 *           }
 *       }
 *
 *       // Context Menu 방식의 삭제
 *       struct RecordCardWithContextMenu: View {
 *           let record: ReadingRecordWithBook
 *           let onDelete: (String) async -> Bool
 *           @State private var showDeleteConfirmation = false
 *           @State private var isDeleting = false
 *
 *           var body: some View {
 *               RecordCardView(record: record)
 *                   .contextMenu {
 *                       Button(role: .destructive) {
 *                           showDeleteConfirmation = true
 *                       } label: {
 *                           Label("삭제", systemImage: "trash")
 *                       }
 *                   }
 *                   .alert("기록 삭제", isPresented: $showDeleteConfirmation) {
 *                       Button("취소", role: .cancel) { }
 *                       Button("삭제", role: .destructive) {
 *                           Task {
 *                               isDeleting = true
 *                               _ = await onDelete(record.id)
 *                               isDeleting = false
 *                           }
 *                       }
 *                   } message: {
 *                       Text("이 기록을 삭제하시겠습니까?")
 *                   }
 *                   .disabled(isDeleting)
 *           }
 *       }
 *
 *       // Toolbar 방식의 삭제
 *       struct RecordDetailWithDelete: View {
 *           let record: ReadingRecordWithBook
 *           @Environment(\.dismiss) private var dismiss
 *           @State private var showDeleteConfirmation = false
 *           @State private var isDeleting = false
 *
 *           var body: some View {
 *               RecordDetailView(recordId: record.id)
 *                   .toolbar {
 *                       ToolbarItem(placement: .navigationBarTrailing) {
 *                           Menu {
 *                               Button(role: .destructive) {
 *                                   showDeleteConfirmation = true
 *                               } label: {
 *                                   Label("삭제", systemImage: "trash")
 *                               }
 *                           } label: {
 *                               Image(systemName: "ellipsis.circle")
 *                           }
 *                       }
 *                   }
 *                   .alert("기록 삭제", isPresented: $showDeleteConfirmation) {
 *                       Button("취소", role: .cancel) { }
 *                       Button("삭제", role: .destructive) {
 *                           Task {
 *                               isDeleting = true
 *                               do {
 *                                   try await ReadingRecordService.shared.deleteReadingRecord(id: record.id)
 *                                   dismiss()
 *                               } catch {
 *                                   print("Failed to delete: \(error)")
 *                               }
 *                               isDeleting = false
 *                           }
 *                       }
 *                   } message: {
 *                       Text("이 기록을 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다.")
 *                   }
 *                   .disabled(isDeleting)
 *           }
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: reading_record ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 기록을 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */
router.delete('/:id', recordController.deleteReadingRecord);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     ReadingRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         reading_book_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         page_number:
 *           type: integer
 *           nullable: true
 *         record_type:
 *           type: string
 *           enum: [note, quote, thought]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     ReadingRecordWithBook:
 *       allOf:
 *         - $ref: '#/components/schemas/ReadingRecord'
 *         - type: object
 *           properties:
 *             reading_book:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 book_id:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [wishlist, reading, completed]
 *                 book:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                       nullable: true
 *                     cover_image_url:
 *                       type: string
 *                       nullable: true
 */
