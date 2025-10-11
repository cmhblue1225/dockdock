/**
 * 온보딩 관련 타입 정의
 */

/**
 * 장르 정보
 */
export interface Genre {
  id: string;
  name: string;
  icon: string;
  description: string;
}

/**
 * 온보딩 책 정보
 */
export interface OnboardingBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  genre: string;
}

/**
 * 사용자 선택 저장 DTO
 */
export interface SaveUserPreferencesDto {
  preferred_genres: string[];
  preferred_authors?: string[];
  selected_book_ids?: string[];
}

/**
 * 온보딩 상태
 */
export interface OnboardingStatus {
  completed: boolean;
  step: number;
  preferences?: {
    genres: string[];
    authors: string[];
  };
}
