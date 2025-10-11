import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검증
    if (!email || !password || !passwordConfirm || !displayName) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName);
      // 회원가입 성공 시 온보딩으로 이동
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다');
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
          <h1 className="text-3xl font-bold mb-2">독독 회원가입</h1>
          <p className="text-surface/80">
            독서 습관을 시작해보세요
          </p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-surface rounded-3xl p-8 shadow-custom-xl">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* 이름 입력 */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text-primary mb-2">
                이름
              </label>
              <input
                type="text"
                id="displayName"
                placeholder="홍길동"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                비밀번호 (6자 이상)
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* 비밀번호 확인 입력 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-text-primary mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="passwordConfirm"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ios-green text-surface py-3 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '회원가입 중...' : '회원가입'}
            </button>

            {/* 로그인 링크 */}
            <div className="text-center text-sm text-text-secondary">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-ios-green font-semibold hover:underline">
                로그인하기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
