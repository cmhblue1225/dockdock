import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import SearchPage from './pages/SearchPage';

// TODO: 인증 확인 후 구현
// import { useAuthStore } from './stores/authStore';

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
  // TODO: 실제 인증 상태 확인
  const isAuthenticated = false;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 보호된 라우트 */}
          {isAuthenticated ? (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/search" element={<SearchPage />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
