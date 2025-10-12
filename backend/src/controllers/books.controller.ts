import { Request, Response } from 'express';
import { getAladinClient } from '../services/aladin.service';
import { BookSearchParams } from '../../../shared/types/book.types';
import { supabase } from '../services/supabase.service';
import { sendSuccess, sendError, ErrorCodes } from '../utils/response.util';

/**
 * 책 검색 및 조회 컨트롤러
 *
 * 독서 관리 앱에서 사용할 책 정보 제공
 * - 제목 검색: 사용자가 책 제목을 입력하면 검색 결과 반환
 * - ISBN 검색: 바코드 스캔 또는 ISBN 입력 시 정확한 책 정보 반환
 */
export const booksController = {
  /**
   * 책 검색 (제목, 저자 등)
   *
   * GET /api/v1/books/search?query=클린코드&queryType=Title&maxResults=10
   */
  searchBooks: async (req: Request, res: Response) => {
    try {
      const {
        query,
        queryType = 'Title',
        maxResults = 10,
        start = 1,
        sort = 'Accuracy',
        searchTarget = 'Book'
      } = req.query;

      // 유효성 검증
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: '검색어(query)를 입력해주세요'
        });
      }

      const params: BookSearchParams = {
        query: query.trim(),
        queryType: queryType as any,
        maxResults: Number(maxResults),
        start: Number(start),
        sort: sort as any,
        searchTarget: searchTarget as any
      };

      const aladinClient = getAladinClient();
      const { books, totalResults } = await aladinClient.searchBooks(params);

      // 검색 결과가 없는 경우
      if (books.length === 0) {
        return res.status(404).json({
          success: false,
          message: '검색 결과가 없습니다',
          data: {
            books: [],
            totalResults: 0,
            currentPage: Number(start),
            itemsPerPage: Number(maxResults),
            query: query.trim()
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: `${books.length}개의 책을 찾았습니다`,
        data: {
          books,
          totalResults,
          currentPage: Number(start),
          itemsPerPage: Number(maxResults),
          query: query.trim()
        }
      });
    } catch (error) {
      console.error('책 검색 실패:', error);
      return res.status(500).json({
        success: false,
        message: '책 검색 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  /**
   * ISBN으로 책 검색 (독서 중인 책 등록용)
   *
   * GET /api/v1/books/isbn/{isbn}
   *
   * 사용 시나리오:
   * 1. 사용자가 바코드 스캔 또는 ISBN 입력
   * 2. 정확한 책 정보를 받아옴
   * 3. iOS/Web 앱에서 해당 정보로 "독서 중인 책" 자동 등록
   */
  searchByISBN: async (req: Request, res: Response) => {
    try {
      const { isbn } = req.params;

      if (!isbn) {
        return res.status(400).json({
          success: false,
          message: 'ISBN을 입력해주세요'
        });
      }

      const aladinClient = getAladinClient();
      const book = await aladinClient.searchByISBN(isbn);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: '해당 ISBN의 책을 찾을 수 없습니다',
          data: null
        });
      }

      // 독서 중인 책 등록을 위한 완전한 책 정보 반환
      return res.status(200).json({
        success: true,
        message: '책 정보를 성공적으로 조회했습니다',
        data: {
          ...book,
          addedAt: new Date().toISOString() // 등록 시간 추가
        }
      });
    } catch (error) {
      console.error('ISBN 검색 실패:', error);
      return res.status(500).json({
        success: false,
        message: 'ISBN 검색 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  /**
   * 책 상세 정보 조회 (알라딘 상품 ID)
   *
   * GET /api/v1/books/{bookId}
   */
  getBookDetail: async (req: Request, res: Response) => {
    try {
      const { bookId } = req.params;

      if (!bookId) {
        return res.status(400).json({
          success: false,
          message: '책 ID를 입력해주세요'
        });
      }

      const aladinClient = getAladinClient();
      const book = await aladinClient.getBookDetail(bookId);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: '책을 찾을 수 없습니다',
          data: null
        });
      }

      return res.status(200).json({
        success: true,
        message: '책 정보를 성공적으로 조회했습니다',
        data: {
          ...book,
          addedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('책 상세 조회 실패:', error);
      return res.status(500).json({
        success: false,
        message: '책 정보 조회 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  /**
   * 통합 검색 (제목 또는 ISBN)
   *
   * GET /api/v1/books?search=클린코드
   * GET /api/v1/books?search=9788966260959
   *
   * 사용자 입력이 ISBN인지 제목인지 자동 판별하여 검색
   * 독서 관리 앱의 메인 검색 기능으로 사용
   */
  unifiedSearch: async (req: Request, res: Response) => {
    try {
      const { search } = req.query;

      if (!search || typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: '검색어를 입력해주세요'
        });
      }

      const cleanSearch = search.trim().replace(/-/g, '');
      const aladinClient = getAladinClient();

      // ISBN 형식인지 확인 (10자리 또는 13자리 숫자)
      const isISBN = /^\d{10}(\d{3})?$/.test(cleanSearch);

      if (isISBN) {
        // ISBN 검색
        const book = await aladinClient.searchByISBN(cleanSearch);

        if (!book) {
          return res.status(404).json({
            success: false,
            message: '해당 ISBN의 책을 찾을 수 없습니다'
          });
        }

        return res.status(200).json({
          success: true,
          message: '책 정보를 성공적으로 조회했습니다',
          searchType: 'isbn',
          data: {
            ...book,
            addedAt: new Date().toISOString()
          }
        });
      } else {
        // 제목 검색
        const { books, totalResults } = await aladinClient.searchBooks({
          query: search.trim(),
          queryType: 'Title',
          maxResults: 10
        });

        if (books.length === 0) {
          return res.status(404).json({
            success: false,
            message: '검색 결과가 없습니다'
          });
        }

        return res.status(200).json({
          success: true,
          message: `${books.length}개의 책을 찾았습니다`,
          searchType: 'title',
          data: {
            books,
            totalResults
          }
        });
      }
    } catch (error) {
      console.error('통합 검색 실패:', error);
      return res.status(500).json({
        success: false,
        message: '검색 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  /**
   * 책을 데이터베이스에 저장
   *
   * POST /api/v1/books
   *
   * 검색된 책을 books 테이블에 저장하고 book_id를 반환
   * 중복 체크: isbn13이 이미 있으면 기존 책 정보 반환
   */
  createBook: async (req: Request, res: Response) => {
    try {
      let {
        title,
        author,
        publisher,
        cover_image_url,
        isbn,
        isbn13,
        page_count,
        published_date,
        description,
        category,
        aladin_id
      } = req.body;

      // 필수 필드 검증
      if (!title) {
        return sendError(res, ErrorCodes.VALIDATION_ERROR, '책 제목은 필수입니다', null, 400);
      }

      // isbn13으로 중복 체크
      if (isbn13) {
        const { data: existingBook } = await supabase
          .from('books')
          .select('*')
          .eq('isbn13', isbn13)
          .single();

        if (existingBook) {
          return sendSuccess(res, existingBook, '이미 등록된 책입니다', 200);
        }
      }

      // page_count가 없고 aladin_id가 있으면 상세 정보 조회
      if (!page_count && aladin_id) {
        try {
          const aladinClient = getAladinClient();
          const detailBook = await aladinClient.getBookDetail(aladin_id);
          if (detailBook && detailBook.pageCount) {
            page_count = detailBook.pageCount;
            console.log(`알라딘 상세 조회로 페이지 수 획득: ${page_count}`);
          }
        } catch (error) {
          console.warn('알라딘 상세 조회 실패 (계속 진행):', error);
          // 상세 조회 실패해도 책 등록은 계속 진행
        }
      }

      // 책 저장
      const { data, error } = await supabase
        .from('books')
        .insert({
          title,
          author,
          publisher,
          cover_image_url,
          isbn,
          isbn13,
          page_count,
          published_date,
          description,
          category,
          aladin_id
        })
        .select()
        .single();

      if (error) {
        console.error('책 저장 실패:', error);
        return sendError(res, ErrorCodes.DATABASE_ERROR, '책 저장에 실패했습니다', error.message, 500);
      }

      return sendSuccess(res, data, '책이 성공적으로 저장되었습니다', 201);
    } catch (error) {
      console.error('책 저장 오류:', error);
      return sendError(
        res,
        ErrorCodes.INTERNAL_ERROR,
        '책 저장 중 오류가 발생했습니다',
        error instanceof Error ? error.message : undefined,
        500
      );
    }
  }
};
