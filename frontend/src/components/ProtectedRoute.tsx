import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 *
 * 사용자가 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
 * 로딩 중일 때는 로딩 표시
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않음
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 인증됨
  return <>{children}</>;
}
