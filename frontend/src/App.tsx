import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import OnboardingPagePremium from './pages/OnboardingPagePremium';
import OnboardingReportPage from './pages/OnboardingReportPage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import BookDetailPage from './pages/BookDetailPage';
import ReadingBooksPage from './pages/ReadingBooksPage';
import CompletedBooksPage from './pages/CompletedBooksPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { AppLayout } from './components/layout';

// Store
import { useAuthStore } from './stores/authStore';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
    },
  },
});

function App() {
  const { initialize } = useAuthStore();

  // 앱 시작 시 인증 상태 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* 온보딩 라우트 - 인증 필요, Layout 불필요 */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPagePremium />
              </ProtectedRoute>
            }
          />

          {/* 온보딩 레포트 라우트 - 인증 필요, Layout 불필요 */}
          <Route
            path="/onboarding/report"
            element={
              <ProtectedRoute>
                <OnboardingReportPage />
              </ProtectedRoute>
            }
          />

          {/* 보호된 라우트 - AppLayout으로 감싸기 */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/reading" element={<ReadingBooksPage />} />
            <Route path="/completed" element={<CompletedBooksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/books/:readingBookId" element={<BookDetailPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
