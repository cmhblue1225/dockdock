# 독독 (DockDock) API - iOS Swift 가이드

## 📱 개요

이 가이드는 독독 API를 iOS Swift 앱에서 사용하는 방법을 상세히 설명합니다.

## 🏗️ 프로젝트 구조 권장사항

```
YourApp/
├── Models/
│   ├── Book.swift
│   ├── ReadingBook.swift
│   ├── Review.swift
│   └── User.swift
├── Services/
│   ├── APIService.swift
│   ├── AuthService.swift
│   ├── BookService.swift
│   └── NetworkManager.swift
├── Utils/
│   ├── APIError.swift
│   └── APIResponse.swift
└── ViewModels/
    ├── BookViewModel.swift
    └── AuthViewModel.swift
```

## 🔧 기본 설정

### 1. API 기본 구성

```swift
import Foundation

// MARK: - API 설정
enum APIConfig {
    static let baseURL = "https://dockdock-production.up.railway.app"
    static let apiVersion = "v1"

    static var baseAPIURL: String {
        return "\(baseURL)/api/\(apiVersion)"
    }
}

// MARK: - API 엔드포인트
enum APIEndpoint {
    case books
    case bookDetail(String)
    case searchBooks
    case readingBooks
    case readingBook(String)
    case readingRecords
    case reviews
    case onboardingReport

    var path: String {
        switch self {
        case .books:
            return "/books"
        case .bookDetail(let id):
            return "/books/\(id)"
        case .searchBooks:
            return "/books/search"
        case .readingBooks:
            return "/reading-books"
        case .readingBook(let id):
            return "/reading-books/\(id)"
        case .readingRecords:
            return "/reading-records"
        case .reviews:
            return "/reviews"
        case .onboardingReport:
            return "/onboarding/report"
        }
    }

    var url: URL? {
        return URL(string: APIConfig.baseAPIURL + path)
    }
}
```

### 2. API 응답 모델

```swift
// MARK: - 기본 API 응답
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let message: String?
    let data: T?
    let error: String?
}

// MARK: - API 에러
enum APIError: Error {
    case invalidURL
    case noData
    case decodingError
    case serverError(String)
    case unauthorized
    case networkError(Error)

    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "잘못된 URL입니다"
        case .noData:
            return "데이터가 없습니다"
        case .decodingError:
            return "데이터 파싱에 실패했습니다"
        case .serverError(let message):
            return "서버 오류: \(message)"
        case .unauthorized:
            return "인증이 필요합니다"
        case .networkError(let error):
            return "네트워크 오류: \(error.localizedDescription)"
        }
    }
}
```

### 3. 네트워크 매니저 (기본)

```swift
import Foundation

class NetworkManager {
    static let shared = NetworkManager()

    private init() {}

    // MARK: - Generic Request Method
    func request<T: Codable>(
        endpoint: APIEndpoint,
        method: String = "GET",
        body: Encodable? = nil,
        headers: [String: String]? = nil
    ) async throws -> T {
        guard let url = endpoint.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // 추가 헤더
        headers?.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }

        // JWT 토큰 추가 (인증이 필요한 경우)
        if let token = AuthService.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Request Body
        if let body = body {
            request.httpBody = try? JSONEncoder().encode(body)
        }

        do {
            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.serverError("Invalid response")
            }

            // 상태 코드 확인
            switch httpResponse.statusCode {
            case 200...299:
                let apiResponse = try JSONDecoder().decode(APIResponse<T>.self, from: data)

                if apiResponse.success, let data = apiResponse.data {
                    return data
                } else {
                    throw APIError.serverError(apiResponse.message ?? "Unknown error")
                }

            case 401:
                throw APIError.unauthorized

            default:
                let errorResponse = try? JSONDecoder().decode(APIResponse<T>.self, from: data)
                throw APIError.serverError(errorResponse?.message ?? "Server error")
            }

        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
}
```

### 4. 인증 서비스

```swift
import Foundation

class AuthService {
    static let shared = AuthService()

    private let tokenKey = "supabase_jwt_token"
    private let userKey = "current_user"

    private init() {}

    // MARK: - Token Management
    func saveToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: tokenKey)
    }

    func getToken() -> String? {
        return UserDefaults.standard.string(forKey: tokenKey)
    }

    func removeToken() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
    }

    func isAuthenticated() -> Bool {
        return getToken() != nil
    }

    // MARK: - User Management
    func saveUser(_ user: User) {
        if let encoded = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(encoded, forKey: userKey)
        }
    }

    func getUser() -> User? {
        guard let data = UserDefaults.standard.data(forKey: userKey) else {
            return nil
        }
        return try? JSONDecoder().decode(User.self, from: data)
    }

    func logout() {
        removeToken()
        UserDefaults.standard.removeObject(forKey: userKey)
    }
}
```

