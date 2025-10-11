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
 * 독서 선호도 상세 정보 (확장)
 */
export interface ReadingPreferences {
  // 기본 선호도
  preferred_genres: string[];
  preferred_authors?: string[];
  selected_book_ids?: string[];

  // 독서 목적
  reading_purposes?: string[]; // ['여가', '학습', '자기계발', '영감']

  // 책 스타일
  preferred_length?: 'short' | 'medium' | 'long' | 'any';
  reading_pace?: 'fast' | 'medium' | 'slow';
  preferred_difficulty?: 'easy' | 'moderate' | 'challenging' | 'any';

  // 분위기 & 감정
  preferred_moods?: string[]; // ['밝은', '어두운', '중립적', '철학적', '감성적']
  preferred_emotions?: string[]; // ['감동', '긴장', '유머', '슬픔', '영감', '공포']

  // 서술 & 주제
  narrative_styles?: string[]; // ['직설적', '비유적', '철학적', '묘사적', '대화형']
  preferred_themes?: string[]; // ['성장', '사랑', '우정', '가족', '사회', '역사', '미래', '판타지']
}

/**
 * 사용자 선택 저장 DTO (확장)
 */
export interface SaveUserPreferencesDto extends ReadingPreferences {}

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
