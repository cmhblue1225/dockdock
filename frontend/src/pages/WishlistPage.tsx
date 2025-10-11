import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import BookCard from '../components/ui/BookCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';

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

export default function WishlistPage() {
  const [selectedBook, setSelectedBook] = useState<ReadingBookWithBook | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // 위시리스트 조회
  const { data, isLoading } = useQuery({
    queryKey: ['reading-books', 'wishlist'],
    queryFn: async () => {
      const response = await api.get('/api/v1/reading-books', {
        params: { status: 'wishlist', limit: 100 },
      });
      return response.data;
    },
  });

  // 상태 변경 (위시리스트 → 읽기 시작)
  const startReadingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/api/v1/reading-books/${id}`, {
        status: 'reading',
        current_page: 0,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-books'] });
      showToast('읽기를 시작했습니다!', 'success');
      setIsActionModalOpen(false);
      setSelectedBook(null);
    },
    onError: () => {
      showToast('상태 변경에 실패했습니다', 'error');
    },
  });

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/v1/reading-books/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-books'] });
      showToast('위시리스트에서 삭제되었습니다', 'success');
      setIsActionModalOpen(false);
      setSelectedBook(null);
    },
    onError: () => {
      showToast('삭제에 실패했습니다', 'error');
    },
  });

  const handleBookClick = (book: ReadingBookWithBook) => {
    setSelectedBook(book);
    setIsActionModalOpen(true);
  };

  const handleStartReading = () => {
    if (selectedBook) {
      startReadingMutation.mutate(selectedBook.id);
    }
  };

  const handleDelete = () => {
    if (selectedBook) {
      deleteMutation.mutate(selectedBook.id);
    }
  };

  const books = data?.data?.items || [];
  const isProcessing = startReadingMutation.isPending || deleteMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-light to-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">💫</span>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">위시리스트</h1>
          </div>
          <p className="text-text-secondary">읽고 싶은 책들을 모아보세요</p>
        </div>

        {/* 로딩 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ios-green"></div>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && books.length === 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 text-center shadow-custom">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              위시리스트가 비어있습니다
            </h3>
            <p className="text-text-secondary mb-6">읽고 싶은 책을 추가해보세요!</p>
            <Link to="/search">
              <Button variant="primary" size="lg">
                <span className="mr-2">🔍</span>
                책 검색하기
              </Button>
            </Link>
          </div>
        )}

        {/* 책 그리드 */}
        {!isLoading && books.length > 0 && (
          <>
            <div className="mb-4 text-text-secondary">
              총 {data?.data?.pagination?.total || 0}권
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {books.map((item: ReadingBookWithBook) => (
                <div
                  key={item.id}
                  onClick={() => handleBookClick(item)}
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <BookCard
                    coverImageUrl={item.book.cover_image_url || undefined}
                    title={item.book.title}
                    icon="💫"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 액션 모달 */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setIsActionModalOpen(false);
            setSelectedBook(null);
          }
        }}
        title="책 관리"
        size="md"
      >
        {selectedBook && (
          <div className="space-y-6">
            {/* 책 정보 */}
            <div className="flex gap-4">
              <img
                src={selectedBook.book.cover_image_url || '/placeholder-book.png'}
                alt={selectedBook.book.title}
                className="w-24 h-32 object-cover rounded-lg shadow-sm"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-text-primary mb-1">
                  {selectedBook.book.title}
                </h3>
                {selectedBook.book.author && (
                  <p className="text-text-secondary text-sm mb-1">{selectedBook.book.author}</p>
                )}
                {selectedBook.book.publisher && (
                  <p className="text-text-secondary text-sm">{selectedBook.book.publisher}</p>
                )}
                {selectedBook.book.page_count && (
                  <p className="text-text-secondary text-sm mt-2">
                    총 {selectedBook.book.page_count}페이지
                  </p>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleStartReading}
                variant="primary"
                className="w-full"
                isLoading={startReadingMutation.isPending}
                disabled={isProcessing}
              >
                <span className="mr-2">📖</span>
                읽기 시작하기
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
                isLoading={deleteMutation.isPending}
                disabled={isProcessing}
              >
                <span className="mr-2">🗑️</span>
                위시리스트에서 삭제
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
