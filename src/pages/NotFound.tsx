import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 text-center">
      <div className="max-w-md bg-white p-10 rounded-2xl border border-stone-200 shadow-xs">
        <span className="font-serif-kr text-5xl font-bold text-stone-300 block mb-3">
          404
        </span>
        <h1 className="font-serif-kr text-2xl font-bold text-stone-900 mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-xs text-stone-600 mb-6 leading-relaxed">
          요청하신 페이지가 이동되었거나 삭제되었을 수 있습니다.
          주소를 다시 한번 확인해 주세요.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5" /> 홈으로 이동
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 이전 페이지
          </button>
        </div>
      </div>
    </div>
  );
};
