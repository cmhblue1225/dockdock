/**
 * 읽고 있는 책의 상태
 */
export type ReadingBookStatus = 'wishlist' | 'reading' | 'completed' | 'paused';

/**
 * 읽고 있는 책 (reading_books 테이블)
 */
export interface ReadingBook {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingBookStatus;
  current_page: number;
  total_pages: number | null;
  progress_percent: number | null; // 자동 계산 컬럼
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

/**
 * 읽고 있는 책 생성 DTO
 */
export interface CreateReadingBookDto {
  book_id: string;
  status: ReadingBookStatus;
  current_page?: number;
  total_pages?: number;
  started_at?: string;
}

/**
 * 읽고 있는 책 업데이트 DTO
 */
export interface UpdateReadingBookDto {
  status?: ReadingBookStatus;
  current_page?: number;
  total_pages?: number;
  started_at?: string;
  completed_at?: string;
}

/**
 * 읽고 있는 책 with 책 정보 (JOIN)
 */
export interface ReadingBookWithBook extends ReadingBook {
  book: {
    id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    cover_image_url: string | null;
    page_count: number | null;
  };
}
