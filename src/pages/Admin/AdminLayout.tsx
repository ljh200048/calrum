import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Flag,
  Layers,
  ChevronLeft,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navItems = [
    { to: '/admin', label: '대시보드', icon: LayoutDashboard, end: true },
    { to: '/admin/articles', label: '칼럼 관리', icon: FileText },
    { to: '/admin/users', label: '회원 관리', icon: Users },
    { to: '/admin/comments', label: '댓글 관리', icon: MessageSquare },
    { to: '/admin/reports', label: '신고 관리', icon: Flag },
    { to: '/admin/categories', label: '카테고리 관리', icon: Layers },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-kr text-xl sm:text-2xl font-bold">
                글결 최고 관리자 센터
              </h1>
              <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              플랫폼 전체 콘텐츠, 회원, 신고 및 카테고리를 총괄 관리합니다.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" /> 서비스 메인으로
        </Link>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`
            }
          >
            <item.icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Admin Content Outlet */}
      <Outlet />
    </div>
  );
};
