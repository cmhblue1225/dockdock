/**
 * Big Five 성격 매핑 시스템
 * 설계 문서의 선호도-성격 매핑 매트릭스를 구현
 */

import {
  BigFiveScores,
  BigFiveProfile,
  BigFiveTrait,
  PersonaResult,
  RadarChartDataPoint,
} from '../types/report.types';

/**
 * Big Five 매핑 매트릭스 (설계 문서 기반)
 * 각 선호도 선택에 따른 성격 점수 가중치
 */
const MAPPING_MATRIX: Record<string, Record<string, Partial<BigFiveScores>>> = {
  // 난이도
  difficulty: {
    challenging: { openness: 3, conscientiousness: 1 },
    moderate: { openness: 1 },
    easy: { openness: -2, agreeableness: 1 },
    any: {},
  },

  // 분위기
  moods: {
    philosophical: { openness: 3 },
    bright: { extraversion: 2, agreeableness: 1, emotional_stability: 2 },
    dark: { openness: 1, emotional_stability: -2 },
    neutral: { conscientiousness: 1 },
    emotional: { agreeableness: 2, emotional_stability: -1 },
  },

  // 감정
  emotions: {
    joy: { extraversion: 2, agreeableness: 1, emotional_stability: 2 },
    sadness: { openness: 1, extraversion: -1, emotional_stability: -2 },
    tension: { openness: 1, agreeableness: -1, emotional_stability: -2 },
    inspiration: { openness: 2, emotional_stability: 1 },
    fear: { openness: 1, emotional_stability: -3 },
    empathy: { agreeableness: 3, emotional_stability: 1 },
  },

  // 주제
  themes: {
    growth: { openness: 2, conscientiousness: 2 },
    love: { agreeableness: 2, extraversion: 1 },
    friendship: { agreeableness: 2, extraversion: 1 },
    family: { agreeableness: 3, conscientiousness: 1 },
    social_issues: { openness: 2, conscientiousness: 1 },
    history: { openness: 1, conscientiousness: 2 },
    future: { openness: 2 },
    fantasy: { openness: 3, agreeableness: -1 },
  },

  // 서술 스타일
  narrative_styles: {
    metaphorical: { openness: 2, extraversion: -1 },
    direct: { openness: -1, conscientiousness: 1, extraversion: 1, emotional_stability: 1 },
    philosophical: { openness: 3, conscientiousness: 1 },
    descriptive: { openness: 1, conscientiousness: 1 },
    dialogue: { extraversion: 2, agreeableness: 1 },
  },

  // 독서 목적
  purposes: {
    leisure: { emotional_stability: 1 },
    learning: { openness: 2, conscientiousness: 2 },
    self_development: { conscientiousness: 3, openness: 1 },
    emotional_relief: { emotional_stability: -1, agreeableness: 1 },
    inspiration: { openness: 2, emotional_stability: 1 },
  },

  // 책 길이
  length: {
    short: { conscientiousness: -1 },
    medium: {},
    long: { conscientiousness: 2, openness: 1 },
    any: {},
  },

  // 독서 속도
  pace: {
    fast: { extraversion: 1, conscientiousness: -1 },
    medium: {},
    slow: { conscientiousness: 2, openness: 1 },
  },
};

/**
 * 사용자 선호도를 Big Five 점수로 변환
 */
export function calculateBigFiveScores(preferences: {
  preferred_difficulty?: string;
  preferred_moods?: string[];
  preferred_emotions?: string[];
  preferred_themes?: string[];
  narrative_styles?: string[];
  reading_purposes?: string[];
  preferred_length?: string;
  reading_pace?: string;
}): BigFiveScores {
  // 초기 점수 (중립 = 50)
  const scores: BigFiveScores = {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    emotional_stability: 50,
  };

  // 난이도
  if (preferences.preferred_difficulty) {
    applyScoreModifier(scores, MAPPING_MATRIX.difficulty[preferences.preferred_difficulty]);
  }

  // 분위기 (복수 선택)
  if (preferences.preferred_moods) {
    preferences.preferred_moods.forEach((mood) => {
      if (MAPPING_MATRIX.moods[mood]) {
        applyScoreModifier(scores, MAPPING_MATRIX.moods[mood]);
      }
    });
  }

  // 감정 (복수 선택)
  if (preferences.preferred_emotions) {
    preferences.preferred_emotions.forEach((emotion) => {
      if (MAPPING_MATRIX.emotions[emotion]) {
        applyScoreModifier(scores, MAPPING_MATRIX.emotions[emotion]);
      }
    });
  }

  // 주제 (복수 선택)
  if (preferences.preferred_themes) {
    preferences.preferred_themes.forEach((theme) => {
      if (MAPPING_MATRIX.themes[theme]) {
        applyScoreModifier(scores, MAPPING_MATRIX.themes[theme]);
      }
    });
  }

  // 서술 스타일 (복수 선택)
  if (preferences.narrative_styles) {
    preferences.narrative_styles.forEach((style) => {
      if (MAPPING_MATRIX.narrative_styles[style]) {
        applyScoreModifier(scores, MAPPING_MATRIX.narrative_styles[style]);
      }
    });
  }

  // 독서 목적 (복수 선택)
  if (preferences.reading_purposes) {
    preferences.reading_purposes.forEach((purpose) => {
      if (MAPPING_MATRIX.purposes[purpose]) {
        applyScoreModifier(scores, MAPPING_MATRIX.purposes[purpose]);
      }
    });
  }

  // 책 길이
  if (preferences.preferred_length) {
    applyScoreModifier(scores, MAPPING_MATRIX.length[preferences.preferred_length]);
  }

  // 독서 속도
  if (preferences.reading_pace) {
    applyScoreModifier(scores, MAPPING_MATRIX.pace[preferences.reading_pace]);
  }

  // 점수 정규화 (0-100 범위로 제한)
  normalizeScores(scores);

  return scores;
}

