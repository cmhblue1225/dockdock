/**
 * 추천 시스템 관련 타입 정의
 */

/**
 * 사용자 취향
 */
export interface UserPreference {
  id: string;
  user_id: string;
  preferred_genres: string[];
  preferred_authors: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 책 장르
 */
export interface BookGenre {
  id: string;
  book_id: string;
  genre: string;
  created_at: string;
}

/**
 * 인기 책
 */
export interface TrendingBook {
  id: string;
  book_id: string;
  rank: number;
  score: number;
  period: 'daily' | 'weekly';
  updated_at: string;
  book?: {
    id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    cover_image_url: string | null;
    description: string | null;
    category: string | null;
  };
}

/**
 * 추천 기록
 */
export interface Recommendation {
  id: string;
  user_id: string;
  book_id: string;
  recommendation_type: 'personalized' | 'trending' | 'similar';
  score: number;
  reason: string | null;
  created_at: string;
  expires_at: string;
  book?: {
    id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    cover_image_url: string | null;
    description: string | null;
    category: string | null;
  };
}

/**
 * 추천 책 응답 (프론트엔드용)
 */
export interface RecommendedBook {
  id: string;
  aladinId?: string;
  title: string;
  author: string | null;
  publisher: string | null;
  coverImage: string | null;
  description: string | null;
  category: string | null;
  reason: string;
  score: number;
  rank?: number; // 트렌딩 책인 경우 순위
}

/**
 * 개인화 추천 요청 DTO
 */
export interface GetPersonalizedRecommendationsDto {
  limit?: number;
  forceRefresh?: boolean;
}

/**
 * 유사 책 추천 요청 DTO
 */
export interface GetSimilarBooksDto {
  bookId: string;
  limit?: number;
}

/**
 * OpenAI 추천 응답
 */
export interface OpenAIRecommendation {
  title: string;
  author: string;
  isbn13?: string;
  reason: string;
  score: number;
}
