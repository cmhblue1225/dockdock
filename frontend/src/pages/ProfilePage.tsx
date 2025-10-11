import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../hooks/useToast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { showToast } = useToast();

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

  const handleLogout = async () => {
    try {
      await logout();
      showToast('로그아웃되었습니다', 'success');
      navigate('/login');
    } catch (error) {
      showToast('로그아웃에 실패했습니다', 'error');
    }
  };

  const stats = statsData || { reading: 0, completed: 0, wishlist: 0 };
  const totalBooks = stats.reading + stats.completed + stats.wishlist;

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
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="text-center text-text-secondary text-sm">
          <p>📚 독독 (DockDock) v1.0.0</p>
          <p className="mt-1">당신의 독서 여정을 함께합니다</p>
        </div>
      </div>
    </div>
  );
}
