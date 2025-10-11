import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import BookCard from '../components/ui/BookCard';

interface ReadingBookWithBook {
  id: string;
  user_id: string;
  book_id: string;
  status: 'reading';
  current_page: number;
  total_pages: number | null;
  progress_percent: number | null;
  started_at: string | null;
  book: {
    id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    cover_image_url: string | null;
    page_count: number | null;
  };
}

export default function ReadingBooksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reading-books', 'reading', 'all'],
    queryFn: async () => {
      const response = await api.get('/api/v1/reading-books', {
        params: { status: 'reading', limit: 100 },
      });
      return response.data;
    },
  });

  const books: ReadingBookWithBook[] = data?.data?.items || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-light to-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <span>📖</span>
            <span>읽는 중인 책</span>
          </h1>
          <p className="text-text-secondary">
            현재 읽고 있는 모든 책을 관리하세요
          </p>
        </div>

        {/* 로딩 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ios-green"></div>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && books.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              읽는 중인 책이 없습니다
            </h3>
            <p className="text-text-secondary mb-6">
              새로운 책을 찾아 읽기를 시작해보세요!
            </p>
            <Link
              to="/search"
              className="inline-block bg-ios-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-ios-green-dark transition-colors"
            >
              책 검색하기
            </Link>
          </div>
        )}

        {/* 책 그리드 */}
        {!isLoading && books.length > 0 && (
          <>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <p className="text-text-secondary">
                총 <span className="font-bold text-ios-green">{books.length}권</span>의 책을 읽고 있습니다
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {books.map((item) => (
                <Link key={item.id} to={`/books/${item.id}`}>
                  <BookCard
                    coverImageUrl={item.book.cover_image_url || undefined}
                    title={item.book.title}
                    progress={item.progress_percent || undefined}
                    icon="📖"
                  />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
