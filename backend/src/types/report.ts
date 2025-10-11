/**
 * 백엔드 온보딩 레포트 타입 정의
 */

/**
 * 레이더 차트 데이터 포인트
 */
export interface RadarChartPoint {
  subject: string;
  value: number;
  category: string;
  description: string;
}

/**
 * 독서 DNA
 */
export interface ReadingDNA {
  purposes: {
    primary: string;
    secondary: string[];
    analysis: string;
  };
  style: {
    length: string;
    pace: string;
    difficulty: string;
    analysis: string;
  };
  atmosphere: {
    moods: string[];
    emotions: string[];
    dominantMood: string;
    emotionalRange: 'narrow' | 'moderate' | 'wide';
    analysis: string;
  };
  content: {
    themes: string[];
    narrativeStyles: string[];
    genres: string[];
    primaryTheme: string;
    analysis: string;
  };
}

/**
 * 성격 프로필
 */
export interface PersonalityProfile {
  openness: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    description: string;
  };
  conscientiousness: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    description: string;
  };
  extraversion: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    description: string;
  };
  agreeableness: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    description: string;
  };
  neuroticism: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    description: string;
  };
}

/**
 * 독서 페르소나
 */
export interface ReadingPersona {
  title: string;
  subtitle: string;
  icon: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  description: string;
  keyTraits: string[];
  readingStrategy: string[];
}

/**
 * 추천 이유
 */
export interface RecommendationReason {
  category: 'genre' | 'theme' | 'mood' | 'style' | 'personality';
  matchScore: number;
  reason: string;
  relatedPreferences: string[];
}

/**
 * 추천 책 미리보기
 */
export interface RecommendedBookPreview {
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  overallMatchScore: number;
  reasons: RecommendationReason[];
  tagline: string;
  link?: string; // 알라딘 상세 페이지 링크
}

/**
 * 성장 가능성
 */
export interface GrowthPotential {
  currentScope: 'narrow' | 'moderate' | 'diverse';
  explorationAreas: {
    area: string;
    reason: string;
    difficulty: 'easy' | 'moderate' | 'challenging';
  }[];
  growthPath: string;
}

/**
 * 레포트 통계
 */
export interface ReportStatistics {
  totalResponses: number;
  diversityScore: number;
  clarityScore: number;
  completionRate: number;
}

/**
 * 온보딩 레포트
 */
export interface OnboardingReport {
  reportId: string;
  userId: string;
  createdAt: string;
  version: string;
  persona: ReadingPersona;
  personalityProfile: PersonalityProfile;
  readingDNA: ReadingDNA;
  radarChartData: RadarChartPoint[];
  recommendedBooks: RecommendedBookPreview[];
  growthPotential: GrowthPotential;
  statistics: ReportStatistics;
  executiveSummary: string;
  closingMessage: string;
}

/**
 * 온보딩 데이터 입력
 */
export interface OnboardingData {
  purposes: string[];
  favorite_genres: string[];
  preferred_length?: string;
  reading_pace?: string;
  preferred_difficulty?: string;
  preferred_moods?: string[];
  preferred_emotions?: string[];
  preferred_narrative_styles?: string[];
  preferred_themes?: string[];
}

/**
 * 레포트 생성 요청
 */
export interface GenerateReportRequest {
  userId: string;
  onboardingData: OnboardingData;
}

/**
 * 데이터베이스 레포트 스키마
 */
export interface OnboardingReportDB {
  id: string;
  user_id: string;
  report_data: OnboardingReport;
  created_at: string;
  updated_at: string;
  version: string;
}
