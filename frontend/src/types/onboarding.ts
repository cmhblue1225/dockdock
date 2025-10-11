/**
 * 온보딩 관련 타입 정의
 */

export interface Genre {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface OnboardingBook {
  id: string;
  title: string;
  author: string | null;
  coverImage: string | null;
  description: string | null;
  genre: string;
}

export interface SaveUserPreferencesDto {
  preferred_genres: string[];
  preferred_authors?: string[];
  selected_book_ids?: string[];
}

export interface OnboardingStatus {
  completed: boolean;
}
