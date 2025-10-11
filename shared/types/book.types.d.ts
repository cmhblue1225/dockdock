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
    id: string;
    isbn: string;
    isbn13: string;
    title: string;
    subtitle?: string;
    author: string;
    publisher: string;
    publishedDate: string;
    description: string;
    coverImage: string;
    categoryName: string;
    pageCount?: number;
    price: {
        standard: number;
        sales: number;
        currency: string;
    };
    link: string;
    stockStatus: string;
    rating?: number;
    addedAt?: string;
}
/**
 * 책 검색 요청 파라미터
 */
export interface BookSearchParams {
    query?: string;
    isbn?: string;
    queryType?: 'Title' | 'Author' | 'Publisher' | 'Keyword';
    maxResults?: number;
    start?: number;
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
//# sourceMappingURL=book.types.d.ts.map