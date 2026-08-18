import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle, RefreshCw, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUserRole } from '../services/authService';
import { seedDefaultCategories } from '../services/categoryService';
import { seedSampleArticles } from '../services/articleService';

export const SetupAdmin: React.FC = () => {
  const { currentUser, userProfile, isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGrantAdmin = async () => {
    if (!currentUser) {
      setErrorMsg('먼저 로그인하거나 계정을 생성해 주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await updateUserRole(currentUser.uid, 'admin');
      if (refreshProfile) {
        await refreshProfile();
      }
      setSuccessMsg('현재 계정이 성공적으로 관리자(ADMIN) 권한으로 승격되었습니다.');
    } catch (err: any) {
      console.error('Grant admin error:', err);
      setErrorMsg(err.message || '관리자 권한 부여 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await seedDefaultCategories();
      await seedSampleArticles();
      setSuccessMsg('기본 10대 카테고리 및 샘플 칼럼 데이터가 Firestore에 성공적으로 생성되었습니다.');
    } catch (err: any) {
      console.error('Seed error:', err);
      setErrorMsg('데이터 초기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-stone-100">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif-kr text-2xl font-bold text-stone-900">
              최고 관리자 계정 설정 및 부트스트랩
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              서비스 운영을 위한 첫 번째 관리자 권한을 부여하고 초기 데이터를 구성합니다.
            </p>
          </div>
        </div>

        {/* Current status */}
        <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">현재 로그인 계정</span>
            <span className="font-mono font-bold text-stone-900">
              {currentUser ? currentUser.email : '로그인되지 않음'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">현재 권한 상태</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded ${
                isAdmin
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {isAdmin ? '최고 관리자 (ADMIN)' : '일반 회원 (USER)'}
            </span>
          </div>
          {userProfile && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">칼럼니스트 닉네임</span>
              <span className="font-semibold text-stone-800">{userProfile.nickname}</span>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action steps */}
        <div className="space-y-4 pt-2">
          {!currentUser ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-stone-600">
                관리자 권한을 설정하려면 먼저 로그인하거나 계정을 생성하세요.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
                >
                  로그인하기
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50"
                >
                  회원가입하기
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGrantAdmin}
                disabled={loading || isAdmin}
                className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isAdmin
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                {isAdmin ? '이미 관리자 권한이 활성화되어 있습니다' : '현재 계정에 관리자 권한 부여하기'}
              </button>

              <button
                type="button"
                onClick={handleInitializeData}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                기본 카테고리 10종 및 샘플 칼럼 일괄 생성
              </button>

              {isAdmin && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    관리자 대시보드로 이동하기
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
