/**
 * 책 리뷰 (book_reviews 테이블)
 */
export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  reading_book_id: string;
  rating: number; // 1-5
  review_text: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 리뷰 생성 DTO
 */
export interface CreateReviewDto {
  reading_book_id: string;
  rating: number;
  review_text?: string;
}

/**
 * 리뷰 업데이트 DTO
 */
export interface UpdateReviewDto {
  rating?: number;
  review_text?: string;
  is_public?: boolean;
}

/**
 * 리뷰 with 책 정보 (JOIN)
 */
export interface ReviewWithBook extends Review {
  reading_book: {
    id: string;
    book_id: string;
    status: string;
    book: {
      id: string;
      title: string;
      author: string | null;
      cover_image_url: string | null;
    };
  };
}
