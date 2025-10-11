import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: '🏠', label: '홈' },
  { path: '/search', icon: '🔍', label: '검색' },
  { path: '/wishlist', icon: '💫', label: '위시리스트' },
  { path: '/profile', icon: '👤', label: '프로필' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 로그아웃 핸들러
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 현재 읽는 중인 책 조회 (최대 5권)
  const { data: readingBooksData } = useQuery({
    queryKey: ['reading-books', 'reading'],
    queryFn: async () => {
      const response = await api.get('/api/v1/reading-books', {
        params: { status: 'reading', limit: 5 }
      });
      return response.data;
    },
    enabled: !!user,
  });

  const readingBooks = readingBooksData?.data?.items || [];
  const currentBook = readingBooks[currentIndex];
  const progressPercent = currentBook?.progress_percent || 0;

  // 슬라이더 네비게이션 핸들러
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? readingBooks.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === readingBooks.length - 1 ? 0 : prev + 1));
  };

  // 책 목록이 변경되면 인덱스 초기화
  const bookCount = readingBooks.length;
  if (currentIndex >= bookCount && bookCount > 0) {
    setCurrentIndex(0);
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-[260px] h-screen bg-sidebar-bg border-r border-border-gray fixed left-0 top-0 p-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 px-2 mb-8 group">
        <div className="text-4xl transition-transform duration-300 group-hover:rotate-6">
          📚
        </div>
        <span className="text-2xl font-bold text-text-primary">독독</span>
      </Link>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 mb-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-xl
              transition-all duration-300 ease-out
              overflow-hidden group
              ${
                isActive(item.path)
                  ? 'bg-ios-green text-white'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary hover:translate-x-1'
              }
            `}
          >
            {/* Active Indicator */}
            {!isActive(item.path) && (
              <div className="absolute left-0 top-0 bottom-0 w-0 bg-ios-green transition-all duration-300 group-hover:w-1" />
            )}

            <span className="text-xl transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </span>
            <span className="text-[15px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Continue Reading Widget */}
      <div className="bg-gradient-to-br from-surface to-surface-light rounded-2xl p-4 mb-4 transition-all duration-300 hover:shadow-custom">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            계속 읽기
          </div>
          {readingBooks.length > 1 && (
            <div className="text-xs font-medium text-text-secondary">
              {currentIndex + 1} / {readingBooks.length}
            </div>
          )}
        </div>

        {currentBook ? (
          <>
            <Link
              to={`/books/${currentBook.id}`}
              className="block mb-3 cursor-pointer transition-all duration-300 hover:opacity-80"
            >
              <div className="flex gap-3">
                {currentBook.book?.cover_image_url ? (
                  <img
                    src={currentBook.book.cover_image_url}
                    alt={currentBook.book.title}
                    className="w-14 h-20 object-cover rounded-lg shadow-custom"
                  />
                ) : (
                  <div className="w-14 h-20 bg-gradient-to-br from-ios-green to-ios-green-dark rounded-lg flex items-center justify-center text-2xl shadow-custom">
                    📖
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">
                    {currentBook.book?.title || '제목 없음'}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-border-gray rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ios-green rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-ios-green">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {readingBooks.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-border-gray">
                <button
                  onClick={handlePrevious}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface hover:bg-ios-green hover:text-white text-text-secondary transition-all duration-200"
                  aria-label="이전 책"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-1">
                  {readingBooks.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        index === currentIndex
                          ? 'bg-ios-green w-4'
                          : 'bg-border-gray hover:bg-text-secondary'
                      }`}
                      aria-label={`${index + 1}번째 책으로 이동`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface hover:bg-ios-green hover:text-white text-text-secondary transition-all duration-200"
                  aria-label="다음 책"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-text-secondary text-center py-4">
            독서 중인 책이 없습니다
          </div>
        )}
      </div>

      {/* User Profile Widget */}
      <div className="bg-surface-light rounded-xl p-3 transition-all duration-300 hover:bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ios-green text-white flex items-center justify-center text-lg font-semibold">
            {user?.email?.[0]?.toUpperCase() || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {user?.email?.split('@')[0] || '독서러버'}
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-text-secondary hover:text-ios-green transition-colors"
            >
              로그아웃
            </button>
          </div>
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
