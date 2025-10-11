import api from './api';
import type { Genre, OnboardingBook, SaveUserPreferencesDto, OnboardingStatus } from '../types/onboarding';

/**
 * 온보딩 장르 목록 가져오기
 */
export async function getOnboardingGenres(): Promise<Genre[]> {
  const response = await api.get<{ success: boolean; data: Genre[] }>('/api/v1/onboarding/genres');
  return response.data.data;
}

/**
 * 특정 장르의 책 가져오기
 */
export async function getGenreBooks(genre: string, limit: number = 5): Promise<OnboardingBook[]> {
  const response = await api.get<{ success: boolean; data: OnboardingBook[] }>(
    `/api/v1/onboarding/books/${genre}`,
    { params: { limit } }
  );
  return response.data.data;
}

/**
 * 사용자 선호도 저장
 */
export async function saveUserPreferences(preferences: SaveUserPreferencesDto): Promise<void> {
  await api.post<{ success: boolean }>('/api/v1/onboarding/preferences', preferences);
}

/**
 * 온보딩 상태 확인
 */
export async function getOnboardingStatus(): Promise<boolean> {
  const response = await api.get<{ success: boolean; data: OnboardingStatus }>('/api/v1/onboarding/status');
  return response.data.data.completed;
}
