/**
 * 추천 관련 타입 정의
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
  rank?: number;
}

export interface TrendingBook extends RecommendedBook {
  rank: number;
}

export interface PersonalizedRecommendation {
  books: RecommendedBook[];
  totalCount: number;
}
