/**
 * 온보딩 레포트 타입 정의
 * 백엔드와 동기화된 타입 구조
 */

/**
 * Big Five 성격 점수
 */
export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotional_stability: number;
}

/**
 * Big Five 프로필 레벨
 */
export type BigFiveLevel = 'low' | 'moderate' | 'high';

/**
 * Big Five 특성 프로필
 */
export interface BigFiveTrait {
  name: string;
  score: number;
  level: BigFiveLevel;
  description: string;
}

/**
 * Big Five 성격 프로필
 */
export interface BigFiveProfile {
  openness: BigFiveTrait;
  conscientiousness: BigFiveTrait;
  extraversion: BigFiveTrait;
  agreeableness: BigFiveTrait;
  emotional_stability: BigFiveTrait;
}

/**
 * 레이더 차트 데이터 포인트
 */
export interface RadarChartDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

/**
 * 독서 DNA 분석
 */
export interface ReadingDNA {
  title: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * 페르소나 결과
 */
export interface PersonaResult {
  title: string;
  icon: string;
  subtitle: string;
  description: string;
  color: string;
  keyTraits: string[];
}

/**
 * 독서 성향 분석
 */
export interface ReadingStyleAnalysis {
  mainStyle: {
    title: string;
    description: string;
    percentage: number;
  };
  subStyles: Array<{
    title: string;
    description: string;
    percentage: number;
  }>;
}

/**
 * 추천 독서 방향
 */
export interface ReadingDirection {
  category: string;
  reason: string;
  examples: string[];
}

/**
 * 추천 도서 (레포트용)
 */
export interface RecommendedBookForReport {
  id: string;
  aladinId?: string;
  title: string;
  author: string;
  publisher?: string;
  coverImage?: string;
  description?: string;
  category?: string;
  reason: string;
  matchScore: number;
}

/**
 * 성장 가능성 분석
 */
export interface GrowthPotential {
  currentLevel: string;
  nextLevel: string;
  suggestions: string[];
  challenges: Array<{
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}

/**
 * 온보딩 레포트 메인 인터페이스
 * 백엔드와 동기화됨
 */
export interface OnboardingReport {
  // 기본 정보
  userId: string;
  createdAt: string;

  // 페르소나
  persona: PersonaResult;

  // Big Five 성격 분석
  bigFive: {
    scores: BigFiveScores;
    profile: BigFiveProfile;
    radarChartData: RadarChartDataPoint[];
  };

  // 독서 DNA (3-5개의 핵심 특성)
  readingDNA: ReadingDNA[];

  // 독서 성향 분석
  readingStyle: ReadingStyleAnalysis;

  // 추천 독서 방향
  readingDirections: ReadingDirection[];

  // 추천 도서 목록
  recommendedBooks: RecommendedBookForReport[];

  // 온보딩에서 선택한 책들
  selectedBooks?: Array<{
    id: string;
    title: string;
    author: string;
    coverImage?: string;
  }>;

  // 성장 가능성 (선택적)
  growthPotential?: GrowthPotential;

  // AI 생성 종합 분석 (자연어 텍스트)
  aiSummary?: string;
}

/**
 * 레포트 생성 요청 데이터
 */
export interface GenerateReportRequest {
  userId: string;
  selectedBookIds?: string[];
}

/**
 * 레포트 저장 데이터 (Supabase)
 */
export interface OnboardingReportDB {
  id: string;
  user_id: string;
  report_data: OnboardingReport;
  created_at: string;
  updated_at: string;
}
