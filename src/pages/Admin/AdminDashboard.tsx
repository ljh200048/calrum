import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  MessageSquare,
  Flag,
  Eye,
  TrendingUp,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Article, Report, UserProfile } from '../../types';
import { getArticles, seedSampleArticles } from '../../services/articleService';
import { getAllUsers } from '../../services/authService';
import { getAllComments } from '../../services/commentService';
import { getReports } from '../../services/reportService';
import { formatDate } from '../../components/article/ArticleCard';
import { LoadingSpinner } from '../../components/common/Loading';

export const AdminDashboard: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [arts, usrs, cmts, reps] = await Promise.all([
        getArticles({ status: 'all' }),
        getAllUsers(),
        getAllComments(),
        getReports(),
      ]);

      setArticles(arts);
      setUsers(usrs);
      setCommentsCount(cmts.length);
      setReports(reps);
    } catch (err) {
      console.error('Admin dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedSampleArticles();
      await loadDashboardData();
      alert('샘플 칼럼 데이터가 정상적으로 생성되었습니다.');
    } catch (err) {
      console.error('Seed error:', err);
      alert('샘플 데이터 생성 중 오류가 발생했습니다.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="대시보드 통계를 집계하는 중입니다..." />;
  }

  // Calculate metrics
  const totalViews = articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);
  const totalLikes = articles.reduce((acc, a) => acc + (a.likeCount || 0), 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayArticlesCount = articles.filter(
    (a) => a.createdAt && a.createdAt >= startOfToday.getTime()
  ).length;

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  const popularArticles = [...articles]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-stone-500">
            <span className="text-xs font-semibold text-stone-600">전체 회원</span>
            <Users className="w-4 h-4 text-stone-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-brand text-stone-900">
            {users.length}
            <span className="text-xs font-normal text-stone-500 ml-1">명</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-stone-500">
            <span className="text-xs font-semibold text-stone-600">전체 칼럼</span>
            <FileText className="w-4 h-4 text-stone-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-brand text-stone-900">
            {articles.length}
            <span className="text-xs font-normal text-stone-500 ml-1">편</span>
          </p>
          <span className="text-[11px] text-green-700 font-medium mt-1 block">
            오늘 신규 {todayArticlesCount}편
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-stone-500">
            <span className="text-xs font-semibold text-stone-600">누적 조회수</span>
            <Eye className="w-4 h-4 text-stone-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-brand text-stone-900">
            {totalViews.toLocaleString()}
            <span className="text-xs font-normal text-stone-500 ml-1">회</span>
          </p>
          <span className="text-[11px] text-stone-500 mt-1 block">
            좋아요 총 {totalLikes}개
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-stone-500">
            <span className="text-xs font-semibold text-stone-600">미결 신고</span>
            <Flag className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-brand text-red-600">
            {pendingReportsCount}
            <span className="text-xs font-normal text-stone-500 ml-1">건</span>
          </p>
          <span className="text-[11px] text-stone-500 mt-1 block">
            댓글 총 {commentsCount}개
          </span>
        </div>
      </div>

      {/* Quick Tooling Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif-kr text-base font-bold text-stone-900 mb-1">
            Firestore 데이터베이스 샘플 초기화
          </h3>
          <p className="text-xs text-stone-600">
            테스트용 고품질 에디토리얼 칼럼 데이터를 생성합니다.
          </p>
        </div>
        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shrink-0 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? '생성 중...' : '샘플 데이터 동기화'}
        </button>
      </div>

      {/* Grid: Popular columns & Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Popular Top 5 */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-stone-900" />
              <h3 className="font-serif-kr text-base font-bold text-stone-900">
                조회수 상위 칼럼
              </h3>
            </div>
            <Link to="/admin/articles" className="text-xs text-stone-500 hover:text-stone-900">
              전체 관리 →
            </Link>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {popularArticles.map((art, idx) => (
              <div key={art.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-brand font-bold text-stone-400 w-4">{idx + 1}</span>
                  <div className="min-w-0">
                    <Link
                      to={`/articles/${art.id}`}
                      className="font-semibold text-stone-900 hover:underline truncate block"
                    >
                      {art.title}
                    </Link>
                    <span className="text-stone-500 text-[11px]">{art.authorName}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-stone-900">{art.viewCount || 0}</span>
                  <span className="text-[10px] text-stone-400 ml-0.5">views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-900" />
              <h3 className="font-serif-kr text-base font-bold text-stone-900">
                최근 작성된 칼럼
              </h3>
            </div>
            <Link to="/admin/articles" className="text-xs text-stone-500 hover:text-stone-900">
              전체 보기 →
            </Link>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {articles.slice(0, 5).map((art) => (
              <div key={art.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    to={`/articles/${art.id}`}
                    className="font-semibold text-stone-900 hover:underline truncate block"
                  >
                    {art.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span>{art.authorName}</span>
                    <span>·</span>
                    <span>{formatDate(art.createdAt)}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                    art.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : art.status === 'draft'
                      ? 'bg-stone-100 text-stone-600'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {art.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
