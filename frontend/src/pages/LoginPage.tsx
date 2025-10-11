import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import AppleLogo from '../components/icons/AppleLogo';
import KakaoLogo from '../components/icons/KakaoLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithKakao, signInWithApple } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

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

  const handleKakaoLogin = async () => {
    setSocialLoading(true);
    try {
      await signInWithKakao();
      // OAuth는 자동으로 리다이렉트됨
    } catch (err: any) {
      setError(err.message || 'Kakao 로그인에 실패했습니다');
      setSocialLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setSocialLoading(true);
    try {
      await signInWithApple();
      // OAuth는 자동으로 리다이렉트됨
    } catch (err: any) {
      setError(err.message || 'Apple 로그인에 실패했습니다');
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ios-green flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">똑똑한 독서 습관,</h1>
          <h2 className="text-3xl font-bold mb-4">독독하자에서 시작하세요.</h2>
          <p className="text-white/80 text-base">
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
                className="w-full px-2 py-3 bg-transparent border-b-2 border-text-secondary/30 focus:outline-none focus:border-ios-green placeholder:text-text-secondary/60 transition-colors text-text-primary"
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
                className="w-full px-2 py-3 bg-transparent border-b-2 border-text-secondary/30 focus:outline-none focus:border-ios-green placeholder:text-text-secondary/60 transition-colors text-text-primary"
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
                className="w-5 h-5 text-ios-green border-text-secondary rounded focus:ring-ios-green accent-ios-green"
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
              className="w-full bg-ios-green text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            {/* 추가 링크 */}
            <div className="flex justify-center space-x-4 text-sm text-text-secondary">
              <button type="button" className="hover:text-text-primary">아이디 찾기</button>
              <span>|</span>
              <button type="button" className="hover:text-text-primary">비밀번호 찾기</button>
              <span>|</span>
              <Link to="/signup" className="text-text-primary font-semibold hover:text-ios-green">
                회원가입
              </Link>
            </div>
          </form>

          {/* 다른 방법으로 로그인 */}
          <div className="text-center my-6">
            <p className="text-text-secondary text-sm">다른 방법으로 로그인</p>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-3">
            {/* Apple 로그인 - 공식 디자인 가이드라인 준수 */}
            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={socialLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium relative flex items-center justify-center hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px' }}
            >
              <AppleLogo className="w-5 h-5 absolute left-4" />
              <span className="text-base">Apple로 로그인</span>
            </button>

            {/* Kakao 로그인 - 공식 색상 사용 */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={socialLoading}
              className="w-full py-3 rounded-lg font-medium relative flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px', backgroundColor: '#FEE500', color: '#000000' }}
            >
              <KakaoLogo className="w-5 h-5 absolute left-4" />
              <span className="text-base font-medium">카카오 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
