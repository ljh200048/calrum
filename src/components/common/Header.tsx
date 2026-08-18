import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  PenSquare,
  Search,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  Bookmark,
  Heart,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { currentUser, userProfile, isAdmin, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleLogout = async () => {
    await signout();
    setProfileDropdown(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title, one line */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="font-serif-kr text-2xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
            글결
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded bg-stone-900 text-stone-100 font-sans">
            COLUMN
          </span>
        </Link>

        {/* Zone 2: 4-6 nav links, 1-2 word labels, single line */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <Link
            to="/"
            className={`whitespace-nowrap transition-colors hover:text-stone-900 ${
              isActive('/') && location.pathname === '/' ? 'text-stone-900 font-semibold' : ''
            }`}
          >
            홈
          </Link>
          <Link
            to="/articles"
            className={`whitespace-nowrap transition-colors hover:text-stone-900 ${
              isActive('/articles') ? 'text-stone-900 font-semibold' : ''
            }`}
          >
            최신 칼럼
          </Link>
          <Link
            to="/articles?sort=popular"
            className="whitespace-nowrap transition-colors hover:text-stone-900"
          >
            인기 칼럼
          </Link>
          <Link
            to="/category/all"
            className={`whitespace-nowrap transition-colors hover:text-stone-900 ${
              isActive('/category') ? 'text-stone-900 font-semibold' : ''
            }`}
          >
            카테고리
          </Link>
          <Link
            to="/search?tab=authors"
            className="whitespace-nowrap transition-colors hover:text-stone-900"
          >
            작가
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`whitespace-nowrap flex items-center gap-1 text-amber-800 transition-colors hover:text-amber-900 ${
                isActive('/admin') ? 'font-bold' : ''
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              관리자
            </Link>
          )}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/search"
            aria-label="검색"
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
          >
            <Search className="w-4 h-4" />
          </Link>

          <Link
            to="/write"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors shrink-0 shadow-xs"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">칼럼 쓰기</span>
          </Link>

          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-stone-300 transition-all focus:outline-none"
                aria-label="사용자 메뉴"
              >
                <img
                  src={
                    userProfile?.photoURL ||
                    currentUser.photoURL ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.uid}`
                  }
                  alt={userProfile?.nickname || '프로필'}
                  className="w-8 h-8 rounded-full object-cover border border-stone-300"
                />
              </button>

              {profileDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 text-xs"
                  onClick={() => setProfileDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="font-semibold text-stone-900 truncate">
                      {userProfile?.nickname || currentUser.displayName || '칼럼니스트'}
                    </p>
                    <p className="text-stone-500 text-[11px] truncate">{currentUser.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                        관리자
                      </span>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    내 프로필
                  </Link>
                  <Link
                    to="/profile?tab=articles"
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-400" />
                    작성한 칼럼
                  </Link>
                  <Link
                    to="/profile?tab=bookmarks"
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 font-medium"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-stone-400" />
                    북마크
                  </Link>
                  <Link
                    to="/profile?tab=likes"
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 font-medium"
                  >
                    <Heart className="w-3.5 h-3.5 text-stone-400" />
                    좋아요한 글
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-amber-50 text-amber-900 font-semibold border-t border-stone-100"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      관리자 대시보드
                    </Link>
                  )}

                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors whitespace-nowrap"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors whitespace-nowrap"
              >
                회원가입
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            aria-label="메뉴 열기"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-6 space-y-3 shadow-md">
          <div className="flex flex-col space-y-2 text-sm font-medium text-stone-700">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stone-100"
            >
              홈
            </Link>
            <Link
              to="/articles"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stone-100"
            >
              최신 칼럼
            </Link>
            <Link
              to="/articles?sort=popular"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stone-100"
            >
              인기 칼럼
            </Link>
            <Link
              to="/category/all"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stone-100"
            >
              카테고리 전체
            </Link>
            <Link
              to="/search?tab=authors"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stone-100"
            >
              인기 작가
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-amber-50 text-amber-900 font-semibold"
              >
                관리자 대시보드
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <Link
              to="/write"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold"
            >
              <PenSquare className="w-4 h-4" />
              칼럼 작성하기
            </Link>
            {!currentUser && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-700"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 rounded-lg bg-stone-100 text-xs font-medium text-stone-900"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
