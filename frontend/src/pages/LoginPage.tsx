import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ios-green flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-12 text-surface">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-3xl font-bold mb-2">똑똑한 독서 습관,</h1>
          <h2 className="text-3xl font-bold mb-4">독독하자에서 시작하세요.</h2>
          <p className="text-surface/80">
            읽은 책을 기록하고, 새로운 책을 추천받아 보세요.
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-surface rounded-3xl p-8 shadow-custom-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 이메일 입력 */}
            <div>
              <input
                type="email"
                placeholder="아이디 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <input
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* 자동 로그인 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 text-ios-green border-border-color rounded focus:ring-primary"
              />
              <label htmlFor="remember" className="ml-3 text-text-primary font-medium">
                자동 로그인
              </label>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ios-green text-surface py-3 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            {/* 추가 링크 */}
            <div className="flex justify-center space-x-4 text-sm text-text-secondary">
              <button type="button" className="hover:text-text-primary">
                아이디 찾기
              </button>
              <span>|</span>
              <button type="button" className="hover:text-text-primary">
                비밀번호 찾기
              </button>
              <span>|</span>
              <button type="button" className="hover:text-text-primary">
                회원가입
              </button>
            </div>
          </form>

          {/* 구분선 */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-border-color"></div>
            <span className="px-4 text-text-secondary text-sm">다른 방법으로 로그인</span>
            <div className="flex-1 border-t border-border-color"></div>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-3">
            {/* Apple 로그인 */}
            <button
              type="button"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">🍎</span>
              <span>Apple로 로그인</span>
            </button>

            {/* Google 로그인 */}
            <button
              type="button"
              className="w-full bg-white border-2 border-border-color text-text-primary py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-background transition-colors"
            >
              <span className="text-xl">G</span>
              <span>Google로 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
