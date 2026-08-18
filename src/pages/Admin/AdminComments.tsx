import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, ExternalLink } from 'lucide-react';
import { Comment } from '../../types';
import { getAllComments, deleteComment } from '../../services/commentService';
import { formatDate } from '../../components/article/ArticleCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { LoadingSpinner } from '../../components/common/Loading';

export const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      const list = await getAllComments(100);
      setComments(list);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteComment(deleteTarget.id, deleteTarget.articleId);
      setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
        <h2 className="font-serif-kr text-base font-bold text-stone-900">
          전체 댓글 모니터링 및 관리
        </h2>
        <span className="text-xs font-semibold text-stone-600">
          총 {comments.length}개의 댓글
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="댓글 목록을 불러오는 중입니다..." />
      ) : comments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
          등록된 댓글이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">작성자</th>
                  <th className="py-3.5 px-4 font-semibold">댓글 내용</th>
                  <th className="py-3.5 px-4 font-semibold">작성일</th>
                  <th className="py-3.5 px-4 font-semibold">칼럼 바로가기</th>
                  <th className="py-3.5 px-4 font-semibold text-right">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {comments.map((cmt) => (
                  <tr key={cmt.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            cmt.authorPhotoURL ||
                            `https://api.dicebear.com/7.x/notionists/svg?seed=${cmt.authorId}`
                          }
                          alt={cmt.authorName}
                          className="w-6 h-6 rounded-full object-cover border border-stone-300"
                        />
                        <span className="font-bold text-stone-900">{cmt.authorName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-md text-stone-800 line-clamp-2">
                      {cmt.content}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-500">
                      {formatDate(cmt.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        to={`/articles/${cmt.articleId}`}
                        className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 underline underline-offset-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>칼럼 보기</span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeleteTarget(cmt)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="댓글 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="댓글 강제 삭제"
        message="이 댓글을 완전히 삭제하시겠습니까? 데이터베이스에서 영구 삭제됩니다."
        confirmText="삭제하기"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
