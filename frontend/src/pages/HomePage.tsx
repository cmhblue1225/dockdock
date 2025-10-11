import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import BookCard from '../components/ui/BookCard';
import Button from '../components/ui/Button';

interface ReadingBookWithBook {
  id: string;
  user_id: string;
  book_id: string;
  status: 'wishlist' | 'reading' | 'completed';
  current_page: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  book: {
    id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    cover_image_url: string | null;
    page_count: number | null;
  };
}

export default function HomePage() {
  // 읽는 중인 책
  const { data: readingBooks, isLoading: readingLoading } = useQuery({
    queryKey: ['reading-books', 'reading'],
    queryFn: async () => {
      const response = await api.get('/api/v1/reading-books', {
        params: { status: 'reading', limit: 6 },
      });
      return response.data;
    },
  });

  // 최근 완독한 책
  const { data: completedBooks, isLoading: completedLoading } = useQuery({
    queryKey: ['reading-books', 'completed'],
    queryFn: async () => {
      const response = await api.get('/api/v1/reading-books', {
        params: { status: 'completed', limit: 6 },
      });
      return response.data;
    },
  });

  // 위시리스트
  const { data: wishlistBooks, isLoading: wishlistLoading } = useQuery({
    queryKey: ['reading-books', 'wishlist'],
    queryFn: async () => {
      const response = await api.get('/api/v1/reading-books', {
        params: { status: 'wishlist', limit: 6 },
      });
      return response.data;
    },
  });

  const renderBookGrid = (
    data: any,
    isLoading: boolean,
    emptyMessage: string,
    emptyIcon: string
  ) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ios-green"></div>
        </div>
      );
    }

    const books = data?.data?.items || [];

    if (books.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">{emptyIcon}</div>
          <p className="text-text-secondary">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {books.map((item: ReadingBookWithBook) => {
          const progress =
            item.book.page_count && item.current_page > 0
              ? (item.current_page / item.book.page_count) * 100
              : undefined;

          return (
            <Link key={item.id} to={`/books/${item.id}`}>
              <BookCard
                coverImageUrl={item.book.cover_image_url || undefined}
                title={item.book.title}
                progress={progress}
                icon={
                  item.status === 'reading'
                    ? '📖'
                    : item.status === 'completed'
                    ? '✅'
                    : '💫'
                }
              />
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-light to-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            📚 독독 (DockDock)
          </h1>
          <p className="text-text-secondary text-lg">
            당신의 독서 여정을 기록하고 관리하세요
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link to="/search">
              <Button variant="primary" size="lg">
                <span className="mr-2">🔍</span>
                책 검색하기
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="outline" size="lg">
                <span className="mr-2">💫</span>
                위시리스트 보기
              </Button>
            </Link>
          </div>
        </div>

        {/* 읽는 중인 책 */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <span>📖</span>
              <span>읽는 중인 책</span>
            </h2>
            {readingBooks?.data?.items?.length > 0 && (
              <Link to="/reading">
                <Button variant="ghost" size="sm">
                  전체보기 →
                </Button>
              </Link>
            )}
          </div>
          {renderBookGrid(
            readingBooks,
            readingLoading,
            '현재 읽고 있는 책이 없습니다. 새로운 책을 시작해보세요!',
            '📚'
          )}
        </section>

        {/* 최근 완독한 책 */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <span>✅</span>
              <span>최근 완독한 책</span>
            </h2>
            {completedBooks?.data?.items?.length > 0 && (
              <Link to="/completed">
                <Button variant="ghost" size="sm">
                  전체보기 →
                </Button>
              </Link>
            )}
          </div>
          {renderBookGrid(
            completedBooks,
            completedLoading,
            '아직 완독한 책이 없습니다. 책 읽기를 시작해보세요!',
            '🎯'
          )}
        </section>

        {/* 위시리스트 */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <span>💫</span>
              <span>위시리스트</span>
            </h2>
            {wishlistBooks?.data?.items?.length > 0 && (
              <Link to="/wishlist">
                <Button variant="ghost" size="sm">
                  전체보기 →
                </Button>
              </Link>
            )}
          </div>
          {renderBookGrid(
            wishlistBooks,
            wishlistLoading,
            '위시리스트에 담긴 책이 없습니다. 읽고 싶은 책을 추가해보세요!',
            '⭐'
          )}
        </section>

        {/* 통계 요약 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-ios-green to-ios-green-dark text-white rounded-2xl p-6 shadow-custom">
            <div className="text-3xl mb-2">📖</div>
            <div className="text-3xl font-bold mb-1">
              {readingBooks?.data?.pagination?.total || 0}
            </div>
            <div className="text-white/80">읽는 중</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-custom">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold mb-1">
              {completedBooks?.data?.pagination?.total || 0}
            </div>
            <div className="text-white/80">완독</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-custom">
            <div className="text-3xl mb-2">💫</div>
            <div className="text-3xl font-bold mb-1">
              {wishlistBooks?.data?.pagination?.total || 0}
            </div>
            <div className="text-white/80">위시리스트</div>
          </div>
        </section>
      </div>
    </div>
  );
}
