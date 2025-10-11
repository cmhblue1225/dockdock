import { useState } from 'react';
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
  start_date: string | null;
  end_date: string | null;
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

export default function BookDetailPage() {
  const { readingBookId } = useParams<{ readingBookId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'records' | 'stats'>('records');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    content: '',
    page_number: '',
    record_type: 'note' as 'note' | 'quote' | 'thought',
  });

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

  const readingBook: ReadingBook | undefined = readingBookData?.data;
  const records: ReadingRecord[] = recordsData?.data?.items || [];

  const progress =
    readingBook?.book.page_count && readingBook.current_page > 0
      ? Math.round((readingBook.current_page / readingBook.book.page_count) * 100)
      : 0;

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

              {/* 진행률 */}
              {readingBook.status === 'reading' && readingBook.book.page_count && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">진행률</span>
                    <span className="text-lg font-bold text-ios-green">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-ios-green to-ios-green-light h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    {readingBook.current_page} / {readingBook.book.page_count} 페이지
                  </p>
                </div>
              )}

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
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-ios-green border-b-2 border-ios-green'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              📊 통계
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

            {activeTab === 'stats' && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-text-secondary">통계 기능은 곧 추가될 예정입니다</p>
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
    </div>
  );
}
