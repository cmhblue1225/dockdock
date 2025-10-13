import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { getPersonalizedRecommendations, getTrendingBooks } from '../lib/recommendationApi';
import BookRegistrationModal from '../components/ui/BookRegistrationModal';
import BookDetailModal from '../components/BookDetailModal';
import { useAuthStore } from '../stores/authStore';

interface Book {
  id?: string;
  title: string;
  author?: string;
  publisher?: string;
  coverImage?: string;
  isbn?: string;
  isbn13?: string;
  pageCount?: number;
}

export default function SearchPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookDetailId, setBookDetailId] = useState<string | null>(null);
  const [isBookDetailOpen, setIsBookDetailOpen] = useState(false);

  // 책 검색 쿼리
  const { data, isLoading, error } = useQuery({
    queryKey: ['books', 'search', activeSearch],
    queryFn: async () => {
      if (!activeSearch) return null;

      const response = await api.get('/api/books', {
        params: { search: activeSearch }
      });

      return response.data;
    },
    enabled: !!activeSearch,
  });

  // 개인화 추천 쿼리
  const { data: recommendedBooks } = useQuery({
    queryKey: ['recommendations', 'personalized'],
    queryFn: () => getPersonalizedRecommendations(10),
    enabled: !!user && !activeSearch,
    staleTime: 1000 * 60 * 30, // 30분 캐싱
  });

  // 트렌딩 책 쿼리
  const { data: trendingBooks } = useQuery({
    queryKey: ['recommendations', 'trending'],
    queryFn: () => getTrendingBooks(10),
    enabled: !activeSearch,
    staleTime: 1000 * 60 * 10, // 10분 캐싱
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActiveSearch(searchTerm.trim());
    }
  };

  const handleBookClick = (book: any) => {
    setSelectedBook({
      id: book.id,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      coverImage: book.coverImage,
      isbn: book.isbn,
      isbn13: book.isbn13,
      pageCount: book.pageCount,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          책 검색
        </h1>

        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="책 제목 또는 ISBN을 입력하세요..."
              className="flex-1 px-6 py-4 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            />
            <button
              type="submit"
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-secondary transition-colors"
            >
              검색
            </button>
          </div>
        </form>

        {/* 검색 결과 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-secondary">검색 중...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            검색 중 오류가 발생했습니다.
          </div>
        )}

        {data && data.success && (
          <div className="space-y-4">
            <p className="text-text-secondary">
              {data.data.books ? `${data.data.books.length}개의 결과를 찾았습니다` : '책 정보를 불러왔습니다'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data.data.books || [data.data]).map((book: any) => (
                <div
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="bg-surface p-6 rounded-xl shadow-custom hover:shadow-custom-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-64 object-contain mb-4 rounded-lg"
                  />
                  <h3 className="font-semibold text-lg text-text-primary mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-2">{book.author}</p>
                  <p className="text-text-secondary text-sm mb-3">{book.publisher}</p>
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <span className="text-ios-green text-sm font-medium">클릭하여 등록</span>
                    <span className="text-ios-green">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeSearch && !isLoading && (
          <div className="space-y-12">
            {/* 개인화 추천 섹션 */}
            {user && recommendedBooks && recommendedBooks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    ✨ 당신을 위한 추천
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {recommendedBooks.map((book: any) => (
                    <div
                      key={book.id}
                      onClick={() => {
                        setBookDetailId(book.aladinId || book.id);
                        setIsBookDetailOpen(true);
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="relative rounded-xl overflow-hidden shadow-custom hover:shadow-custom-lg transition-all group-hover:scale-105">
                        <img
                          src={book.coverImage || '/placeholder-book.png'}
                          alt={book.title}
                          className="w-full aspect-[2/3] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 p-4 text-white">
                            <p className="font-bold text-sm line-clamp-2 mb-1">{book.title}</p>
                            <p className="text-xs opacity-80 line-clamp-1">{book.author}</p>
                            {book.reason && (
                              <p className="text-xs opacity-70 mt-2 line-clamp-2 italic">
                                "{book.reason}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 트렌딩 책 섹션 */}
            {trendingBooks && trendingBooks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    🔥 지금 인기있는 책
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trendingBooks.map((book: any, index: number) => (
                    <div
                      key={book.id}
                      onClick={() => {
                        setBookDetailId(book.aladinId || book.id);
                        setIsBookDetailOpen(true);
                      }}
                      className="flex gap-4 bg-surface p-4 rounded-xl shadow-custom hover:shadow-custom-lg transition-all cursor-pointer group hover:scale-[1.02]"
                    >
                      {/* 순위 표시 */}
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        <span className={`text-4xl font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-600' :
                          'text-text-secondary'
                        }`}>
                          {index + 1}
                        </span>
                      </div>

                      {/* 책 커버 */}
                      <img
                        src={book.coverImage || '/placeholder-book.png'}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-lg shadow-sm"
                      />

                      {/* 책 정보 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-text-primary mb-1 line-clamp-2 group-hover:text-ios-green transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-text-secondary text-sm mb-2">{book.author}</p>
                        {book.description && (
                          <p className="text-text-secondary text-sm line-clamp-2 mb-2">
                            {book.description}
                          </p>
                        )}
                        {book.category && (
                          <span className="inline-block px-2 py-1 bg-ios-green/10 text-ios-green text-xs rounded-full">
                            {book.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 추천이 없을 때 */}
            {(!trendingBooks || trendingBooks.length === 0) && (!recommendedBooks || recommendedBooks.length === 0) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-text-secondary text-lg">
                  책 제목이나 ISBN을 검색해보세요
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 책 등록 모달 */}
      <BookRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        book={selectedBook}
      />

      {/* 책 상세 모달 */}
      {bookDetailId && (
        <BookDetailModal
          bookId={bookDetailId}
          isOpen={isBookDetailOpen}
          onClose={() => {
            setIsBookDetailOpen(false);
            setBookDetailId(null);
          }}
        />
      )}
    </div>
  );
}