## 📦 데이터 모델 예시

### Book (책)

```swift
struct Book: Codable, Identifiable {
    let id: String
    let isbn: String?
    let isbn13: String?
    let title: String
    let subtitle: String?
    let author: String?
    let publisher: String?
    let publishedDate: String?
    let description: String?
    let coverImage: String?
    let categoryName: String?
    let pageCount: Int?
    let price: BookPrice?
    let link: String?
    let stockStatus: String?
    let rating: Double?

    enum CodingKeys: String, CodingKey {
        case id, isbn, isbn13, title, subtitle, author, publisher
        case publishedDate, description, coverImage, categoryName
        case pageCount, price, link, stockStatus, rating
    }
}

struct BookPrice: Codable {
    let standard: Int
    let sales: Int
    let currency: String
}
```

### ReadingBook (독서 목록)

```swift
struct ReadingBook: Codable, Identifiable {
    let id: String
    let userId: String
    let bookId: String
    let status: ReadingStatus
    let startDate: String?
    let endDate: String?
    let currentPage: Int?
    let rating: Double?
    let createdAt: String
    let updatedAt: String

    // Book 정보 (조인된 경우)
    let book: Book?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case bookId = "book_id"
        case status
        case startDate = "start_date"
        case endDate = "end_date"
        case currentPage = "current_page"
        case rating
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case book
    }
}

enum ReadingStatus: String, Codable {
    case wishlist
    case reading
    case completed
}
```

### User (사용자)

```swift
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let displayName: String?
    let avatarUrl: String?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, email
        case displayName = "display_name"
        case avatarUrl = "avatar_url"
        case createdAt = "created_at"
    }
}
```

## 🎯 API 사용 예시

### 1. 책 검색

```swift
class BookService {
    static let shared = BookService()

    func searchBooks(query: String) async throws -> [Book] {
        var components = URLComponents(string: "\(APIConfig.baseAPIURL)/books/search")
        components?.queryItems = [
            URLQueryItem(name: "query", value: query),
            URLQueryItem(name: "maxResults", value: "10")
        ]

        guard let url = components?.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError("Search failed")
        }

        struct SearchResponse: Codable {
            let books: [Book]
        }

        let apiResponse = try JSONDecoder().decode(APIResponse<SearchResponse>.self, from: data)
        return apiResponse.data?.books ?? []
    }

    func getBookDetail(bookId: String) async throws -> Book {
        return try await NetworkManager.shared.request(
            endpoint: .bookDetail(bookId),
            method: "GET"
        )
    }
}
```

### 2. 독서 목록 관리

```swift
class ReadingBookService {
    static let shared = ReadingBookService()

    // 위시리스트에 추가
    func addToWishlist(bookId: String) async throws -> ReadingBook {
        struct RequestBody: Encodable {
            let book_id: String
            let status: String
        }

        let body = RequestBody(book_id: bookId, status: "wishlist")

        return try await NetworkManager.shared.request(
            endpoint: .readingBooks,
            method: "POST",
            body: body
        )
    }

    // 독서 목록 조회
    func getReadingBooks(status: ReadingStatus? = nil) async throws -> [ReadingBook] {
        var endpoint = APIEndpoint.readingBooks
        // 필터링이 필요한 경우 쿼리 파라미터 추가

        return try await NetworkManager.shared.request(
            endpoint: endpoint,
            method: "GET"
        )
    }

    // 독서 상태 업데이트
    func updateReadingStatus(
        readingBookId: String,
        status: ReadingStatus,
        currentPage: Int? = nil
    ) async throws -> ReadingBook {
        struct RequestBody: Encodable {
            let status: String
            let current_page: Int?
        }

        let body = RequestBody(
            status: status.rawValue,
            current_page: currentPage
        )

        return try await NetworkManager.shared.request(
            endpoint: .readingBook(readingBookId),
            method: "PATCH",
            body: body
        )
    }
}
```

### 3. SwiftUI ViewModel 예시

```swift
import SwiftUI

@MainActor
class BookViewModel: ObservableObject {
    @Published var books: [Book] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func searchBooks(query: String) async {
        isLoading = true
        errorMessage = nil

        do {
            books = try await BookService.shared.searchBooks(query: query)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func addToWishlist(bookId: String) async {
        do {
            _ = try await ReadingBookService.shared.addToWishlist(bookId: bookId)
            // 성공 처리
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

### 4. SwiftUI View 예시

```swift
struct BookSearchView: View {
    @StateObject private var viewModel = BookViewModel()
    @State private var searchText = ""

