/**
 * 온보딩 레포트 타입 정의
 * 사용자의 독서 성향을 분석하고 감성적이며 전문적인 리포트 생성
 */

/**
 * 레이더 차트 데이터 포인트
 */
export interface RadarChartPoint {
  /** 항목명 (예: "감성", "지적 호기심", "모험심") */
  subject: string;
  /** 점수 (0-100) */
  value: number;
  /** 카테고리 (예: "personality", "preference") */
  category: string;
  /** 점수에 대한 설명 */
  description: string;
}

/**
 * 독서 DNA 구조
 */
export interface ReadingDNA {
  /** 독서 목적 분석 */
  purposes: {
    primary: string; // 주 목적 ID
    secondary: string[]; // 부 목적 IDs
    analysis: string; // AI 생성 분석 텍스트
  };

  /** 독서 스타일 분석 */
  style: {
    length: 'short' | 'medium' | 'long' | 'any';
    pace: 'fast' | 'medium' | 'slow';
    difficulty: 'easy' | 'moderate' | 'challenging' | 'any';
    analysis: string; // AI 생성 분석 텍스트
  };

  /** 분위기 및 감정 선호 */
  atmosphere: {
    moods: string[]; // mood IDs
    emotions: string[]; // emotion IDs
    dominantMood: string; // 지배적 분위기
    emotionalRange: 'narrow' | 'moderate' | 'wide'; // 감정 범위
    analysis: string; // AI 생성 분석 텍스트
  };

  /** 콘텐츠 선호 */
  content: {
    themes: string[]; // theme IDs
    narrativeStyles: string[]; // narrative style IDs
    genres: string[]; // genre IDs
    primaryTheme: string; // 주요 테마
    analysis: string; // AI 생성 분석 텍스트
  };
}

/**
 * 성격 프로필 (Big Five 기반 독서 성향 매핑)
 */
export interface PersonalityProfile {
  /** 개방성 (Openness) - 새로운 경험에 대한 개방성 */
  openness: {
    score: number; // 0-100
    level: 'low' | 'moderate' | 'high';
    description: string;
  };

  /** 성실성 (Conscientiousness) - 계획적이고 조직적인 성향 */
  conscientiousness: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    description: string;
  };

  /** 외향성 (Extraversion) - 사회적 에너지 */
  extraversion: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    description: string;
  };

  /** 친화성 (Agreeableness) - 타인에 대한 공감 */
  agreeableness: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    description: string;
  };

  /** 신경성 (Neuroticism) - 정서적 안정성 */
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
  /** 페르소나 이름 (예: "감성적인 탐험가", "지적인 몽상가") */
  title: string;

  /** 페르소나 부제 */
  subtitle: string;

  /** 페르소나 아이콘/이모지 */
  icon: string;

  /** 페르소나 색상 테마 */
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };

  /** 상세 설명 (AI 생성) */
  description: string;

  /** 핵심 특징 (3-5개) */
  keyTraits: string[];

  /** 추천 독서 전략 */
  readingStrategy: string[];
}

/**
 * 추천 이유 상세 분석
 */
export interface RecommendationReason {
  /** 추천 카테고리 */
  category: 'genre' | 'theme' | 'mood' | 'style' | 'personality';

  /** 매칭 점수 (0-100) */
  matchScore: number;

  /** 이유 설명 */
  reason: string;

  /** 관련 사용자 선호사항 */
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

  /** 종합 매칭 점수 (0-100) */
  overallMatchScore: number;

  /** 추천 이유들 */
  reasons: RecommendationReason[];

  /** 한 줄 추천 문구 (AI 생성) */
  tagline: string;

  /** 알라딘 상세 페이지 링크 (선택적) */
  link?: string;
}

/**
 * 성장 가능성 분석
 */
export interface GrowthPotential {
  /** 현재 독서 범위 */
  currentScope: 'narrow' | 'moderate' | 'diverse';

  /** 탐험 추천 영역 */
  explorationAreas: {
    area: string; // 영역명 (예: "SF/판타지", "고전 문학")
    reason: string; // 추천 이유
    difficulty: 'easy' | 'moderate' | 'challenging';
  }[];

  /** 성장 방향 제안 */
  growthPath: string;
}

/**
 * 통계 요약
 */
export interface ReportStatistics {
  /** 총 응답 수 */
  totalResponses: number;

  /** 선호 다양성 점수 (0-100) */
  diversityScore: number;

  /** 명확성 점수 (선택의 일관성, 0-100) */
  clarityScore: number;

  /** 완성도 (0-100) */
  completionRate: number;
}

/**
 * 온보딩 레포트 메인 인터페이스
 */
export interface OnboardingReport {
  /** 레포트 ID */
  reportId: string;

  /** 사용자 ID */
  userId: string;

  /** 생성 시간 */
  createdAt: string;

  /** 버전 (레포트 포맷 버전) */
  version: string;

  /** 독서 페르소나 */
  persona: ReadingPersona;

  /** 성격 프로필 */
  personalityProfile: PersonalityProfile;

  /** 독서 DNA */
  readingDNA: ReadingDNA;

  /** 레이더 차트 데이터 */
  radarChartData: RadarChartPoint[];

  /** 추천 책 미리보기 (3-5권) */
  recommendedBooks: RecommendedBookPreview[];

  /** 성장 가능성 분석 */
  growthPotential: GrowthPotential;

  /** 통계 요약 */
  statistics: ReportStatistics;

  /** 전체 요약 (AI 생성, 감성적이고 전문적인 텍스트) */
  executiveSummary: string;

  /** 맺음말 (AI 생성, 격려 메시지) */
  closingMessage: string;
}

/**
 * 레포트 생성 요청 페이로드
 */
export interface GenerateReportRequest {
  userId: string;
  onboardingData: {
    purposes: string[];
    favorite_genres: string[];
    preferred_length?: string;
    reading_pace?: string;
    preferred_difficulty?: string;
    preferred_moods?: string[];
    preferred_emotions?: string[];
    preferred_narrative_styles?: string[];
    preferred_themes?: string[];
  };
}

/**
 * 레포트 저장용 데이터베이스 스키마
 */
export interface OnboardingReportDB {
  id: string;
  user_id: string;
  report_data: OnboardingReport; // JSONB
  created_at: string;
  updated_at: string;
  version: string;
}

/**
 * 레포트 조회 응답
 */
export interface GetReportResponse {
  success: boolean;
  report: OnboardingReport | null;
  error?: string;
}

/**
 * 레포트 생성 응답
 */
export interface GenerateReportResponse {
  success: boolean;
  report: OnboardingReport;
  error?: string;
}
