import axios from 'axios';
import { AladinApiResponse, AladinBookResponse, Book, BookSearchParams } from '../../../shared/types/book.types';

/**
 * 알라딘 API 클라이언트
 *
 * 알라딘 Open API 사용 가이드:
 * https://blog.aladin.co.kr/openapi/category/39154
 */
export class AladinApiClient {
  private readonly baseUrl = 'http://www.aladin.co.kr/ttb/api';
  private readonly ttbKey: string;

  constructor(ttbKey: string) {
    if (!ttbKey) {
      throw new Error('Aladin TTB Key is required');
    }
    this.ttbKey = ttbKey;
  }

  /**
   * 책 검색 (제목, 저자 등)
   */
  async searchBooks(params: BookSearchParams): Promise<{ books: Book[]; totalResults: number }> {
    try {
      const {
        query = '',
        queryType = 'Title',
        maxResults = 10,
        start = 1,
        sort = 'Accuracy',
        searchTarget = 'Book'
      } = params;

      if (!query) {
        throw new Error('검색어를 입력해주세요');
      }

      const response = await axios.get<AladinApiResponse>(`${this.baseUrl}/ItemSearch.aspx`, {
        params: {
          ttbkey: this.ttbKey,
          Query: query,
          QueryType: queryType,
          MaxResults: Math.min(maxResults, 50), // 최대 50개
          start,
          SearchTarget: searchTarget,
          Sort: sort,
          output: 'js',
          Version: '20131101'
        },
        timeout: 10000
      });

      const books = response.data.item.map(item => this.transformAladinBook(item));

      return {
        books,
        totalResults: response.data.totalResults
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`알라딘 API 호출 실패: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * ISBN으로 책 검색 (정확한 책 정보 조회)
   */
  async searchByISBN(isbn: string): Promise<Book | null> {
    try {
      if (!isbn) {
        throw new Error('ISBN을 입력해주세요');
      }

      // ISBN에서 하이픈 제거
      const cleanIsbn = isbn.replace(/-/g, '');

      const response = await axios.get<AladinApiResponse>(`${this.baseUrl}/ItemSearch.aspx`, {
        params: {
          ttbkey: this.ttbKey,
          Query: cleanIsbn,
          QueryType: 'ISBN',
          MaxResults: 1,
          SearchTarget: 'Book',
          output: 'js',
          Version: '20131101'
        },
        timeout: 10000
      });

      if (!response.data.item || response.data.item.length === 0) {
        return null;
      }

      return this.transformAladinBook(response.data.item[0]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`알라딘 API 호출 실패: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 상품 ID로 상세 정보 조회
   */
  async getBookDetail(itemId: string): Promise<Book | null> {
    try {
      const response = await axios.get<AladinApiResponse>(`${this.baseUrl}/ItemLookUp.aspx`, {
        params: {
          ttbkey: this.ttbKey,
          itemIdType: 'ItemId',
          ItemId: itemId,
          output: 'js',
          Version: '20131101',
          OptResult: 'ebookList,usedList,reviewList'
        },
        timeout: 10000
      });

      if (!response.data.item || response.data.item.length === 0) {
        return null;
      }

      return this.transformAladinBook(response.data.item[0]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`알라딘 API 호출 실패: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 알라딘 API 응답을 우리 Book 타입으로 변환
   */
  private transformAladinBook(item: AladinBookResponse): Book {
    return {
      id: item.itemId.toString(),
      isbn: item.isbn || '',
      isbn13: item.isbn13 || '',
      title: item.title,
      subtitle: item.subInfo?.subTitle,
      author: item.author,
      publisher: item.publisher,
      publishedDate: item.pubDate,
      description: item.description || '',
      coverImage: item.cover,
      categoryName: item.categoryName,
      pageCount: item.subInfo?.itemPage,
      price: {
        standard: item.priceStandard,
        sales: item.priceSales,
        currency: 'KRW'
      },
      link: item.link,
      stockStatus: item.stockStatus,
      rating: item.customerReviewRank / 2 // 10점 만점을 5점 만점으로 변환
    };
  }
}

/**
 * 알라딘 API 클라이언트 싱글톤 인스턴스
 */
let aladinClient: AladinApiClient | null = null;

export const getAladinClient = (): AladinApiClient => {
  if (!aladinClient) {
    const ttbKey = process.env.ALADIN_TTB_KEY;
    if (!ttbKey) {
      throw new Error('ALADIN_TTB_KEY 환경 변수가 설정되지 않았습니다');
    }
    aladinClient = new AladinApiClient(ttbKey);
  }
  return aladinClient;
};
