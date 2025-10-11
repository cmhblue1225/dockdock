import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../hooks/useToast';
import { cardVariants } from '../lib/animations';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut, deleteAccount } = useAuthStore();
  const { showToast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 전체 통계 조회
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['reading-books', 'all'],
    queryFn: async () => {
      const [readingRes, completedRes, wishlistRes] = await Promise.all([
        api.get('/api/v1/reading-books', { params: { status: 'reading', limit: 1 } }),
        api.get('/api/v1/reading-books', { params: { status: 'completed', limit: 1 } }),
        api.get('/api/v1/reading-books', { params: { status: 'wishlist', limit: 1 } }),
      ]);

      return {
        reading: readingRes.data.data.pagination.total,
        completed: completedRes.data.data.pagination.total,
        wishlist: wishlistRes.data.data.pagination.total,
      };
    },
  });

  // 온보딩 레포트 조회
  const {
    data: reportData,
    isLoading: reportLoading,
  } = useQuery({
    queryKey: ['onboarding-report', user?.id],
    queryFn: async () => {
      try {
        const response = await api.get('/api/v1/onboarding/report');
        return response.data.data;
      } catch (error: any) {
        // 404는 에러가 아니라 레포트가 없다는 의미
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('로그아웃되었습니다', 'success');
      navigate('/login');
    } catch (error) {
      showToast('로그아웃에 실패했습니다', 'error');
    }
  };

  const handleViewReport = () => {
    navigate('/onboarding/report');
  };

  const handleResetOnboarding = () => {
    if (
      window.confirm(
        '온보딩을 다시 진행하시겠습니까?\n새로운 독서 성향 분석을 받을 수 있습니다.'
      )
    ) {
      navigate('/onboarding');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      showToast('회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.', 'success');
      navigate('/login');
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      showToast('회원 탈퇴에 실패했습니다', 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const stats = statsData || { reading: 0, completed: 0, wishlist: 0 };
  const totalBooks = stats.reading + stats.completed + stats.wishlist;
  const hasReport = !!reportData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-light to-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 프로필 헤더 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-custom">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-ios-green to-ios-green-dark rounded-full flex items-center justify-center text-4xl text-white font-bold">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {user?.email || '사용자'}
              </h1>
              <p className="text-text-secondary">독서를 사랑하는 독독 사용자</p>
            </div>
          </div>
        </div>

        {/* 독서 통계 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-custom">
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <span>📊</span>
            <span>독서 통계</span>
          </h2>

          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ios-green"></div>
            </div>
          ) : (
            <>
              {/* 전체 통계 */}
              <div className="mb-8 p-6 bg-gradient-to-br from-ios-green to-ios-green-dark text-white rounded-2xl">
                <div className="text-5xl font-bold mb-2">{totalBooks}</div>
                <div className="text-white/90 text-lg">총 등록된 책</div>
              </div>

              {/* 상세 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                  <div className="text-3xl mb-2">📖</div>
                  <div className="text-3xl font-bold text-blue-700 mb-1">{stats.reading}</div>
                  <div className="text-blue-600">읽는 중</div>
                </div>

                <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-3xl font-bold text-green-700 mb-1">{stats.completed}</div>
                  <div className="text-green-600">완독</div>
                </div>

                <div className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-200">
                  <div className="text-3xl mb-2">💫</div>
                  <div className="text-3xl font-bold text-purple-700 mb-1">{stats.wishlist}</div>
                  <div className="text-purple-600">위시리스트</div>
                </div>
              </div>

              {/* 완독률 */}
              {totalBooks > 0 && (
                <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-text-secondary font-medium">완독률</span>
                    <span className="text-2xl font-bold text-text-primary">
                      {Math.round((stats.completed / totalBooks) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-ios-green to-ios-green-light h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.completed / totalBooks) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 온보딩 레포트 */}
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-custom"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <span>📊</span>
            <span>독서 성향 분석</span>
          </h2>

          {reportLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ios-green"></div>
            </div>
          ) : hasReport ? (
            <div className="space-y-4">
              {/* 레포트 요약 카드 */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{reportData.persona?.icon || '🌌'}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-purple-900 mb-1">
                      {reportData.persona?.title || '당신의 독서 페르소나'}
                    </h3>
                    <p className="text-purple-700 text-sm">
                      {reportData.persona?.subtitle || '독서 성향이 분석되었습니다'}
                    </p>
                  </div>
                </div>

                {/* 핵심 특징 */}
                {reportData.persona?.keyTraits && reportData.persona.keyTraits.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-purple-800 mb-2">핵심 특징:</p>
                    <div className="flex flex-wrap gap-2">
                      {reportData.persona.keyTraits.slice(0, 3).map((trait: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/70 rounded-full text-xs text-purple-700 border border-purple-200"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-purple-600 mb-4">
                  생성일: {new Date(reportData.createdAt).toLocaleDateString('ko-KR')}
                </p>

                <Button
                  onClick={handleViewReport}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <span className="mr-2">📖</span>
                  전체 레포트 보기
                </Button>
              </div>

              {/* 온보딩 재설정 */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-text-secondary mb-3">
                  독서 취향이 변했나요? 온보딩을 다시 진행하여 새로운 분석을 받아보세요.
                </p>
                <Button
                  onClick={handleResetOnboarding}
                  variant="outline"
                  className="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <span className="mr-2">🔄</span>
                  온보딩 다시하기
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                아직 독서 성향 분석을 받지 않았어요
              </h3>
              <p className="text-text-secondary mb-6">
                온보딩을 통해 당신만의 독서 DNA를 발견하세요
              </p>
              <Button
                onClick={() => navigate('/onboarding')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              >
                <span className="mr-2">✨</span>
                온보딩 시작하기
              </Button>
            </div>
          )}
        </motion.div>

        {/* 계정 관리 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-custom">
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <span>⚙️</span>
            <span>계정 관리</span>
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-text-secondary mb-1">이메일</div>
              <div className="text-text-primary font-medium">{user?.email}</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-text-secondary mb-1">계정 ID</div>
              <div className="text-text-primary font-mono text-xs">{user?.id}</div>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-6 text-red-600 border-red-300 hover:bg-red-50"
            >
              <span className="mr-2">🚪</span>
              로그아웃
            </Button>

            {/* 회원 탈퇴 */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="p-4 bg-red-50 rounded-xl mb-4">
                <h3 className="text-sm font-bold text-red-900 mb-2">⚠️ 위험 영역</h3>
                <p className="text-xs text-red-700">
                  회원 탈퇴 시 모든 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.
                </p>
              </div>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="w-full text-red-700 border-red-400 hover:bg-red-100"
              >
                <span className="mr-2">🗑️</span>
                회원 탈퇴
              </Button>
            </div>
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="text-center text-text-secondary text-sm">
          <p>📚 독독 (DockDock) v1.0.0</p>
          <p className="mt-1">당신의 독서 여정을 함께합니다</p>
        </div>
      </div>

      {/* 회원 탈퇴 확인 다이얼로그 */}
      <AnimatePresence>
        {showDeleteDialog && (
          <>
            {/* 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteDialog(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* 다이얼로그 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                {/* 아이콘 */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    정말 탈퇴하시겠습니까?
                  </h2>
                  <p className="text-text-secondary text-sm">
                    이 작업은 되돌릴 수 없습니다
                  </p>
                </div>

                {/* 삭제될 데이터 목록 */}
                <div className="bg-red-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm font-bold text-red-900 mb-3">
                    다음 데이터가 영구적으로 삭제됩니다:
                  </p>
                  <ul className="space-y-2 text-xs text-red-700">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>프로필 및 계정 정보</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>독서 기록 (읽는 중, 완독, 위시리스트)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>독서 노트, 사진, 인용구</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>리뷰 및 평점</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>온보딩 레포트 및 선호도</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>추천 정보 및 통계</span>
                    </li>
                  </ul>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeleteDialog(false)}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-100"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    탈퇴하기
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
