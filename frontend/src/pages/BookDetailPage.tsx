import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';

interface ReadingBook {
  id: string;
  book_id: string;
  status: 'wishlist' | 'reading' | 'completed';
  current_page: number;
  total_pages: number | null;
  progress_percent: number | null;
  started_at: string | null;
  completed_at: string | null;
  book: {
    id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    cover_image_url: string | null;
    page_count: number | null;
  };
}

interface ReadingRecord {
  id: string;
  content: string;
  page_number: number | null;
  record_type: 'note' | 'quote' | 'thought';
  created_at: string;
}

interface Review {
  id: string;
  user_id: string;
  book_id: string;
  reading_book_id: string;
  rating: number;
  review_text: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function BookDetailPage() {
  const { readingBookId } = useParams<{ readingBookId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'records' | 'photos'>('records');

  // 기록 추가 모달
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    content: '',
    page_number: '',
    record_type: 'note' as 'note' | 'quote' | 'thought',
  });

  // 페이지 업데이트 (슬라이더로 변경)
  const [currentPageInput, setCurrentPageInput] = useState(0);

  // 총 페이지 수 입력 (page_count가 없는 경우)
  const [isAddingTotalPages, setIsAddingTotalPages] = useState(false);
  const [totalPagesInput, setTotalPagesInput] = useState('');

