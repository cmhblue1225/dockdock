import api from './api';
import type { RecommendedBook, TrendingBook } from '../types/recommendation';

/**
 * 개인화 추천 가져오기
 */
export async function getPersonalizedRecommendations(
  limit: number = 10,
  forceRefresh: boolean = false
): Promise<RecommendedBook[]> {
  const response = await api.get<{ success: boolean; data: RecommendedBook[] }>(
    '/api/v1/recommendations/personalized',
    { params: { limit, force_refresh: forceRefresh } }
  );
  return response.data.data;
}

/**
 * 트렌딩 책 가져오기
 */
export async function getTrendingBooks(limit: number = 10): Promise<TrendingBook[]> {
  const response = await api.get<{ success: boolean; data: TrendingBook[] }>(
    '/api/v1/recommendations/trending',
    { params: { limit } }
  );
  return response.data.data;
}

/**
 * 유사한 책 가져오기
 */
export async function getSimilarBooks(bookId: string, limit: number = 5): Promise<RecommendedBook[]> {
  const response = await api.get<{ success: boolean; data: RecommendedBook[] }>(
    `/api/v1/recommendations/similar/${bookId}`,
    { params: { limit } }
  );
  return response.data.data;
}

/**
 * 추천 새로고침
 */
export async function refreshRecommendations(): Promise<RecommendedBook[]> {
  const response = await api.post<{ success: boolean; data: RecommendedBook[] }>(
    '/api/v1/recommendations/refresh'
  );
  return response.data.data;
}
