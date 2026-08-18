import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, Shield, Heart } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../../config/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-12 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-serif-kr text-2xl font-bold tracking-tight text-white">
                글결
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-sans">
                COLUMN
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-400">
              생각을 깊게 하고, 사유를 넓히는 프리미엄 에디토리얼 칼럼 플랫폼. 누구나 자신만의 시선으로 세상을 기록합니다.
            </p>
            <div className="pt-2">
              <Link
                to="/write"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-200 hover:text-white underline underline-offset-4"
              >
                칼럼니스트로 글쓰기 시작 →
              </Link>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 font-sans">
              주요 카테고리
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-xs text-stone-400">
              {DEFAULT_CATEGORIES.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 font-sans">
              탐색 및 바로가기
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/articles" className="hover:text-white transition-colors">
                  전체 칼럼 아카이브
                </Link>
              </li>
              <li>
                <Link to="/articles?sort=popular" className="hover:text-white transition-colors">
                  이달의 인기 칼럼
                </Link>
              </li>
              <li>
                <Link to="/search?tab=authors" className="hover:text-white transition-colors">
                  주목받는 칼럼니스트
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  키워드 통합 검색
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 font-sans">
              플랫폼 정책 & 가이드
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              글결은 건전하고 신뢰할 수 있는 에디토리얼 생태계를 지향합니다. 표절 및 비방성 콘텐츠는 엄격히 금지됩니다.
            </p>
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <Link to="/admin" className="hover:text-stone-300 transition-colors flex items-center gap-1">
                <Shield className="w-3 h-3" /> 관리자 센터
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} 글결 (Geulgyeol) Column Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>에디토리얼 윤리규정</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
