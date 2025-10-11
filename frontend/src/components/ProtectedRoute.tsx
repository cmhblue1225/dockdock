import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { getOnboardingStatus } from '../lib/onboardingApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 *
 * 사용자가 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
 * 온보딩이 완료되지 않았으면 온보딩 페이지로 리다이렉트
 * 로딩 중일 때는 로딩 표시
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuthStore();
  const location = useLocation();

  // 온보딩 상태 확인 (온보딩 페이지가 아닐 때만)
  const shouldCheckOnboarding = !!user && location.pathname !== '/onboarding';
  const { data: onboardingCompleted, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding', 'status', user?.id],
    queryFn: getOnboardingStatus,
    enabled: shouldCheckOnboarding,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    retry: false,
  });

  // 로딩 중
  if (authLoading || (shouldCheckOnboarding && onboardingLoading)) {
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

  // 온보딩 미완료 (온보딩 페이지가 아닌 경우)
  if (shouldCheckOnboarding && onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // 인증됨 & 온보딩 완료 (또는 온보딩 페이지)
  return <>{children}</>;
}