/**
 * 점수 수정자 적용
 */
function applyScoreModifier(scores: BigFiveScores, modifier: Partial<BigFiveScores> | undefined) {
  if (!modifier) return;

  Object.entries(modifier).forEach(([key, value]) => {
    const k = key as keyof BigFiveScores;
    scores[k] += value;
  });
}

/**
 * 점수 정규화 (0-100 범위)
 */
function normalizeScores(scores: BigFiveScores) {
  Object.keys(scores).forEach((key) => {
    const k = key as keyof BigFiveScores;
    scores[k] = Math.max(0, Math.min(100, scores[k]));
  });
}

/**
 * Big Five 점수를 프로필로 변환 (레벨 + 설명)
 */
export function generateBigFiveProfile(scores: BigFiveScores): BigFiveProfile {
  return {
    openness: {
      name: '개방성',
      score: scores.openness,
      level: getLevel(scores.openness),
      description: getDescription('openness', scores.openness),
    },
    conscientiousness: {
      name: '성실성',
      score: scores.conscientiousness,
      level: getLevel(scores.conscientiousness),
      description: getDescription('conscientiousness', scores.conscientiousness),
    },
    extraversion: {
      name: '외향성',
      score: scores.extraversion,
      level: getLevel(scores.extraversion),
      description: getDescription('extraversion', scores.extraversion),
    },
    agreeableness: {
      name: '친화성',
      score: scores.agreeableness,
      level: getLevel(scores.agreeableness),
      description: getDescription('agreeableness', scores.agreeableness),
    },
    emotional_stability: {
      name: '정서적 안정성',
      score: scores.emotional_stability,
      level: getLevel(scores.emotional_stability),
      description: getDescription('emotional_stability', scores.emotional_stability),
    },
  };
}

/**
 * 점수를 레벨로 변환
 */
function getLevel(score: number): 'low' | 'moderate' | 'high' {
  if (score < 40) return 'low';
  if (score > 60) return 'high';
  return 'moderate';
}

/**
 * Big Five 각 특성에 대한 설명 생성
 */
function getDescription(trait: keyof BigFiveScores, score: number): string {
  const level = getLevel(score);

  const descriptions: Record<keyof BigFiveScores, Record<string, string>> = {
    openness: {
      high: '새로운 아이디어와 경험에 개방적이며, 추상적이고 철학적인 사고를 즐깁니다. 복잡한 개념을 탐구하는 것을 선호합니다.',
      moderate: '익숙한 것과 새로운 것 사이의 균형을 추구하며, 적절한 수준의 도전을 즐깁니다.',
      low: '구체적이고 실용적인 내용을 선호하며, 익숙하고 입증된 것을 신뢰합니다.',
    },
    conscientiousness: {
      high: '체계적이고 계획적인 독서를 선호하며, 깊이 있는 학습과 자기계발을 중요시합니다. 목표 지향적입니다.',
      moderate: '적절한 계획과 유연성을 모두 갖춘 독서 스타일을 선호합니다.',
      low: '자유롭고 즉흥적인 독서를 선호하며, 가벼운 마음으로 책을 접근합니다.',
    },
    extraversion: {
      high: '사교적이고 활기찬 내용을 선호하며, 대화와 상호작용이 중심인 이야기를 즐깁니다.',
      moderate: '내성적인 부분과 외향적인 부분의 균형을 추구합니다.',
      low: '내성적이고 사색적인 독서를 선호하며, 개인의 내면 세계를 탐구하는 것을 즐깁니다.',
    },
    agreeableness: {
      high: '따뜻하고 공감적인 이야기를 선호하며, 인간 관계와 감정적 연결을 중요시합니다.',
      moderate: '다양한 인간 관계와 감정을 균형있게 다루는 내용을 선호합니다.',
      low: '객관적이고 분석적인 접근을 선호하며, 갈등과 긴장감이 있는 이야기를 즐깁니다.',
    },
    emotional_stability: {
      high: '밝고 긍정적인 내용을 선호하며, 안정감과 편안함을 주는 이야기를 즐깁니다.',
      moderate: '다양한 감정을 경험할 수 있는 균형 잡힌 내용을 선호합니다.',
      low: '강렬한 감정과 복잡한 심리를 다루는 이야기에 끌립니다. 깊은 감정적 울림을 추구합니다.',
    },
  };

  return descriptions[trait][level];
}

