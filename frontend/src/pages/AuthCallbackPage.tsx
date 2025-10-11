import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase가 URL의 OAuth 토큰을 자동으로 처리
    // onAuthStateChange 리스너가 세션을 업데이트함
    const handleCallback = async () => {
      try {
        // URL 해시에서 세션 정보 확인
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('OAuth callback error:', error);
          navigate('/login', { replace: true });
          return;
        }

        if (session) {
          // 로그인 성공 - 홈으로 이동
          navigate('/', { replace: true });
        } else {
          // 세션이 없으면 로그인 페이지로
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ios-green flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">로그인 처리 중...</p>
      </div>
    </div>
  );
}
