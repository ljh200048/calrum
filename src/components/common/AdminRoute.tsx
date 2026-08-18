import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './Loading';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="관리자 권한을 확인하는 중입니다..." />
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-stone-200 rounded-2xl text-center shadow-xs">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-serif-kr text-stone-900 mb-2">
          관리자 권한이 필요합니다
        </h2>
        <p className="text-xs text-stone-600 mb-6 leading-relaxed">
          이 페이지는 관리자 계정으로 로그인한 경우에만 접근할 수 있습니다. 등록된 관리자 이메일인지 확인해 주세요.
        </p>
        <Link
          to="/"
          className="inline-flex px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