  // 독서 완료 모달
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review_text: '',
  });

  // 사진 업로드 (추후 구현 예정)
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);

  // 책 정보 조회
  const { data: readingBookData, isLoading: bookLoading } = useQuery({
    queryKey: ['reading-book', readingBookId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/reading-books/${readingBookId}`);
      return response.data;
    },
    enabled: !!readingBookId,
  });

  // 독서 기록 조회
  const { data: recordsData, isLoading: recordsLoading } = useQuery({
    queryKey: ['reading-records', readingBookId],
    queryFn: async () => {
      const response = await api.get('/api/v1/reading-records', {
        params: { reading_book_id: readingBookId, limit: 100 },
      });
      return response.data;
    },
    enabled: !!readingBookId,
  });

  // 리뷰 조회 (완독한 책인 경우)
  const { data: reviewQueryData } = useQuery({
    queryKey: ['review', readingBookId],
    queryFn: async () => {
      const response = await api.get('/api/v1/reviews', {
        params: { reading_book_id: readingBookId },
      });
      return response.data;
    },
    enabled: !!readingBookId,
  });

  // 총 페이지 수 업데이트
  const updateTotalPagesMutation = useMutation({
    mutationFn: async (totalPages: number) => {
      const response = await api.patch(`/api/v1/reading-books/${readingBookId}`, {
        total_pages: totalPages,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-book', readingBookId] });
      queryClient.invalidateQueries({ queryKey: ['reading-books'] });
      showToast('총 페이지 수가 저장되었습니다', 'success');
      setIsAddingTotalPages(false);
      setTotalPagesInput('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '총 페이지 수 저장에 실패했습니다';
      showToast(message, 'error');
    },
  });

  // 기록 생성
  const createRecordMutation = useMutation({
    mutationFn: async (data: {
      reading_book_id: string;
      content: string;
      page_number?: number;
      record_type: string;
    }) => {
      const response = await api.post('/api/v1/reading-records', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-records', readingBookId] });
      showToast('기록이 추가되었습니다', 'success');
      setIsRecordModalOpen(false);
      setNewRecord({ content: '', page_number: '', record_type: 'note' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '기록 추가에 실패했습니다';
      showToast(message, 'error');
    },
  });

  // 독서 완료 처리
  const completeMutation = useMutation({
    mutationFn: async () => {
      // 1. 상태를 completed로 변경
      await api.patch(`/api/v1/reading-books/${readingBookId}`, {
        status: 'completed',
      });

      // 2. 리뷰 작성
      await api.post('/api/v1/reviews', {
        reading_book_id: readingBookId,
        rating: reviewData.rating,
        review_text: reviewData.review_text,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-book', readingBookId] });
      queryClient.invalidateQueries({ queryKey: ['reading-books'] });
      showToast('독서를 완료했습니다!', 'success');
      setIsCompleteModalOpen(false);
      // 완독 페이지로 이동
      navigate('/completed');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '독서 완료 처리에 실패했습니다';
      showToast(message, 'error');
    },
  });

  // 사진 업로드 (추후 구현 예정)
  // @ts-expect-error - 추후 사진 갤러리 탭에서 사용 예정
  const _uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, recordId }: { file: File; recordId: string }) => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('reading_record_id', recordId);

      const response = await api.post('/api/v1/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-records', readingBookId] });
      showToast('사진이 업로드되었습니다', 'success');
      setSelectedFile(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '사진 업로드에 실패했습니다';
      showToast(message, 'error');
    },
  });

  const handleCreateRecord = () => {
    if (!newRecord.content.trim()) {
      showToast('내용을 입력해주세요', 'warning');
      return;
    }

    if (!readingBookId) return;

    createRecordMutation.mutate({
      reading_book_id: readingBookId,
      content: newRecord.content,
      page_number: newRecord.page_number ? parseInt(newRecord.page_number) : undefined,
      record_type: newRecord.record_type,
    });
  };

  const handleSliderChange = (value: number) => {
    setCurrentPageInput(value);
  };

  const handleSliderCommit = () => {
    if (currentPageInput !== readingBook?.current_page && readingBook) {
      // total_pages가 없는데 book.page_count가 있으면 함께 업데이트
      const updateData: any = { current_page: currentPageInput };
      if (!readingBook.total_pages && readingBook.book?.page_count) {
        updateData.total_pages = readingBook.book.page_count;
      }

      api.patch(`/api/v1/reading-books/${readingBookId}`, updateData)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['reading-book', readingBookId] });
          queryClient.invalidateQueries({ queryKey: ['reading-books'] });
          showToast('현재 페이지가 업데이트되었습니다', 'success');
        })
        .catch((error: any) => {
          const message = error.response?.data?.error?.message || '페이지 업데이트에 실패했습니다';
          showToast(message, 'error');
        });
    }
  };

  const handleSaveTotalPages = () => {
    const totalPages = parseInt(totalPagesInput);
    if (isNaN(totalPages) || totalPages <= 0) {
      showToast('올바른 페이지 수를 입력해주세요', 'warning');
      return;
    }
    updateTotalPagesMutation.mutate(totalPages);
  };

  const handleComplete = () => {
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      showToast('평점은 1-5 사이여야 합니다', 'warning');
      return;
    }

    completeMutation.mutate();
  };

  const readingBook: ReadingBook | undefined = readingBookData?.data;
  const records: ReadingRecord[] = recordsData?.data?.items || [];
  const review: Review | undefined = reviewQueryData?.data?.items?.[0];

  // 총 페이지 수: book.page_count 또는 reading_books.total_pages
  const totalPages = readingBook?.book?.page_count || readingBook?.total_pages;
  const progress = readingBook?.progress_percent || 0;

  // readingBook이 로드되면 currentPageInput 초기화
  useEffect(() => {
    if (readingBook) {
      setCurrentPageInput(readingBook.current_page);
    }
  }, [readingBook]);

  const recordTypeLabels = {
    note: { icon: '📝', label: '메모', color: 'bg-blue-100 text-blue-700' },
    quote: { icon: '💬', label: '인용구', color: 'bg-purple-100 text-purple-700' },
    thought: { icon: '💭', label: '생각', color: 'bg-green-100 text-green-700' },
  };

  if (bookLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ios-green"></div>
      </div>
    );
  }

  if (!readingBook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">책을 찾을 수 없습니다</h2>
        <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-light to-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 책 정보 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-custom mb-6">
          <div className="flex gap-6">
            <img
              src={readingBook.book.cover_image_url || '/placeholder-book.png'}
              alt={readingBook.book.title}
              className="w-32 h-44 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                {readingBook.book.title}
              </h1>
              {readingBook.book.author && (
                <p className="text-text-secondary mb-1">{readingBook.book.author}</p>
              )}
              {readingBook.book.publisher && (
                <p className="text-text-secondary text-sm mb-4">{readingBook.book.publisher}</p>
              )}

              {/* 페이지 트래커 (감성적 슬라이더) */}
              {readingBook.status === 'reading' && (
                <div className="mt-6">
                  {totalPages ? (
                    <>
                      {/* 헤더 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📖</span>
                          <span className="text-sm font-semibold text-text-primary">독서 진행 상황</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold bg-gradient-to-r from-ios-green to-ios-green-light bg-clip-text text-transparent">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>

                      {/* 현재 페이지 표시 */}
                      <div className="bg-gradient-to-r from-ios-green/10 to-ios-green-light/10 rounded-2xl p-4 mb-3">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-3xl font-bold text-ios-green">{currentPageInput}</span>
                          <span className="text-text-secondary">/</span>
                          <span className="text-2xl font-semibold text-text-secondary">
                            {totalPages}
                          </span>
                          <span className="text-sm text-text-secondary">페이지</span>
                        </div>
                      </div>

                      {/* 슬라이더 */}
                      <div className="relative px-2">
                        <input
                          type="range"
                          min="0"
                          max={totalPages}
                          value={currentPageInput}
                          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                          onMouseUp={handleSliderCommit}
                          onTouchEnd={handleSliderCommit}
                          className="w-full h-3 bg-gradient-to-r from-gray-200 via-ios-green/30 to-ios-green-light/30 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-6
                            [&::-webkit-slider-thumb]:h-6
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-gradient-to-br
                            [&::-webkit-slider-thumb]:from-ios-green
                            [&::-webkit-slider-thumb]:to-ios-green-dark
                            [&::-webkit-slider-thumb]:shadow-lg
                            [&::-webkit-slider-thumb]:shadow-ios-green/30
                            [&::-webkit-slider-thumb]:cursor-grab
                            [&::-webkit-slider-thumb]:active:cursor-grabbing
                            [&::-webkit-slider-thumb]:hover:scale-110
                            [&::-webkit-slider-thumb]:transition-transform
                            [&::-moz-range-thumb]:w-6
                            [&::-moz-range-thumb]:h-6
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-gradient-to-br
                            [&::-moz-range-thumb]:from-ios-green
                            [&::-moz-range-thumb]:to-ios-green-dark
                            [&::-moz-range-thumb]:border-0
                            [&::-moz-range-thumb]:shadow-lg
                            [&::-moz-range-thumb]:shadow-ios-green/30
                            [&::-moz-range-thumb]:cursor-grab
                            [&::-moz-range-thumb]:active:cursor-grabbing
                            [&::-moz-range-thumb]:hover:scale-110
                            [&::-moz-range-thumb]:transition-transform"
                          style={{
                            background: `linear-gradient(to right,
                              rgb(52, 211, 153) 0%,
                              rgb(52, 211, 153) ${progress}%,
                              rgb(229, 231, 235) ${progress}%,
                              rgb(229, 231, 235) 100%)`
                          }}
                        />
                      </div>

                      {/* 메시지 */}
                      <div className="mt-3 text-center">
                        <p className="text-xs text-text-secondary italic">
                          슬라이더를 움직여 현재 읽고 있는 페이지를 기록하세요 ✨
                        </p>
                      </div>
                    </>
                  ) : (
                    // 총 페이지 수 입력 UI
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                      <div className="text-center mb-4">
                        <span className="text-3xl mb-2 inline-block">📚</span>
                        <h3 className="text-lg font-semibold text-text-primary mb-1">
                          이 책의 총 페이지 수를 알려주세요
                        </h3>
                        <p className="text-sm text-text-secondary">
                          페이지 수를 입력하면 독서 진행 상황을 추적할 수 있어요
                        </p>
                      </div>

                      {isAddingTotalPages ? (
                        <div className="space-y-3">
                          <input
                            type="number"
                            value={totalPagesInput}
                            onChange={(e) => setTotalPagesInput(e.target.value)}
                            placeholder="예: 384"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ios-green focus:border-transparent text-center text-lg font-semibold"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddingTotalPages(false);
                                setTotalPagesInput('');
                              }}
                              className="flex-1"
                              size="sm"
                            >
                              취소
                            </Button>
                            <Button
                              onClick={handleSaveTotalPages}
                              className="flex-1"
                              size="sm"
                              isLoading={updateTotalPagesMutation.isPending}
                            >
                              저장
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setIsAddingTotalPages(true)}
                          variant="primary"
                          className="w-full"
                          size="sm"
                        >
                          📝 총 페이지 수 입력하기
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2 mt-4">
                {readingBook.status === 'reading' && (
                  <Button onClick={() => setIsCompleteModalOpen(true)} variant="primary" size="sm" className="w-full">
                    ✅ 독서 완료하기
                  </Button>
                )}
              </div>

              {/* 상태 뱃지 */}
              <div className="mt-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    readingBook.status === 'reading'
                      ? 'bg-blue-100 text-blue-700'
                      : readingBook.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {readingBook.status === 'reading'
                    ? '📖 읽는 중'
                    : readingBook.status === 'completed'
                    ? '✅ 완독'
                    : '💫 위시리스트'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 (완독한 책인 경우) */}
        {readingBook.status === 'completed' && review && (
          <div className="bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-custom mb-6 border border-warning/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <span>✨</span>
                나의 리뷰
              </h2>
              <span className="text-sm text-text-secondary">
                {new Date(review.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* 별점 표시 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-8 h-8 ${
                      star <= review.rating
                        ? 'fill-warning text-warning'
                        : 'fill-gray-300 text-gray-300'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-2xl font-bold text-warning">{review.rating}.0</span>
            </div>

            {/* 리뷰 텍스트 */}
            {review.review_text && (
              <div className="bg-white/50 rounded-xl p-4 border border-warning/10">
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                  {review.review_text}
                </p>
              </div>
            )}

            {!review.review_text && (
              <p className="text-text-secondary text-sm italic">
                평점만 남기고 후기는 작성하지 않으셨습니다
              </p>
            )}
          </div>
        )}

        {/* 탭 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-custom mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('records')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'records'
                  ? 'text-ios-green border-b-2 border-ios-green'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              📝 독서 기록
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'photos'
                  ? 'text-ios-green border-b-2 border-ios-green'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              📷 사진
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'records' && (
              <div className="space-y-6">
                {/* 기록 추가 버튼 */}
                <Button
                  onClick={() => setIsRecordModalOpen(true)}
                  variant="primary"
                  className="w-full"
                >
                  <span className="mr-2">✍️</span>
                  새 기록 추가
                </Button>

                {/* 타임라인 */}
                {recordsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ios-green"></div>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📖</div>
                    <p className="text-text-secondary">
                      아직 기록이 없습니다. 첫 기록을 남겨보세요!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => {
                      const type = recordTypeLabels[record.record_type];
                      return (
                        <div
                          key={record.id}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{type.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${type.color}`}>
                                  {type.label}
                                </span>
                                {record.page_number && (
                                  <span className="text-xs text-text-secondary">
                                    {record.page_number}p
                                  </span>
                                )}
                                <span className="text-xs text-text-secondary ml-auto">
                                  {new Date(record.created_at).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              <p className="text-text-primary whitespace-pre-wrap">
                                {record.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📷</div>
                <p className="text-text-secondary">사진 갤러리 기능은 곧 추가될 예정입니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기록 작성 모달 */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setNewRecord({ content: '', page_number: '', record_type: 'note' });
        }}
        title="새 기록 추가"
        size="lg"
      >
        <div className="space-y-4">
          {/* 기록 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              기록 유형
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['note', 'quote', 'thought'] as const).map((type) => {
                const typeInfo = recordTypeLabels[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewRecord({ ...newRecord, record_type: type })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      newRecord.record_type === type
                        ? 'border-ios-green bg-ios-green/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{typeInfo.icon}</div>
                    <div className="text-sm font-medium">{typeInfo.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 페이지 번호 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              페이지 번호 (선택사항)
            </label>
            <input
              type="number"
              value={newRecord.page_number}
              onChange={(e) => setNewRecord({ ...newRecord, page_number: e.target.value })}
              placeholder="예: 127"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ios-green focus:border-transparent"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              내용 *
            </label>
            <textarea
              value={newRecord.content}
              onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
              placeholder={
                newRecord.record_type === 'quote'
                  ? '인상깊었던 문구를 입력하세요...'
                  : newRecord.record_type === 'thought'
                  ? '책을 읽으며 떠오른 생각을 기록하세요...'
                  : '메모를 입력하세요...'
              }
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ios-green focus:border-transparent resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsRecordModalOpen(false);
                setNewRecord({ content: '', page_number: '', record_type: 'note' });
              }}
              className="flex-1"
              disabled={createRecordMutation.isPending}
            >
              취소
            </Button>
            <Button
              onClick={handleCreateRecord}
              className="flex-1"
              isLoading={createRecordMutation.isPending}
            >
              저장
            </Button>
          </div>
        </div>
      </Modal>

      {/* 독서 완료 모달 */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="독서 완료"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              축하합니다!
            </h3>
            <p className="text-text-secondary">
              이 책에 대한 평가를 남겨주세요
            </p>
          </div>

          {/* 평점 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3 text-center">
              평점을 선택하세요
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-12 h-12 ${
                      star <= reviewData.rating
                        ? 'fill-warning text-warning'
                        : 'fill-gray-300 text-gray-300'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* 후기 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              후기 (선택사항)
            </label>
            <textarea
              value={reviewData.review_text}
              onChange={(e) => setReviewData({ ...reviewData, review_text: e.target.value })}
              placeholder="이 책에 대한 생각을 자유롭게 남겨주세요..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ios-green focus:border-transparent resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCompleteModalOpen(false)}
              className="flex-1"
              disabled={completeMutation.isPending}
            >
              취소
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1"
              isLoading={completeMutation.isPending}
            >
              완료
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
