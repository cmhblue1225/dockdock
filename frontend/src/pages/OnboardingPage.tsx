import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOnboardingGenres, getGenreBooks, saveUserPreferences } from '../lib/onboardingApi';
import type { Genre, OnboardingBook } from '../types/onboarding';

type OnboardingStep = 'genre' | 'books' | 'loading';

export default function OnboardingPage() {
  const navigate = useNavigate();

  // 단계 관리
  const [step, setStep] = useState<OnboardingStep>('genre');

  // 장르 선택
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [loadingGenres, setLoadingGenres] = useState(true);

  // 책 선택
  const [genreBooks, setGenreBooks] = useState<Map<string, OnboardingBook[]>>(new Map());
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [currentGenreIndex, setCurrentGenreIndex] = useState(0);

  // 저장
  const [error, setError] = useState('');

  // 장르 목록 로드
  useEffect(() => {
    loadGenres();
  }, []);

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

  // 다음 단계: 책 선택으로 이동
  async function goToBookSelection() {
    if (selectedGenres.size === 0) {
      setError('최소 1개 이상의 장르를 선택해주세요');
      return;
    }

    setError('');
    setLoadingBooks(true);

    // 선택한 장르의 책들 로드
    try {
      const booksMap = new Map<string, OnboardingBook[]>();
      for (const genreId of Array.from(selectedGenres)) {
        console.log(`[Frontend] ${genreId} 장르의 책을 요청합니다...`);
        const books = await getGenreBooks(genreId, 5);
        console.log(`[Frontend] ${genreId} 장르의 책 ${books.length}권을 받았습니다`);
        booksMap.set(genreId, books);
      }
      setGenreBooks(booksMap);
      console.log(`[Frontend] 총 ${booksMap.size}개 장르의 책을 로드했습니다`);

      // API 호출이 성공적으로 완료된 후에 books 페이지로 전환
      setStep('books');
    } catch (err: any) {
      console.error('[Frontend] 책 로딩 실패:', err);
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

  // 선호도 저장 및 완료
  async function completeOnboarding() {
    setError('');
    setStep('loading');

    try {
      await saveUserPreferences({
        preferred_genres: Array.from(selectedGenres),
        selected_book_ids: Array.from(selectedBooks),
      });

      // 온보딩 완료 후 홈으로 이동
      navigate('/');
    } catch (err: any) {
      setError(err.message || '선호도 저장에 실패했습니다');
      setStep('books');
    }
  }

  // 현재 보여줄 장르
  const selectedGenresList = Array.from(selectedGenres);
  const currentGenre = selectedGenresList[currentGenreIndex];
  const currentGenreData = genres.find(g => g.id === currentGenre);
  const currentBooks = currentGenre ? genreBooks.get(currentGenre) || [] : [];

  // 다음 장르로 이동
  function nextGenre() {
    if (currentGenreIndex < selectedGenresList.length - 1) {
      setCurrentGenreIndex(currentGenreIndex + 1);
    } else {
      completeOnboarding();
    }
  }

  // 이전 장르로 이동
  function prevGenre() {
    if (currentGenreIndex > 0) {
      setCurrentGenreIndex(currentGenreIndex - 1);
    } else {
      setStep('genre');
      setCurrentGenreIndex(0);
    }
  }

  // 장르 선택 단계
  if (step === 'genre') {
    return (
      <div className="min-h-screen bg-ios-green flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* 헤더 */}
          <div className="text-center mb-8 text-white">
            <h1 className="text-4xl font-bold mb-4">어떤 책을 좋아하시나요?</h1>
            <p className="text-white/80 text-lg">
              관심있는 장르를 선택해주세요 (최소 1개)
            </p>
          </div>

          {/* 장르 카드 그리드 */}
          {loadingGenres ? (
            <div className="text-center text-white">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              <p className="mt-4">장르를 불러오는 중...</p>
            </div>
          ) : loadingBooks ? (
            <div className="text-center text-white">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              <p className="mt-4">선택하신 장르의 책을 불러오는 중...</p>
            </div>
          ) : (
            <div className="bg-surface rounded-3xl p-8 shadow-custom-xl">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                      selectedGenres.has(genre.id)
                        ? 'border-ios-green bg-ios-green/10'
                        : 'border-text-secondary/20 hover:border-ios-green/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{genre.icon}</div>
                    <h3 className="font-bold text-text-primary mb-1">{genre.name}</h3>
                    <p className="text-xs text-text-secondary">{genre.description}</p>
                  </button>
                ))}
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* 선택 개수 및 다음 버튼 */}
              <div className="flex items-center justify-between">
                <p className="text-text-secondary">
                  {selectedGenres.size}개 선택됨
                </p>
                <button
                  onClick={goToBookSelection}
                  disabled={selectedGenres.size === 0}
                  className="bg-ios-green text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 책 선택 단계
  if (step === 'books') {
    return (
      <div className="min-h-screen bg-ios-green flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {/* 헤더 */}
          <div className="text-center mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {currentGenreData?.name} 장르의 책을 선택해주세요
            </h1>
            <p className="text-white/80">
              관심있는 책을 선택하면 더 정확한 추천을 받을 수 있어요 (선택사항)
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {selectedGenresList.map((genreId, index) => (
                <div
                  key={genreId}
                  className={`w-2 h-2 rounded-full ${
                    index === currentGenreIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 책 카드 그리드 */}
          {loadingBooks ? (
            <div className="text-center text-white">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              <p className="mt-4">책을 불러오는 중...</p>
            </div>
          ) : (
            <div className="bg-surface rounded-3xl p-8 shadow-custom-xl">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {currentBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => toggleBook(book.id)}
                    className={`group relative rounded-xl overflow-hidden transition-all hover:scale-105 ${
                      selectedBooks.has(book.id) ? 'ring-4 ring-ios-green' : ''
                    }`}
                  >
                    <img
                      src={book.coverImage || '/placeholder-book.png'}
                      alt={book.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 p-3 text-white text-left">
                        <p className="font-bold text-sm line-clamp-2">{book.title}</p>
                        <p className="text-xs opacity-80">{book.author}</p>
                      </div>
                    </div>
                    {selectedBooks.has(book.id) && (
                      <div className="absolute top-2 right-2 bg-ios-green text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* 네비게이션 버튼 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevGenre}
                  className="text-text-secondary hover:text-text-primary transition-colors px-6 py-3"
                >
                  ← 이전
                </button>
                <p className="text-text-secondary text-sm">
                  {currentGenreIndex + 1} / {selectedGenresList.length}
                </p>
                <button
                  onClick={nextGenre}
                  className="bg-ios-green text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  {currentGenreIndex < selectedGenresList.length - 1 ? '다음' : '완료'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 로딩 단계
  return (
    <div className="min-h-screen bg-ios-green flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">선호도를 저장하는 중...</h2>
        <p className="text-white/80">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
