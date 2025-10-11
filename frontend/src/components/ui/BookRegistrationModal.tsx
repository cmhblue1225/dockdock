import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import Button from './Button';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';

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

interface BookRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

type ReadingStatus = 'wishlist' | 'reading';

export default function BookRegistrationModal({ isOpen, onClose, book }: BookRegistrationModalProps) {
  const [status, setStatus] = useState<ReadingStatus>('wishlist');
  const [currentPage, setCurrentPage] = useState(0);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // 책을 books 테이블에 먼저 등록 (없으면)
  const createBookMutation = useMutation({
    mutationFn: async (bookData: Book) => {
      const response = await api.post('/api/books', {
        title: bookData.title,
        author: bookData.author,
        publisher: bookData.publisher,
        cover_image_url: bookData.coverImage,
        isbn: bookData.isbn,
        isbn13: bookData.isbn13,
        page_count: bookData.pageCount,
        aladin_id: bookData.id, // 알라딘 itemId
      });
      return response.data;
    },
  });

  // reading_books 테이블에 등록
  const registerReadingBookMutation = useMutation({
    mutationFn: async (data: { book_id: string; status: ReadingStatus; current_page?: number; total_pages?: number | null }) => {
      const response = await api.post('/api/v1/reading-books', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-books'] });
      showToast('책이 성공적으로 등록되었습니다!', 'success');
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '책 등록에 실패했습니다';
      showToast(message, 'error');
    },
  });

  const handleRegister = async () => {
    if (!book) return;

    try {
      // 1. 먼저 books 테이블에 책 등록 (중복이면 기존 UUID 반환)
      // book.id는 알라딘 itemId이므로 항상 POST /api/books를 호출해야 함
      const bookResult = await createBookMutation.mutateAsync(book);
      const bookId = bookResult.data.id;

      // 2. reading_books 테이블에 등록
      await registerReadingBookMutation.mutateAsync({
        book_id: bookId,
        status,
        total_pages: book.pageCount || null,
        ...(status === 'reading' && currentPage > 0 && { current_page: currentPage }),
      });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleClose = () => {
    setStatus('wishlist');
    setCurrentPage(0);
    onClose();
  };

  if (!book) return null;

  const isLoading = createBookMutation.isPending || registerReadingBookMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="책 등록" size="md">
      <div className="space-y-6">
        {/* 책 정보 */}
        <div className="flex gap-4">
          <img
            src={book.coverImage || '/placeholder-book.png'}
            alt={book.title}
            className="w-24 h-32 object-cover rounded-lg shadow-sm"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-text-primary mb-1">{book.title}</h3>
            {book.author && <p className="text-text-secondary text-sm mb-1">{book.author}</p>}
            {book.publisher && <p className="text-text-secondary text-sm">{book.publisher}</p>}
            {book.pageCount && (
              <p className="text-text-secondary text-sm mt-2">총 {book.pageCount}페이지</p>
            )}
          </div>
        </div>

        {/* 상태 선택 */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            어떻게 등록하시겠어요?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('wishlist')}
              className={`p-4 rounded-xl border-2 transition-all ${
                status === 'wishlist'
                  ? 'border-ios-green bg-ios-green/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">💫</div>
              <div className="font-medium text-text-primary">위시리스트</div>
              <div className="text-xs text-text-secondary mt-1">나중에 읽을 책</div>
            </button>
            <button
              type="button"
              onClick={() => setStatus('reading')}
              className={`p-4 rounded-xl border-2 transition-all ${
                status === 'reading'
                  ? 'border-ios-green bg-ios-green/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="font-medium text-text-primary">읽기 시작</div>
              <div className="text-xs text-text-secondary mt-1">지금 읽는 중</div>
            </button>
          </div>
        </div>

        {/* 읽는 중일 때 현재 페이지 입력 */}
        {status === 'reading' && (
          <div className="animate-slideUpFade">
            <label className="block text-sm font-medium text-text-primary mb-2">
              현재 페이지 (선택사항)
            </label>
            <input
              type="number"
              min="0"
              max={book.pageCount || undefined}
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ios-green focus:border-transparent"
            />
            {book.pageCount && currentPage > 0 && (
              <p className="text-xs text-text-secondary mt-2">
                진행률: {Math.round((currentPage / book.pageCount) * 100)}%
              </p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleRegister} className="flex-1" isLoading={isLoading}>
            {status === 'wishlist' ? '위시리스트에 추가' : '읽기 시작'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
