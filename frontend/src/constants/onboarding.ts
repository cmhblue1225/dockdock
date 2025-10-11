/**
 * 온보딩 상수 정의
 */

// 독서 목적
export const READING_PURPOSES = [
  { id: 'leisure', label: '여가', icon: '🎯', description: '즐거운 시간을 보내기 위해' },
  { id: 'learning', label: '학습', icon: '📚', description: '새로운 지식을 배우기 위해' },
  { id: 'self-development', label: '자기계발', icon: '💪', description: '더 나은 나를 만들기 위해' },
  { id: 'inspiration', label: '영감', icon: '✨', description: '창의적인 영감을 얻기 위해' },
];

// 책 길이 선호
export const BOOK_LENGTHS = [
  { id: 'short', label: '짧은 책', icon: '📖', description: '100-200 페이지' },
  { id: 'medium', label: '보통 길이', icon: '📚', description: '200-400 페이지' },
  { id: 'long', label: '긴 책', icon: '📕', description: '400 페이지 이상' },
  { id: 'any', label: '상관없음', icon: '✨', description: '길이는 중요하지 않아요' },
];

// 독서 속도
export const READING_PACES = [
  { id: 'fast', label: '빠름', icon: '⚡', description: '빠르게 읽어요' },
  { id: 'medium', label: '보통', icon: '⏱️', description: '천천히 음미하며 읽어요' },
  { id: 'slow', label: '느림', icon: '🐢', description: '아주 느리게 깊이 읽어요' },
];

// 난이도 선호
export const DIFFICULTIES = [
  { id: 'easy', label: '쉬운 책', icon: '😊', description: '편하게 읽을 수 있는' },
  { id: 'moderate', label: '보통', icon: '🤔', description: '적당히 생각하게 하는' },
  { id: 'challenging', label: '어려운 책', icon: '🧠', description: '깊이 사고하게 하는' },
  { id: 'any', label: '상관없음', icon: '✨', description: '난이도는 중요하지 않아요' },
];

// 분위기 선호
export const MOODS = [
  { id: 'bright', label: '밝은', icon: '☀️', description: '긍정적이고 경쾌한' },
  { id: 'dark', label: '어두운', icon: '🌙', description: '진지하고 묵직한' },
  { id: 'neutral', label: '중립적', icon: '⚖️', description: '균형잡힌' },
  { id: 'philosophical', label: '철학적', icon: '🤔', description: '사색적인' },
  { id: 'emotional', label: '감성적', icon: '💭', description: '감정이 풍부한' },
];

// 감정 선호
export const EMOTIONS = [
  { id: 'touching', label: '감동', icon: '😢', description: '눈물이 날 정도로 감동적인' },
  { id: 'tension', label: '긴장', icon: '😰', description: '손에 땀을 쥐게 하는' },
  { id: 'humor', label: '유머', icon: '😂', description: '웃음이 터지는' },
  { id: 'sadness', label: '슬픔', icon: '😔', description: '애잔하고 슬픈' },
  { id: 'inspiration', label: '영감', icon: '💡', description: '영감을 주는' },
  { id: 'horror', label: '공포', icon: '😱', description: '소름 돋는' },
];

// 서술 스타일
export const NARRATIVE_STYLES = [
  { id: 'direct', label: '직설적', icon: '💬', description: '명확하고 직접적인' },
  { id: 'metaphorical', label: '비유적', icon: '🎭', description: '은유와 비유가 풍부한' },
  { id: 'philosophical', label: '철학적', icon: '🤔', description: '사색을 유도하는' },
  { id: 'descriptive', label: '묘사적', icon: '🎨', description: '장면을 생생하게 그리는' },
  { id: 'conversational', label: '대화형', icon: '💬', description: '대화가 많은' },
];

// 주제 선호
export const THEMES = [
  { id: 'growth', label: '성장', icon: '🌱', description: '인물의 성장과 변화' },
  { id: 'love', label: '사랑', icon: '❤️', description: '사랑과 관계' },
  { id: 'friendship', label: '우정', icon: '🤝', description: '우정과 동료애' },
  { id: 'family', label: '가족', icon: '👨‍👩‍👧‍👦', description: '가족과 가정' },
  { id: 'society', label: '사회', icon: '🏙️', description: '사회 문제와 비판' },
  { id: 'history', label: '역사', icon: '📜', description: '역사적 사건과 인물' },
  { id: 'future', label: '미래', icon: '🚀', description: '미래와 SF' },
  { id: 'fantasy', label: '판타지', icon: '🧙‍♂️', description: '마법과 환상' },
];
