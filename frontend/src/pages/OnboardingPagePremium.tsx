import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getOnboardingGenres, getGenreBooks, saveUserPreferences } from '../lib/onboardingApi';
import api from '../lib/api';
import type { Genre, OnboardingBook, ReadingPreferences } from '../types/onboarding';
import {
  pageVariants,
  containerVariants,
  cardVariants,
  itemVariants,
  buttonVariants,
  checkmarkVariants,
} from '../lib/animations';
import {
  READING_PURPOSES,
  BOOK_LENGTHS,
  READING_PACES,
  DIFFICULTIES,
  MOODS,
  EMOTIONS,
  NARRATIVE_STYLES,
  THEMES,
} from '../constants/onboarding';

type OnboardingStep = 'welcome' | 'genre' | 'books' | 'purpose' | 'style' | 'mood' | 'theme' | 'analyzing' | 'loading';

export default function OnboardingPagePremium() {
  const navigate = useNavigate();

  // 단계 관리
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [currentStepNumber, setCurrentStepNumber] = useState(0);

  // 장르 선택
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [loadingGenres, setLoadingGenres] = useState(false);

  // 책 선택
  const [genreBooks, setGenreBooks] = useState<Map<string, OnboardingBook[]>>(new Map());
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [currentGenreIndex, setCurrentGenreIndex] = useState(0);

  // 확장된 선호도
  const [readingPurposes, setReadingPurposes] = useState<Set<string>>(new Set());
  const [preferredLength, setPreferredLength] = useState<string>('');
  const [readingPace, setReadingPace] = useState<string>('');
  const [preferredDifficulty, setPreferredDifficulty] = useState<string>('');
  const [preferredMoods, setPreferredMoods] = useState<Set<string>>(new Set());
  const [preferredEmotions, setPreferredEmotions] = useState<Set<string>>(new Set());
  const [narrativeStyles, setNarrativeStyles] = useState<Set<string>>(new Set());
  const [preferredThemes, setPreferredThemes] = useState<Set<string>>(new Set());

  // 저장
  const [error, setError] = useState('');

  // 진행률 계산 (0-100%)
  const totalSteps = 7;
  const progress = (currentStepNumber / totalSteps) * 100;

  // 장르 목록 로드
  useEffect(() => {
    if (step === 'genre') {
      loadGenres();
    }
  }, [step]);

  async function loadGenres() {
    try {
      setLoadingGenres(true);
      const data = await getOnboardingGenres();
      setGenres(data);
    } catch (err: any) {
      setError(err.message || '장르 목록을 불러오는데 실패했습니다');
    } finally {
      setLoadingGenres(false);
    }
  }

  // Welcome → Genre
  function startOnboarding() {
    setStep('genre');
    setCurrentStepNumber(1);
  }

  // 장르 선택/해제
  function toggleGenre(genreId: string) {
    const newSelected = new Set(selectedGenres);
    if (newSelected.has(genreId)) {
      newSelected.delete(genreId);
    } else {
      newSelected.add(genreId);
    }
    setSelectedGenres(newSelected);
  }

  // Genre → Books
  async function goToBookSelection() {
    if (selectedGenres.size === 0) {
      setError('최소 1개 이상의 장르를 선택해주세요');
      return;
    }

    setError('');
    setLoadingBooks(true);

    try {
      const booksMap = new Map<string, OnboardingBook[]>();
      for (const genreId of Array.from(selectedGenres)) {
        const books = await getGenreBooks(genreId, 5);
        booksMap.set(genreId, books);
      }
      setGenreBooks(booksMap);
      setStep('books');
      setCurrentStepNumber(2);
    } catch (err: any) {
      setError(err.message || '책 목록을 불러오는데 실패했습니다');
    } finally {
      setLoadingBooks(false);
    }
  }

  // 책 선택/해제
  function toggleBook(bookId: string) {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  }

  // Books → Purpose
  function goToPurpose() {
    setStep('purpose');
    setCurrentStepNumber(3);
  }

  // 독서 목적 토글
  function togglePurpose(purposeId: string) {
    const newSelected = new Set(readingPurposes);
    if (newSelected.has(purposeId)) {
      newSelected.delete(purposeId);
    } else {
      if (newSelected.size < 3) {
        newSelected.add(purposeId);
      }
    }
    setReadingPurposes(newSelected);
  }

  // Purpose → Style
  function goToStyle() {
    setStep('style');
    setCurrentStepNumber(4);
  }

  // Style → Mood
  function goToMood() {
    setStep('mood');
    setCurrentStepNumber(5);
  }

  // 분위기 토글
  function toggleMood(moodId: string) {
    const newSelected = new Set(preferredMoods);
    if (newSelected.has(moodId)) {
      newSelected.delete(moodId);
    } else {
      newSelected.add(moodId);
    }
    setPreferredMoods(newSelected);
  }

  // 감정 토글
  function toggleEmotion(emotionId: string) {
    const newSelected = new Set(preferredEmotions);
    if (newSelected.has(emotionId)) {
      newSelected.delete(emotionId);
    } else {
      newSelected.add(emotionId);
    }
    setPreferredEmotions(newSelected);
  }

  // Mood → Theme
  function goToTheme() {
    setStep('theme');
    setCurrentStepNumber(6);
  }

  // 서술 스타일 토글
  function toggleNarrativeStyle(styleId: string) {
    const newSelected = new Set(narrativeStyles);
    if (newSelected.has(styleId)) {
      newSelected.delete(styleId);
    } else {
      newSelected.add(styleId);
    }
    setNarrativeStyles(newSelected);
  }

  // 주제 토글
  function toggleTheme(themeId: string) {
    const newSelected = new Set(preferredThemes);
    if (newSelected.has(themeId)) {
      newSelected.delete(themeId);
    } else {
      newSelected.add(themeId);
    }
    setPreferredThemes(newSelected);
  }

  // Theme → Analyzing
  function goToAnalyzing() {
    setStep('analyzing');
    setCurrentStepNumber(7);
    // 2초 후 실제 저장
    setTimeout(() => {
      completeOnboarding();
    }, 2000);
  }

  // 선호도 저장 및 완료
  async function completeOnboarding() {
    setError('');
    setStep('loading');

    try {
      const preferences: ReadingPreferences = {
        preferred_genres: Array.from(selectedGenres),
        selected_book_ids: Array.from(selectedBooks),
        reading_purposes: Array.from(readingPurposes),
        preferred_length: (preferredLength || undefined) as 'short' | 'medium' | 'long' | 'any' | undefined,
        reading_pace: (readingPace || undefined) as 'fast' | 'medium' | 'slow' | undefined,
        preferred_difficulty: (preferredDifficulty || undefined) as 'easy' | 'moderate' | 'challenging' | 'any' | undefined,
        preferred_moods: Array.from(preferredMoods),
        preferred_emotions: Array.from(preferredEmotions),
        narrative_styles: Array.from(narrativeStyles),
        preferred_themes: Array.from(preferredThemes),
      };

      // 1. 선호도 저장
      await saveUserPreferences(preferences);

      // 2. 레포트 생성 (백엔드 API 호출)
      try {
        const reportData = {
          purposes: Array.from(readingPurposes),
          favorite_genres: Array.from(selectedGenres),
          selected_book_ids: Array.from(selectedBooks),
          preferred_length: preferredLength || undefined,
          reading_pace: readingPace || undefined,
          preferred_difficulty: preferredDifficulty || undefined,
          preferred_moods: Array.from(preferredMoods),
          preferred_emotions: Array.from(preferredEmotions),
          preferred_narrative_styles: Array.from(narrativeStyles),
          preferred_themes: Array.from(preferredThemes),
        };

        await api.post('/api/v1/onboarding/report/generate', {
          onboardingData: reportData,
        });

        // 레포트 페이지로 이동
        navigate('/onboarding/report');
      } catch (reportErr) {
        console.error('레포트 생성 실패:', reportErr);
        // 레포트 생성 실패해도 홈으로 이동 (선호도는 저장됨)
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || '선호도 저장에 실패했습니다');
      setStep('theme');
    }
  }

  // 이전 단계로
  function goPrevious() {
    if (step === 'genre') {
      setStep('welcome');
      setCurrentStepNumber(0);
    } else if (step === 'books') {
      setStep('genre');
      setCurrentStepNumber(1);
    } else if (step === 'purpose') {
      setStep('books');
      setCurrentStepNumber(2);
    } else if (step === 'style') {
      setStep('purpose');
      setCurrentStepNumber(3);
    } else if (step === 'mood') {
      setStep('style');
      setCurrentStepNumber(4);
    } else if (step === 'theme') {
      setStep('mood');
      setCurrentStepNumber(5);
    }
  }

  // 책 선택 페이지 네비게이션
  const selectedGenresList = Array.from(selectedGenres);
  const currentGenre = selectedGenresList[currentGenreIndex];
  const currentGenreData = genres.find(g => g.id === currentGenre);
  const currentBooks = currentGenre ? genreBooks.get(currentGenre) || [] : [];

  function nextGenreOrComplete() {
    if (currentGenreIndex < selectedGenresList.length - 1) {
      setCurrentGenreIndex(currentGenreIndex + 1);
    } else {
      goToPurpose();
    }
  }

  function prevGenreOrBack() {
    if (currentGenreIndex > 0) {
      setCurrentGenreIndex(currentGenreIndex - 1);
    } else {
      goPrevious();
    }
  }

  // ============================================
  // Step 0: Welcome
  // ============================================
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-premium flex items-center justify-center p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-white max-w-2xl"
        >
          {/* 로고 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 100 }}
            className="text-8xl mb-8"
          >
            📚
          </motion.div>

          {/* 제목 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl font-bold mb-4"
          >
            당신만을 위한<br />책 추천을 시작합니다
          </motion.h1>

          {/* 부제목 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl text-white/80 mb-12"
          >
            7가지 질문으로 당신의 취향을 완벽하게 파악합니다
          </motion.p>

          {/* 시작 버튼 */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startOnboarding}
            className="bg-white text-premium-blue px-12 py-4 rounded-full text-lg font-bold shadow-premium-xl hover:shadow-glow transition-all animate-pulse-glow"
          >
            시작하기 ✨
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // 진행률 바 (공통)
  // ============================================
  const ProgressBar = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">
            {currentStepNumber} / {totalSteps}
          </span>
          <span className="text-white text-sm font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );

  // ============================================
  // Step 1: 장르 선택
  // ============================================
  if (step === 'genre') {
    return (
      <div className="min-h-screen bg-gradient-premium">
        <ProgressBar />

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center justify-center min-h-screen p-4 pt-24"
        >
          <div className="w-full max-w-5xl">
            {/* 헤더 */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-12 text-white"
            >
              <h1 className="text-5xl font-bold mb-4">어떤 책을 좋아하시나요?</h1>
              <p className="text-xl text-white/80">
                관심있는 장르를 선택해주세요 (최소 1개)
              </p>
            </motion.div>

            {/* 장르 카드 그리드 */}
            {loadingGenres ? (
              <div className="text-center text-white">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
                <p className="text-lg">장르를 불러오는 중...</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
                >
                  {genres.map((genre) => (
                    <motion.button
                      key={genre.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => toggleGenre(genre.id)}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        selectedGenres.has(genre.id)
                          ? 'border-white bg-white/20 shadow-glow'
                          : 'border-white/30 bg-white/5 hover:border-white/50'
                      }`}
                    >
                      <div className="text-5xl mb-3">{genre.icon}</div>
                      <h3 className="font-bold text-white text-lg mb-1">{genre.name}</h3>
                      <p className="text-sm text-white/70">{genre.description}</p>

                      {/* 체크마크 */}
                      <AnimatePresence>
                        {selectedGenres.has(genre.id) && (
                          <motion.div
                            variants={checkmarkVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-3 right-3 bg-white text-premium-blue rounded-full p-2"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </motion.div>

                {/* 에러 메시지 */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-white rounded-lg text-sm backdrop-blur-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 네비게이션 */}
                <div className="flex items-center justify-between">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goPrevious}
                    className="text-white/70 hover:text-white px-6 py-3 transition-colors"
                  >
                    ← 이전
                  </motion.button>

                  <p className="text-white text-lg">
                    {selectedGenres.size}개 선택됨
                  </p>

                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goToBookSelection}
                    disabled={selectedGenres.size === 0 || loadingBooks}
                    className="bg-white text-premium-blue px-8 py-3 rounded-xl font-bold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingBooks ? '로딩 중...' : '다음 →'}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // Step 2: 책 선택
  // ============================================
  if (step === 'books') {
    return (
      <div className="min-h-screen bg-gradient-premium">
        <ProgressBar />

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center justify-center min-h-screen p-4 pt-24"
        >
          <div className="w-full max-w-6xl">
            {/* 헤더 */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-8 text-white"
            >
              <h1 className="text-4xl font-bold mb-3">
                {currentGenreData?.name} 장르의 책을 선택해주세요
              </h1>
              <p className="text-lg text-white/80 mb-6">
                관심있는 책을 선택하면 더 정확한 추천을 받을 수 있어요 (선택사항)
              </p>

              {/* 장르 진행 점 */}
              <div className="flex justify-center gap-2 mb-4">
                {selectedGenresList.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-3 h-3 rounded-full ${
                      index === currentGenreIndex ? 'bg-white w-8' : 'bg-white/30'
                    } transition-all`}
                  />
                ))}
              </div>
            </motion.div>

            {/* 책 카드 그리드 */}
            {loadingBooks ? (
              <div className="text-center text-white">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
                <p className="text-lg">책을 불러오는 중...</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8"
                >
                  {currentBooks.map((book) => (
                    <motion.button
                      key={book.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => toggleBook(book.id)}
                      className={`group relative rounded-2xl overflow-hidden transition-all ${
                        selectedBooks.has(book.id) ? 'ring-4 ring-white shadow-glow' : ''
                      }`}
                    >
                      <img
                        src={book.coverImage || '/placeholder-book.png'}
                        alt={book.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 p-4 text-white text-left">
                          <p className="font-bold text-sm line-clamp-2 mb-1">{book.title}</p>
                          <p className="text-xs opacity-80">{book.author}</p>
                        </div>
                      </div>

                      {/* 체크마크 */}
                      <AnimatePresence>
                        {selectedBooks.has(book.id) && (
                          <motion.div
                            variants={checkmarkVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-3 right-3 bg-white text-premium-blue rounded-full p-2 shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </motion.div>

                {/* 네비게이션 */}
                <div className="flex items-center justify-between">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={prevGenreOrBack}
                    className="text-white/70 hover:text-white px-6 py-3 transition-colors"
                  >
                    ← 이전
                  </motion.button>

                  <p className="text-white text-sm">
                    {currentGenreIndex + 1} / {selectedGenresList.length}
                  </p>

                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={nextGenreOrComplete}
                    className="bg-white text-premium-blue px-8 py-3 rounded-xl font-bold hover:shadow-glow transition-all"
                  >
                    {currentGenreIndex < selectedGenresList.length - 1 ? '다음 →' : '완료 ✓'}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // Step 3: 독서 목적
  // ============================================
  if (step === 'purpose') {
    return (
      <div className="min-h-screen bg-gradient-premium">
        <ProgressBar />

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center justify-center min-h-screen p-4 pt-24"
        >
          <div className="w-full max-w-4xl">
            {/* 헤더 */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-12 text-white"
            >
              <h1 className="text-5xl font-bold mb-4">왜 책을 읽으시나요?</h1>
              <p className="text-xl text-white/80">
                최대 3개까지 선택할 수 있어요
              </p>
            </motion.div>

            {/* 목적 카드 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20 mb-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              >
                {READING_PURPOSES.map((purpose) => (
                  <motion.button
                    key={purpose.id}
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => togglePurpose(purpose.id)}
                    disabled={!readingPurposes.has(purpose.id) && readingPurposes.size >= 3}
                    className={`relative p-8 rounded-2xl border-2 transition-all text-left ${
                      readingPurposes.has(purpose.id)
                        ? 'border-white bg-white/20 shadow-glow'
                        : 'border-white/30 bg-white/5 hover:border-white/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{purpose.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-2xl mb-2">{purpose.label}</h3>
                        <p className="text-white/70">{purpose.description}</p>
                      </div>
                    </div>

                    {/* 체크마크 */}
                    <AnimatePresence>
                      {readingPurposes.has(purpose.id) && (
                        <motion.div
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute top-4 right-4 bg-white text-premium-blue rounded-full p-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </motion.div>

              {/* 네비게이션 */}
              <div className="flex items-center justify-between">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={goPrevious}
                  className="text-white/70 hover:text-white px-6 py-3 transition-colors"
                >
                  ← 이전
                </motion.button>

                <p className="text-white text-lg">
                  {readingPurposes.size} / 3 선택됨
                </p>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={goToStyle}
                  className="bg-white text-premium-blue px-8 py-3 rounded-xl font-bold hover:shadow-glow transition-all"
                >
                  다음 →
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // Step 4: 스타일 선호도
  // ============================================
  if (step === 'style') {
    return (
      <div className="min-h-screen bg-gradient-premium">
        <ProgressBar />

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center justify-center min-h-screen p-4 pt-24"
        >
          <div className="w-full max-w-4xl">
            {/* 헤더 */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-12 text-white"
            >
              <h1 className="text-5xl font-bold mb-4">어떤 스타일의 책을 좋아하시나요?</h1>
              <p className="text-xl text-white/80">
                독서 스타일에 대해 알려주세요
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* 책 길이 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <h3 className="text-white text-2xl font-bold mb-6">📖 선호하는 책 길이</h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {BOOK_LENGTHS.map((length) => (
                    <motion.button
                      key={length.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setPreferredLength(length.id)}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        preferredLength === length.id
                          ? 'border-white bg-white/20 shadow-glow'
                          : 'border-white/30 bg-white/5 hover:border-white/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{length.icon}</div>
                      <h4 className="font-bold text-white mb-1">{length.label}</h4>
                      <p className="text-xs text-white/70">{length.description}</p>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* 독서 속도 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <h3 className="text-white text-2xl font-bold mb-6">⚡ 독서 속도</h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-3 gap-4"
                >
                  {READING_PACES.map((pace) => (
                    <motion.button
                      key={pace.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setReadingPace(pace.id)}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        readingPace === pace.id
                          ? 'border-white bg-white/20 shadow-glow'
                          : 'border-white/30 bg-white/5 hover:border-white/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{pace.icon}</div>
                      <h4 className="font-bold text-white mb-1">{pace.label}</h4>
                      <p className="text-xs text-white/70">{pace.description}</p>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* 난이도 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <h3 className="text-white text-2xl font-bold mb-6">🧠 선호하는 난이도</h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {DIFFICULTIES.map((difficulty) => (
                    <motion.button
                      key={difficulty.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setPreferredDifficulty(difficulty.id)}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        preferredDifficulty === difficulty.id
                          ? 'border-white bg-white/20 shadow-glow'
                          : 'border-white/30 bg-white/5 hover:border-white/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{difficulty.icon}</div>
                      <h4 className="font-bold text-white mb-1">{difficulty.label}</h4>
                      <p className="text-xs text-white/70">{difficulty.description}</p>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* 네비게이션 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-glass-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goPrevious}
                    className="text-white/70 hover:text-white px-6 py-3 transition-colors"
                  >
                    ← 이전
                  </motion.button>

                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goToMood}
                    className="bg-white text-premium-blue px-8 py-3 rounded-xl font-bold hover:shadow-glow transition-all"
                  >
                    다음 →
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // Step 5: 분위기 & 감정
  // ============================================
  if (step === 'mood') {
    return (
      <div className="min-h-screen bg-gradient-premium">
        <ProgressBar />

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center justify-center min-h-screen p-4 pt-24"
        >
          <div className="w-full max-w-5xl">
            {/* 헤더 */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-12 text-white"
            >
              <h1 className="text-5xl font-bold mb-4">어떤 느낌의 책을 선호하시나요?</h1>
              <p className="text-xl text-white/80">
                원하는 분위기와 감정을 모두 선택해주세요
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* 분위기 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <h3 className="text-white text-2xl font-bold mb-6">🌟 선호하는 분위기</h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                  {MOODS.map((mood) => (
                    <motion.button
                      key={mood.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => toggleMood(mood.id)}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        preferredMoods.has(mood.id)
                          ? 'border-white bg-white/20 shadow-glow'
                          : 'border-white/30 bg-white/5 hover:border-white/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{mood.icon}</div>
                      <h4 className="font-bold text-white mb-1">{mood.label}</h4>
                      <p className="text-xs text-white/70">{mood.description}</p>

                      <AnimatePresence>
                        {preferredMoods.has(mood.id) && (
                          <motion.div
                            variants={checkmarkVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-2 right-2 bg-white text-premium-blue rounded-full p-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* 감정 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <h3 className="text-white text-2xl font-bold mb-6">💫 선호하는 감정</h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {EMOTIONS.map((emotion) => (
                    <motion.button
                      key={emotion.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => toggleEmotion(emotion.id)}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        preferredEmotions.has(emotion.id)
                          ? 'border-white bg-white/20 shadow-glow'
                          : 'border-white/30 bg-white/5 hover:border-white/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{emotion.icon}</div>
                      <h4 className="font-bold text-white mb-1">{emotion.label}</h4>
                      <p className="text-xs text-white/70">{emotion.description}</p>

                      <AnimatePresence>
                        {preferredEmotions.has(emotion.id) && (
                          <motion.div
                            variants={checkmarkVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-2 right-2 bg-white text-premium-blue rounded-full p-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* 네비게이션 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-glass-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goPrevious}
                    className="text-white/70 hover:text-white px-6 py-3 transition-colors"
                  >
                    ← 이전
                  </motion.button>

                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goToTheme}
                    className="bg-white text-premium-blue px-8 py-3 rounded-xl font-bold hover:shadow-glow transition-all"
                  >
                    다음 →
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // Step 6: 주제 & 서술 스타일
  // ============================================
  if (step === 'theme') {
    return (
      <div className="min-h-screen bg-gradient-premium">
        <ProgressBar />

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center justify-center min-h-screen p-4 pt-24"
        >
          <div className="w-full max-w-5xl">
            {/* 헤더 */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-12 text-white"
            >
              <h1 className="text-5xl font-bold mb-4">마지막 질문이에요!</h1>
              <p className="text-xl text-white/80">
                선호하는 주제와 서술 스타일을 알려주세요
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* 주제 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <h3 className="text-white text-2xl font-bold mb-6">📚 선호하는 주제</h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {THEMES.map((theme) => (
                    <motion.button
                      key={theme.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => toggleTheme(theme.id)}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        preferredThemes.has(theme.id)
                          ? 'border-white bg-white/20 shadow-glow'
                          : 'border-white/30 bg-white/5 hover:border-white/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{theme.icon}</div>
                      <h4 className="font-bold text-white mb-1">{theme.label}</h4>
                      <p className="text-xs text-white/70">{theme.description}</p>

                      <AnimatePresence>
                        {preferredThemes.has(theme.id) && (
                          <motion.div
                            variants={checkmarkVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-2 right-2 bg-white text-premium-blue rounded-full p-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* 서술 스타일 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-glass-lg border border-white/20">
                <h3 className="text-white text-2xl font-bold mb-6">✍️ 선호하는 서술 스타일</h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                  {NARRATIVE_STYLES.map((style) => (
                    <motion.button
                      key={style.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => toggleNarrativeStyle(style.id)}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        narrativeStyles.has(style.id)
                          ? 'border-white bg-white/20 shadow-glow'
                          : 'border-white/30 bg-white/5 hover:border-white/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{style.icon}</div>
                      <h4 className="font-bold text-white mb-1">{style.label}</h4>
                      <p className="text-xs text-white/70">{style.description}</p>

                      <AnimatePresence>
                        {narrativeStyles.has(style.id) && (
                          <motion.div
                            variants={checkmarkVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-2 right-2 bg-white text-premium-blue rounded-full p-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* 네비게이션 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-glass-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goPrevious}
                    className="text-white/70 hover:text-white px-6 py-3 transition-colors"
                  >
                    ← 이전
                  </motion.button>

                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goToAnalyzing}
                    className="bg-white text-premium-blue px-12 py-4 rounded-xl text-lg font-bold hover:shadow-glow transition-all animate-pulse-glow"
                  >
                    완료 ✨
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // Step 7: 분석 중
  // ============================================
  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-premium flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white max-w-2xl"
        >
          {/* 애니메이션 아이콘 */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="text-8xl mb-8"
          >
            📚
          </motion.div>

          {/* 타이틀 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4"
          >
            취향을 분석하고 있습니다...
          </motion.h1>

          {/* 진행 단계 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {[
              { text: '장르 분석 완료', delay: 0 },
              { text: '독서 목적 파악 완료', delay: 0.5 },
              { text: '스타일 프로파일 생성 완료', delay: 1 },
              { text: 'AI가 책을 추천하는 중...', delay: 1.5 },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.delay }}
                className="flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white/90">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // Loading (최종 저장 중)
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-premium flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent mb-6"></div>
        <h2 className="text-3xl font-bold mb-2">선호도를 저장하는 중...</h2>
        <p className="text-white/80 text-lg">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
