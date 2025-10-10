/**
 * 알라딘 API 응답 타입
 */
export interface AladinBookResponse {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  isbn: string;
  isbn13: string;
  itemId: number;
  priceSales: number;
  priceStandard: number;
  mallType: string;
  stockStatus: string;
  mileage: number;
  cover: string;
  categoryId: number;
  categoryName: string;
  publisher: string;
  salesPoint: number;
  adult: boolean;
  fixedPrice: boolean;
  customerReviewRank: number;
  subInfo?: {
    subTitle?: string;
    originalTitle?: string;
    itemPage?: number;
  };
}

export interface AladinApiResponse {
  version: string;
  logo: string;
  title: string;
  link: string;
  pubDate: string;
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  query: string;
  searchCategoryId?: number;
  searchCategoryName?: string;
  item: AladinBookResponse[];
}

/**
 * 클라이언트에 제공할 책 정보 타입
 */
export interface Book {
  // 기본 식별 정보
  id: string;                    // itemId
  isbn: string;                  // ISBN-10
  isbn13: string;                // ISBN-13

  // 기본 도서 정보
  title: string;                 // 제목
  subtitle?: string;             // 부제
  author: string;                // 저자
  publisher: string;             // 출판사
  publishedDate: string;         // 출판일

  // 상세 정보
  description: string;           // 책 설명
  coverImage: string;            // 표지 이미지 URL
  categoryName: string;          // 카테고리
  pageCount?: number;            // 페이지 수

  // 가격 정보
  price: {
    standard: number;            // 정가
    sales: number;               // 판매가
    currency: string;            // 통화 (KRW)
  };

  // 부가 정보
  link: string;                  // 알라딘 상품 링크
  stockStatus: string;           // 재고 상태
  rating?: number;               // 고객 평점

  // 독서 관리용 메타데이터 (선택적)
  addedAt?: string;              // 등록 시간 (ISO string)
}

/**
 * 책 검색 요청 파라미터
 */
export interface BookSearchParams {
  query?: string;                // 제목 또는 저자 검색
  isbn?: string;                 // ISBN 검색
  queryType?: 'Title' | 'Author' | 'Publisher' | 'Keyword';
  maxResults?: number;           // 최대 결과 수 (기본: 10)
  start?: number;                // 시작 인덱스 (페이지네이션)
  sort?: 'Accuracy' | 'PublishTime' | 'Title' | 'SalesPoint';
  searchTarget?: 'Book' | 'Foreign' | 'Music' | 'DVD' | 'All';
}

/**
 * 책 검색 응답
 */
export interface BookSearchResponse {
  success: true;
  data: {
    books: Book[];
    totalResults: number;
    currentPage: number;
    itemsPerPage: number;
    query: string;
  };
}

/**
 * 단일 책 조회 응답 (독서 중인 책 등록용)
 */
export interface BookDetailResponse {
  success: true;
  data: Book;
  message?: string;
}
