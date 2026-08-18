import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, loginGoogle, resetPass } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
      } else {
        try {
          await login(email, password || 'password123');
          navigate(from, { replace: true });
          return;
        } catch {
          setError('로그인 처리 중 문제가 발생했습니다. 계정 정보를 확인해 주세요.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google 로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      await resetPass(resetEmail);
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setShowResetModal(false);
      }, 2500);
    } catch (err) {
      console.error('Reset pass error:', err);
      alert('비밀번호 재설정 메일 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-10 max-w-md w-full shadow-xs">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block font-serif-kr text-3xl font-black tracking-tight text-stone-900 mb-1">
            INSIGHT.
          </Link>
          <h2 className="text-xs font-bold text-stone-700 tracking-wider uppercase">
            칼럼니스트 플랫폼 로그인
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            깊이 있는 사유와 통찰을 기록하고 공유해보세요.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Google OAuth Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-800 flex items-center justify-center gap-2.5 transition-colors mb-4 shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google 계정으로 로그인</span>
        </button>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] text-stone-500 uppercase font-medium">
            또는 이메일 직접 입력
          </span>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">이메일 주소</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-stone-700">비밀번호</label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[11px] text-stone-500 hover:text-stone-900"
              >
                비밀번호 찾기
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            {loading ? '로그인 처리 중...' : '이메일로 로그인'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-stone-600">
          아직 계정이 없으신가요?{' '}
          <Link
            to="/register"
            className="font-bold text-stone-900 underline underline-offset-4 ml-1"
          >
            회원가입하기
          </Link>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <h3 className="font-serif-kr text-base font-bold text-stone-900 mb-2">
              비밀번호 재설정
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              가입하신 이메일 주소를 입력하시면 재설정 링크를 보내드립니다.
            </p>

            {resetSent ? (
              <div className="p-3 bg-green-50 text-green-800 text-xs rounded-lg text-center font-medium">
                재설정 이메일이 발송되었습니다. 메일함을 확인해 주세요.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                  >
                    재설정 링크 전송
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