/**
 * Big Five 점수 기반 페르소나 생성 (규칙 기반)
 */
export function generatePersona(scores: BigFiveScores): PersonaResult {
  // 가장 높은 점수 2개 추출
  const sortedTraits = (Object.entries(scores) as [keyof BigFiveScores, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const dominantTrait = sortedTraits[0][0];
  const secondaryTrait = sortedTraits[1][0];

  // 페르소나 규칙 (설계 문서 기반)
  const personaRules: Record<string, Partial<PersonaResult>> = {
    'openness-high': {
      title: '철학적 탐험가',
      icon: '🔭',
      subtitle: '새로운 관점으로 세상을 바라보는',
      description: '호기심이 넘치는 당신은 새로운 아이디어와 관점을 탐험하는 것을 즐깁니다.',
      color: '#6366f1',
      keyTraits: ['호기심 많은', '창의적인', '추상적 사고'],
    },
    'conscientiousness-high': {
      title: '성실한 학습자',
      icon: '📚',
      subtitle: '체계적으로 지식을 쌓아가는',
      description: '목표 지향적인 당신은 계획적이고 체계적으로 지식을 축적합니다.',
      color: '#3b82f6',
      keyTraits: ['목표 지향적', '계획적인', '성취 중시'],
    },
    'extraversion-high': {
      title: '아드레날린 플롯 추격자',
      icon: '⚡',
      subtitle: '역동적인 이야기를 즐기는',
      description: '활기차고 역동적인 이야기를 통해 에너지를 얻는 당신은 행동 중심적입니다.',
      color: '#f59e0b',
      keyTraits: ['활기찬', '사교적인', '행동 지향적'],
    },
    'agreeableness-high': {
      title: '공감적 연결자',
      icon: '💕',
      subtitle: '따뜻한 이야기로 마음을 나누는',
      description: '타인의 감정에 깊이 공감하며, 따뜻한 인간 관계 이야기를 선호합니다.',
      color: '#ec4899',
      keyTraits: ['공감 능력 높은', '관계 중시', '따뜻한'],
    },
    'emotional_stability-high': {
      title: '평온한 관찰자',
      icon: '🌸',
      subtitle: '안정감 있는 이야기를 선호하는',
      description: '차분하고 균형 잡힌 당신은 긍정적이고 안정적인 이야기를 즐깁니다.',
      color: '#10b981',
      keyTraits: ['차분한', '긍정적인', '균형 잡힌'],
    },
    'emotional_stability-low': {
      title: '감성적 몰입러',
      icon: '🌙',
      subtitle: '깊은 감정의 세계를 탐험하는',
      description: '감수성이 풍부한 당신은 깊은 감정과 복잡한 심리를 탐험하는 것을 즐깁니다.',
      color: '#8b5cf6',
      keyTraits: ['감수성 풍부한', '내면 탐구', '깊이 있는'],
    },
  };

  // 기본 페르소나
  let persona: PersonaResult = {
    title: '균형 잡힌 독서가',
    icon: '📖',
    subtitle: '다양한 장르를 즐기는',
    description: '다양한 장르의 책을 즐기는 당신은 여러 관점에서 세상을 바라볼 수 있는 독서가입니다.',
    color: '#6366f1',
    keyTraits: ['다재다능한', '개방적인', '균형 잡힌'],
  };

  // 규칙 기반 페르소나 매칭
  const key = `${dominantTrait}-${getLevel(scores[dominantTrait])}`;
  if (personaRules[key]) {
    persona = { ...persona, ...personaRules[key] } as PersonaResult;
  }

  // 조합 페르소나 (두 가지 특성 결합)
  const combo = `${dominantTrait}+${secondaryTrait}`;
  const comboPersonas: Record<string, Partial<PersonaResult>> = {
    'openness+conscientiousness': {
      title: '지적 탐구자',
      icon: '🔬',
      subtitle: '깊이 있는 학습을 추구하는',
    },
    'openness+agreeableness': {
      title: '예술적 감성가',
      icon: '🎨',
      subtitle: '아름다운 이야기에 빠져드는',
    },
    'extraversion+agreeableness': {
      title: '사교적 공감자',
      icon: '🤝',
      subtitle: '사람들과의 이야기를 나누는',
    },
    'conscientiousness+agreeableness': {
      title: '헌신적 성장가',
      icon: '🌱',
      subtitle: '성장과 관계를 모두 중시하는',
    },
  };

  if (comboPersonas[combo]) {
    persona = { ...persona, ...comboPersonas[combo] } as PersonaResult;
  }

  return persona;
}

/**
 * 레이더 차트 데이터 생성
 */
export function generateRadarChartData(scores: BigFiveScores): RadarChartDataPoint[] {
  return [
    { subject: '개방성', A: scores.openness, fullMark: 100 },
    { subject: '성실성', A: scores.conscientiousness, fullMark: 100 },
    { subject: '외향성', A: scores.extraversion, fullMark: 100 },
    { subject: '친화성', A: scores.agreeableness, fullMark: 100 },
    { subject: '안정성', A: scores.emotional_stability, fullMark: 100 },
  ];
}
