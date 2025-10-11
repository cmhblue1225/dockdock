import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, BookOpen, Calendar, FileText } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface BookDetailModalProps {
  bookId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface BookDetail {
  id: string;
  isbn: string;
  isbn13: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher: string;
  publishedDate: string;
  description: string;
  coverImage: string;
  categoryName: string;
  pageCount?: number;
  price: {
    standard: number;
    sales: number;
    currency: string;
  };
  link: string;
  stockStatus: string;
  rating: number;
}

export default function BookDetailModal({ bookId, isOpen, onClose }: BookDetailModalProps) {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen && bookId) {
      loadBookDetail();
    }
  }, [isOpen, bookId]);

  const loadBookDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/api/v1/books/${bookId}`);

      if (response.data.success) {
        setBook(response.data.data);
      } else {
        throw new Error(response.data.message || '책 정보를 불러오는데 실패했습니다');
      }
    } catch (err: any) {
      console.error('Failed to load book detail:', err);
      setError(err.response?.data?.message || err.message || '책 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      setIsAddingToWishlist(true);

      const response = await api.post('/api/v1/reading-books', {
        book_id: bookId,
        status: 'wishlist',
      });

      if (response.data.success) {
        setAddedToWishlist(true);
        setTimeout(() => setAddedToWishlist(false), 2000);
      }
    } catch (err: any) {
      console.error('Failed to add to wishlist:', err);
      const errorMessage = err.response?.data?.message || err.message;

      if (errorMessage.includes('이미') || err.response?.status === 409) {
        alert('이미 위시리스트에 추가된 책입니다');
      } else {
        alert('위시리스트 추가에 실패했습니다');
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full border border-white/10"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                {loading && (
                  <div className="flex items-center justify-center py-20">
                    <motion.div
                      className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}

                {error && (
                  <div className="p-8 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                      onClick={loadBookDetail}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                )}

                {book && !loading && !error && (
                  <div className="p-8">
                    <div className="grid md:grid-cols-[300px_1fr] gap-8">
                      {/* Book Cover */}
                      <div className="space-y-4">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="w-24 h-24 text-white/50" />
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <motion.button
                          onClick={handleAddToWishlist}
                          disabled={isAddingToWishlist || addedToWishlist}
                          className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                            addedToWishlist
                              ? 'bg-green-600 text-white'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          whileHover={{ scale: addedToWishlist ? 1 : 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Heart className={addedToWishlist ? 'fill-current' : ''} />
                          {addedToWishlist ? '위시리스트에 추가됨!' : isAddingToWishlist ? '추가 중...' : '위시리스트에 추가'}
                        </motion.button>

                        {book.link && (
                          <a
                            href={book.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-center transition-colors"
                          >
                            알라딘에서 구매하기 →
                          </a>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="space-y-6 text-white">
                        {/* Title & Author */}
                        <div>
                          <h2 className="text-3xl font-bold mb-2">{book.title}</h2>
                          {book.subtitle && (
                            <p className="text-xl text-purple-300 mb-3">{book.subtitle}</p>
                          )}
                          <p className="text-lg text-purple-200">{book.author}</p>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4" />
                            <span>{book.publisher}</span>
                          </div>
                          {book.publishedDate && (
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                              <Calendar className="w-4 h-4" />
                              <span>{book.publishedDate}</span>
                            </div>
                          )}
                          {book.pageCount && (
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                              <FileText className="w-4 h-4" />
                              <span>{book.pageCount}쪽</span>
                            </div>
                          )}
                        </div>

                        {/* Category */}
                        {book.categoryName && (
                          <div>
                            <span className="inline-block px-3 py-1 bg-purple-600/50 rounded-full text-sm">
                              {book.categoryName}
                            </span>
                          </div>
                        )}

                        {/* Rating */}
                        {book.rating > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 text-xl">★</span>
                            <span className="text-lg font-medium">{book.rating.toFixed(1)}</span>
                            <span className="text-purple-300 text-sm">/5.0</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                          {book.price.standard !== book.price.sales && (
                            <span className="text-lg text-purple-300 line-through">
                              {book.price.standard.toLocaleString()}원
                            </span>
                          )}
                          <span className="text-2xl font-bold text-white">
                            {book.price.sales.toLocaleString()}원
                          </span>
                          {book.price.standard !== book.price.sales && (
                            <span className="text-sm text-green-400 font-medium">
                              {Math.round(((book.price.standard - book.price.sales) / book.price.standard) * 100)}% 할인
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {book.description && (
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold mb-3">책 소개</h3>
                            <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                              {book.description}
                            </p>
                          </div>
                        )}

                        {/* Stock Status */}
                        {book.stockStatus && (
                          <div className="text-sm text-purple-300">
                            재고 상태: {book.stockStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
