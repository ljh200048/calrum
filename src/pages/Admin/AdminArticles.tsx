import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Trash2,
  Edit3,
  ExternalLink,
  Star,
  Search,
  Filter,
} from 'lucide-react';
import { Article, ArticleStatus } from '../../types';
import { getArticles, updateArticle, deleteArticle } from '../../services/articleService';
import { formatDate } from '../../components/article/ArticleCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { LoadingSpinner } from '../../components/common/Loading';

export const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Deletion modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getArticles({ status: 'all' });
      setArticles(data);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ArticleStatus) => {
    try {
      await updateArticle(id, { status: newStatus });
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean | undefined) => {
    try {
      const nextFeatured = !currentFeatured;
      await updateArticle(id, { isFeatured: nextFeatured });
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isFeatured: nextFeatured } : a))
      );
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteArticle(deleteTargetId);
      setArticles((prev) => prev.filter((a) => a.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Failed to delete article:', err);
      alert('칼럼 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = articles.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.authorName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목 또는 작가명 검색..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <span className="text-stone-500 font-medium">상태 필터:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-lg border border-stone-200 font-semibold text-stone-800 bg-white"
          >
            <option value="all">전체 상태</option>
            <option value="published">발행됨 (published)</option>
            <option value="draft">임시저장 (draft)</option>
            <option value="hidden">숨김 (hidden)</option>
            <option value="rejected">반려 (rejected)</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      {loading ? (
        <LoadingSpinner message="칼럼 목록을 불러오는 중입니다..." />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">추천</th>
                  <th className="py-3.5 px-4 font-semibold">제목 / 카테고리</th>
                  <th className="py-3.5 px-4 font-semibold">작가</th>
                  <th className="py-3.5 px-4 font-semibold">통계 (조회/좋아요)</th>
                  <th className="py-3.5 px-4 font-semibold">상태</th>
                  <th className="py-3.5 px-4 font-semibold">작성일</th>
                  <th className="py-3.5 px-4 font-semibold text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Featured star toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(art.id, art.isFeatured)}
                        className={`p-1 rounded ${
                          art.isFeatured ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'
                        }`}
                        title={art.isFeatured ? '추천 칼럼 해제' : '메인 추천 칼럼으로 지정'}
                      >
                        <Star className={`w-4 h-4 ${art.isFeatured ? 'fill-amber-500' : ''}`} />
                      </button>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <Link
                        to={`/articles/${art.id}`}
                        className="font-bold text-stone-900 hover:underline line-clamp-1"
                      >
                        {art.title}
                      </Link>
                      <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {art.categoryName}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-800 font-medium">
                      {art.authorName}
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-600">
                      조회 {art.viewCount || 0} · 좋아요 {art.likeCount || 0}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={art.status}
                        onChange={(e) => handleStatusChange(art.id, e.target.value as ArticleStatus)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                          art.status === 'published'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : art.status === 'draft'
                            ? 'bg-stone-100 text-stone-600 border-stone-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="published">발행 (published)</option>
                        <option value="draft">임시저장 (draft)</option>
                        <option value="hidden">숨김 (hidden)</option>
                        <option value="rejected">반려 (rejected)</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-500">
                      {formatDate(art.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/articles/${art.id}`}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                          title="열람"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/articles/${art.id}/edit`}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                          title="수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTargetId(art.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="칼럼 영구 삭제"
        message="관리자 권한으로 이 칼럼을 영구 삭제하시겠습니까? 데이터베이스에서 완전히 제거됩니다."
        confirmText="삭제하기"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