    var body: some View {
        NavigationView {
            VStack {
                SearchBar(text: $searchText, onSearch: {
                    Task {
                        await viewModel.searchBooks(query: searchText)
                    }
                })

                if viewModel.isLoading {
                    ProgressView()
                } else if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                } else {
                    List(viewModel.books) { book in
                        BookRowView(book: book)
                            .onTapGesture {
                                Task {
                                    await viewModel.addToWishlist(bookId: book.id)
                                }
                            }
                    }
                }
            }
            .navigationTitle("책 검색")
        }
    }
}
```

## 🔐 인증 관련

### Supabase JWT 토큰 사용

모든 인증이 필요한 API 요청에는 `Authorization` 헤더에 JWT 토큰을 포함해야 합니다:

```swift
request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
```

### 토큰 관리 Best Practice

1. **토큰 저장**: Keychain 사용 권장 (민감한 정보)
2. **토큰 갱신**: 만료 시 자동 갱신 로직 구현
3. **에러 처리**: 401 Unauthorized 시 로그인 화면으로 이동

```swift
import Security

class KeychainService {
    static let shared = KeychainService()

    func save(token: String) -> Bool {
        let data = token.data(using: .utf8)!

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "jwt_token",
            kSecValueData as String: data
        ]

        SecItemDelete(query as CFDictionary)
        return SecItemAdd(query as CFDictionary, nil) == noErr
    }

    func load() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "jwt_token",
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == noErr,
              let data = result as? Data,
              let token = String(data: data, encoding: .utf8) else {
            return nil
        }

        return token
    }

    func delete() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "jwt_token"
        ]

        return SecItemDelete(query as CFDictionary) == noErr
    }
}
```

## 🎨 UI/UX 권장사항

### 1. 로딩 상태 표시
```swift
if isLoading {
    ProgressView()
        .scaleEffect(1.5)
        .tint(.purple)
}
```

### 2. 에러 처리
```swift
.alert("오류", isPresented: $showError) {
    Button("확인", role: .cancel) { }
} message: {
    Text(errorMessage ?? "알 수 없는 오류가 발생했습니다")
}
```

### 3. 이미지 캐싱 (SDWebImage 또는 Kingfisher 사용 권장)
```swift
// Kingfisher 예시
import Kingfisher

KFImage(URL(string: book.coverImage ?? ""))
    .placeholder {
        ProgressView()
    }
    .resizable()
    .aspectRatio(contentMode: .fit)
```

## 📱 오프라인 지원

```swift
import Network

class NetworkMonitor: ObservableObject {
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")

    @Published var isConnected = true

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
            }
        }
        monitor.start(queue: queue)
    }
}
```

## 🔄 동기화 전략

1. **정기 동기화**: 앱이 foreground로 올 때마다 데이터 새로고침
2. **캐싱**: 자주 사용하는 데이터는 Core Data나 UserDefaults에 캐싱
3. **Optimistic UI**: 서버 응답 전에 UI 먼저 업데이트

## 🧪 테스트

```swift
import XCTest

class BookServiceTests: XCTestCase {
    func testSearchBooks() async throws {
        let books = try await BookService.shared.searchBooks(query: "클린코드")
        XCTAssertFalse(books.isEmpty)
    }

    func testAddToWishlist() async throws {
        let readingBook = try await ReadingBookService.shared.addToWishlist(
            bookId: "test-book-id"
        )
        XCTAssertEqual(readingBook.status, .wishlist)
    }
}
```

## 📚 추가 리소스

- [Supabase Swift 공식 문서](https://supabase.com/docs/reference/swift)
- [Swift Concurrency (async/await)](https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html)
- [URLSession 공식 문서](https://developer.apple.com/documentation/foundation/urlsession)

## 💡 팁

1. **Combine 대신 async/await 사용**: iOS 15+ 타겟팅 시 async/await가 더 간결합니다
2. **에러 처리 철저히**: 모든 네트워크 요청에 do-catch 사용
3. **메모리 관리**: 이미지 같은 대용량 데이터는 적절히 캐싱/해제
4. **사용자 경험**: 로딩 상태와 에러 상태를 명확히 표시

## 🆘 문제 해결

### 일반적인 문제

1. **401 Unauthorized**: JWT 토큰 확인 또는 재로그인 필요
2. **Network timeout**: 타임아웃 설정 조정 필요
3. **JSON decoding 실패**: 모델과 API 응답 구조 일치 확인

---

**문의사항이 있으시면 [support@dockdock.app](mailto:support@dockdock.app)으로 연락주세요.**
