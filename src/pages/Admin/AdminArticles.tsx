import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Trash2,
  Edit3,
  ExternalLink,
  Star,
  Search,
  CheckCircle2,
  Eye,
  Heart,
  Calendar,
  User,
  Tag,
  SlidersHorizontal,
  X,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Article, ArticleStatus, Category } from '../../types';
import { getArticles, updateArticle, deleteArticle } from '../../services/articleService';
import { getCategories } from '../../services/categoryService';
import { formatDate } from '../../components/article/ArticleCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { LoadingSpinner } from '../../components/common/Loading';

export const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selection for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Deletion modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBatchDelete, setIsBatchDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit Modal State
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editViewCount, setEditViewCount] = useState<number>(0);
  const [editLikeCount, setEditLikeCount] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<ArticleStatus>('published');
  const [editDate, setEditDate] = useState<string>('');
  const [editIsFeatured, setEditIsFeatured] = useState<boolean>(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [artList, catList] = await Promise.all([
        getArticles({ status: 'all' }, true),
        getCategories(),
      ]);
      setArticles(artList);
      setCategories(catList);
    } catch (err) {
      console.warn('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Inline Status Changer
  const handleStatusChange = async (id: string, newStatus: ArticleStatus) => {
    try {
      await updateArticle(id, { status: newStatus });
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      const statusLabels: Record<ArticleStatus, string> = {
        published: '발행(Published)',
        draft: '임시저장(Draft)',
        hidden: '숨김(Hidden)',
        rejected: '반려(Rejected)',
      };
      showToast(`상태가 [${statusLabels[newStatus]}]로 변경되었습니다.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // Quick Inline Featured Toggle
  const handleToggleFeatured = async (id: string, currentFeatured: boolean | undefined) => {
    try {
      const nextFeatured = !currentFeatured;
      await updateArticle(id, { isFeatured: nextFeatured });
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isFeatured: nextFeatured } : a))
      );
      showToast(nextFeatured ? '메인 추천 칼럼으로 지정되었습니다.' : '추천 칼럼 설정이 해제되었습니다.');
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (article: Article) => {
    setEditingArticle(article);
    setEditTitle(article.title);
    setEditSubtitle(article.subtitle || '');
    setEditCategoryId(article.categoryId);
    setEditAuthorName(article.authorName);
    setEditViewCount(article.viewCount || 0);
    setEditLikeCount(article.likeCount || 0);
    setEditStatus(article.status || 'published');
    setEditIsFeatured(Boolean(article.isFeatured));

    // Format date for date picker (YYYY-MM-DD)
    const d = new Date(article.createdAt || Date.now());
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setEditDate(`${yyyy}-${mm}-${dd}`);
  };

  // Save Edit Modal Changes
  const handleSaveArticleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    setSavingEdit(true);
    try {
      const selectedCat = categories.find((c) => c.id === editCategoryId);
      const categoryName = selectedCat ? selectedCat.name : editingArticle.categoryName;

      // Parse custom date
      let createdAtTimestamp = editingArticle.createdAt;
      if (editDate) {
        const [y, m, d] = editDate.split('-').map(Number);
        const parsed = new Date(y, m - 1, d).getTime();
        if (!isNaN(parsed)) {
          createdAtTimestamp = parsed;
        }
      }

      const updates: Partial<Article> = {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || undefined,
        categoryId: editCategoryId,
        categoryName,
        authorName: editAuthorName.trim(),
        viewCount: Number(editViewCount) || 0,
        likeCount: Number(editLikeCount) || 0,
        status: editStatus,
        isFeatured: editIsFeatured,
        createdAt: createdAtTimestamp,
      };

      await updateArticle(editingArticle.id, updates);

      setArticles((prev) =>
        prev.map((a) => (a.id === editingArticle.id ? { ...a, ...updates } : a))
      );

      showToast('칼럼 정보(추천/제목/카테고리/작가/통계/상태/작성일)가 수정되었습니다.');
      setEditingArticle(null);
    } catch (err) {
      console.error('Failed to save article edit:', err);
      showToast('칼럼 수정 중 오류가 발생했습니다.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      if (isBatchDelete) {
        for (const id of selectedIds) {
          await deleteArticle(id);
        }
        setArticles((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        showToast(`${selectedIds.length}개의 칼럼이 삭제되었습니다.`);
        setSelectedIds([]);
        setIsBatchDelete(false);
      } else if (deleteTargetId) {
        await deleteArticle(deleteTargetId);
        setArticles((prev) => prev.filter((a) => a.id !== deleteTargetId));
        showToast('칼럼이 성공적으로 삭제되었습니다.');
        setDeleteTargetId(null);
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
      showToast('칼럼 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleBatchStatusChange = async (newStatus: ArticleStatus) => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await updateArticle(id, { status: newStatus });
      }
      setArticles((prev) =>
        prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status: newStatus } : a))
      );
      showToast(`선택한 ${selectedIds.length}개 칼럼의 상태가 일괄 변경되었습니다.`);
      setSelectedIds([]);
    } catch (err) {
      console.error('Batch status change failed:', err);
      showToast('일괄 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filtered = articles.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.authorName.toLowerCase().includes(search.toLowerCase()) ||
      a.categoryName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const hiddenCount = articles.filter((a) => a.status === 'hidden' || a.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
          }`}
        >
          <div className="text-[11px] opacity-75 font-medium">전체 칼럼</div>
          <div className="text-xl font-bold font-serif-kr mt-1">{articles.length}편</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('published')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'published'
              ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            발행됨 (Published)
          </div>
          <div className="text-xl font-bold font-serif-kr mt-1 text-emerald-700">{publishedCount}편</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('draft')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'draft'
              ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
          }`}
        >
          <div className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            임시저장 (Draft)
          </div>
          <div className="text-xl font-bold font-serif-kr mt-1 text-amber-700">{draftCount}편</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('hidden')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'hidden'
              ? 'bg-rose-900 text-white border-rose-900 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200 hover:border-rose-300'
          }`}
        >
          <div className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            숨김/반려 (Hidden)
          </div>
          <div className="text-xl font-bold font-serif-kr mt-1 text-rose-700">{hiddenCount}편</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목, 작가명, 카테고리 검색..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
          {/* Batch Actions when items are selected */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200 mr-2">
              <span className="text-[11px] font-semibold text-stone-700 px-2">
                {selectedIds.length}개 선택됨
              </span>
              <button
                type="button"
                onClick={() => handleBatchStatusChange('published')}
                className="px-2 py-1 rounded bg-white text-emerald-800 hover:bg-emerald-50 text-[11px] font-semibold border border-stone-200"
              >
                발행으로 변경
              </button>
              <button
                type="button"
                onClick={() => handleBatchStatusChange('hidden')}
                className="px-2 py-1 rounded bg-white text-stone-800 hover:bg-stone-50 text-[11px] font-semibold border border-stone-200"
              >
                숨김으로 변경
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBatchDelete(true);
                  setDeleteTargetId('batch');
                }}
                className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold border border-rose-200"
              >
                일괄 삭제
              </button>
            </div>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-lg border border-stone-200 font-semibold text-stone-800 bg-white"
          >
            <option value="all">전체 상태 ({articles.length})</option>
            <option value="published">발행됨 ({publishedCount})</option>
            <option value="draft">임시저장 ({draftCount})</option>
            <option value="hidden">숨김/반려 ({hiddenCount})</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            title="새로고침"
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Articles Table with Editable Columns */}
      {loading ? (
        <LoadingSpinner message="칼럼 목록을 불러오는 중입니다..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif-kr text-base font-bold text-stone-800 mb-1">
            해당 조건의 칼럼이 없습니다
          </h3>
          <p className="text-xs text-stone-500">
            검색어나 상태 필터를 변경해 보세요.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-medium">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                      onChange={handleSelectAll}
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                  </th>
                  <th className="py-3.5 px-3 font-semibold text-center w-14">추천</th>
                  <th className="py-3.5 px-4 font-semibold">제목 / 카테고리</th>
                  <th className="py-3.5 px-4 font-semibold">작가</th>
                  <th className="py-3.5 px-4 font-semibold">통계 (조회/좋아요)</th>
                  <th className="py-3.5 px-4 font-semibold">상태</th>
                  <th className="py-3.5 px-4 font-semibold">작성일</th>
                  <th className="py-3.5 px-4 font-semibold text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((art) => {
                  const isSelected = selectedIds.includes(art.id);
                  return (
                    <tr
                      key={art.id}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        isSelected ? 'bg-stone-50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(art.id)}
                          className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                        />
                      </td>

                      {/* 1. 추천 (Featured Toggle) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(art.id, art.isFeatured)}
                          className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                            art.isFeatured
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                          }`}
                          title={art.isFeatured ? '추천 칼럼 해제 (클릭하여 끄기)' : '메인 추천 칼럼 지정 (클릭하여 켜기)'}
                        >
                          <Star className={`w-4 h-4 ${art.isFeatured ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>

                      {/* 2. 제목 / 카테고리 (Title / Category) */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(art)}
                            className="font-bold text-stone-900 hover:underline hover:text-stone-700 line-clamp-1 text-xs text-left"
                            title="클릭하여 상세 정보 수정"
                          >
                            {art.title}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                            {art.categoryName}
                          </span>
                          {art.isFeatured && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                              추천
                            </span>
                          )}
                          {art.subtitle && (
                            <span className="text-[10px] text-stone-400 truncate max-w-[150px]">
                              {art.subtitle}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. 작가 (Author Name) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(art)}
                          className="text-stone-800 font-semibold hover:text-stone-900 hover:underline inline-flex items-center gap-1"
                          title="클릭하여 작가명 변경"
                        >
                          <User className="w-3 h-3 text-stone-400" />
                          <span>{art.authorName}</span>
                        </button>
                      </td>

                      {/* 4. 통계 (조회/좋아요) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(art)}
                          className="inline-flex items-center gap-2 px-2 py-1 rounded bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-[11px] text-stone-700 transition-colors"
                          title="클릭하여 조회수/좋아요 수 변경"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3 h-3 text-stone-400" /> {art.viewCount || 0}
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-rose-600">
                            <Heart className="w-3 h-3 text-rose-500 fill-rose-50" /> {art.likeCount || 0}
                          </span>
                        </button>
                      </td>

                      {/* 5. 상태 (Status Selector) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={art.status || 'published'}
                          onChange={(e) => handleStatusChange(art.id, e.target.value as ArticleStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer focus:outline-none focus:ring-1 ${
                            art.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-500'
                              : art.status === 'draft'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-amber-500'
                              : 'bg-rose-50 text-rose-800 border-rose-300 focus:ring-rose-500'
                          }`}
                        >
                          <option value="published">🟢 발행 (Published)</option>
                          <option value="draft">🟡 임시저장 (Draft)</option>
                          <option value="hidden">⚪ 숨김 (Hidden)</option>
                          <option value="rejected">🔴 반려 (Rejected)</option>
                        </select>
                      </td>

                      {/* 6. 작성일 (Created Date) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-stone-500">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(art)}
                          className="hover:underline hover:text-stone-900 inline-flex items-center gap-1"
                          title="클릭하여 작성일자 변경"
                        >
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{formatDate(art.createdAt)}</span>
                        </button>
                      </td>

                      {/* 7. 관리 (Management Actions) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(art)}
                            className="p-1.5 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                            title="정보 수정 모달 열기"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">빠른수정</span>
                          </button>
                          <Link
                            to={`/articles/${art.id}`}
                            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                            title="칼럼 보기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/articles/${art.id}/edit`}
                            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                            title="본문 에디터로 수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setIsBatchDelete(false);
                              setDeleteTargetId(art.id);
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                            title="칼럼 영구 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Quick Edit Modal (추천, 제목, 카테고리, 작가, 통계, 상태, 작성일 일괄 수정) */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-kr text-base font-bold text-stone-900">
                    칼럼 정보 수정 (관리자)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    추천, 제목, 카테고리, 작가, 통계, 상태, 작성일을 변경합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticleEdit} className="space-y-4 pt-4 text-xs">
              {/* 1. 제목 & 부제목 */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  칼럼 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  placeholder="칼럼 제목을 입력하세요"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  부제목 (선택)
                </label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  placeholder="칼럼 부제목을 입력하세요"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                />
              </div>

              {/* 2. 카테고리 & 작가명 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    작가명 (필명)
                  </label>
                  <input
                    type="text"
                    value={editAuthorName}
                    onChange={(e) => setEditAuthorName(e.target.value)}
                    required
                    placeholder="표시될 작가명"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                  />
                </div>
              </div>

              {/* 3. 통계 (조회수 & 좋아요수) */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-stone-500" />
                    조회수 (View Count)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editViewCount}
                    onChange={(e) => setEditViewCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    좋아요 수 (Like Count)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editLikeCount}
                    onChange={(e) => setEditLikeCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                  />
                </div>
              </div>

              {/* 4. 상태 & 작성일자 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    발행 상태 (Status)
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ArticleStatus)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white font-semibold"
                  >
                    <option value="published">🟢 발행 (Published)</option>
                    <option value="draft">🟡 임시저장 (Draft)</option>
                    <option value="hidden">⚪ 숨김 (Hidden)</option>
                    <option value="rejected">🔴 반려 (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    작성일자 (Date)
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                  />
                </div>
              </div>

              {/* 5. 메인 추천 여부 */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${editIsFeatured ? 'text-amber-500 fill-amber-500' : 'text-amber-400'}`} />
                  <div>
                    <div className="font-bold text-amber-950">메인 추천 칼럼으로 지정</div>
                    <div className="text-[10px] text-amber-800">홈 화면 상단 및 추천 탭에 우선 노출됩니다.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editIsFeatured}
                  onChange={(e) => setEditIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingEdit ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title={isBatchDelete ? '선택한 칼럼 일괄 영구 삭제' : '칼럼 영구 삭제'}
        message={
          isBatchDelete
            ? `선택한 ${selectedIds.length}개의 칼럼을 영구 삭제하시겠습니까? 데이터베이스에서 완전히 제거됩니다.`
            : '관리자 권한으로 이 칼럼을 영구 삭제하시겠습니까? 삭제된 칼럼은 복구할 수 없습니다.'
        }
        confirmText="삭제하기"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteTargetId(null);
          setIsBatchDelete(false);
        }}
      />
    </div>
  );
};
