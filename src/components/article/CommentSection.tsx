import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Flag, Send } from 'lucide-react';
import { Comment, UserProfile } from '../../types';
import { getComments, addComment, deleteComment } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from './ArticleCard';
import { ConfirmModal } from '../common/ConfirmModal';
import { ReportModal } from '../common/ReportModal';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  articleId: string;
  onCommentCountChange?: (count: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  onCommentCountChange,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Report modal state
  const [reportTargetComment, setReportTargetComment] = useState<Comment | null>(null);

  const loadComments = async () => {
    try {
      const data = await getComments(articleId);
      setComments(data);
      if (onCommentCountChange) onCommentCountChange(data.length);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await addComment(
        articleId,
        {
          uid: currentUser.uid,
          nickname: userProfile.nickname || currentUser.displayName || '칼럼 애독자',
          photoURL: userProfile.photoURL || currentUser.photoURL || undefined,
        },
        content.trim()
      );
      const updated = [newComment, ...comments];
      setComments(updated);
      setContent('');
      if (onCommentCountChange) onCommentCountChange(updated.length);
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteComment(deleteTargetId, articleId);
      const updated = comments.filter((c) => c.id !== deleteTargetId);
      setComments(updated);
      if (onCommentCountChange) onCommentCountChange(updated.length);
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="pt-10 border-t border-stone-200" id="comments">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-stone-800" />
        <h3 className="font-serif-kr text-xl font-bold text-stone-900">
          의견과 사유 나누기 <span className="text-stone-400 font-sans text-base">({comments.length})</span>
        </h3>
      </div>

      {/* Input Box */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={
                userProfile?.photoURL ||
                currentUser.photoURL ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.uid}`
              }
              alt="프로필"
              className="w-7 h-7 rounded-full object-cover border border-stone-300"
            />
            <span className="text-xs font-semibold text-stone-800">
              {userProfile?.nickname || currentUser.displayName}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="이 칼럼에 대한 생각이나 통찰을 정중하게 남겨주세요."
            rows={3}
            maxLength={1000}
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-stone-600 font-mono">
              {content.length} / 1000자
            </span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="w-3 h-3" />
              {submitting ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 bg-stone-50 rounded-xl border border-stone-200 text-center">
          <p className="text-xs text-stone-600 mb-3">
            칼럼에 대한 사유와 의견을 남기려면 로그인이 필요합니다.
          </p>
          <Link
            to="/login"
            className="inline-flex px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            로그인하고 댓글 쓰기
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-stone-400">댓글을 불러오는 중...</div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
          <p className="text-xs text-stone-600 font-medium">아직 등록된 댓글이 없습니다.</p>
          <p className="text-[11px] text-stone-500 mt-1">첫 번째로 생각을 남겨보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = currentUser?.uid === comment.authorId;
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        comment.authorPhotoURL ||
                        `https://api.dicebear.com/7.x/notionists/svg?seed=${comment.authorId}`
                      }
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-stone-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900">
                        {comment.authorName}
                      </span>
                      <span className="text-[11px] text-stone-600 ml-2">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentUser && !isOwner && (
                      <button
                        onClick={() => setReportTargetComment(comment)}
                        title="신고하기"
                        className="text-stone-600 hover:text-red-600 p-1 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteTargetId(comment.id)}
                        title="삭제하기"
                        className="text-stone-600 hover:text-red-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-9 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="댓글 삭제"
        message="작성하신 댓글을 정말로 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다."
        confirmText="삭제하기"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Report Modal */}
      {reportTargetComment && (
        <ReportModal
          isOpen={Boolean(reportTargetComment)}
          onClose={() => setReportTargetComment(null)}
          targetType="comment"
          targetId={reportTargetComment.id}
          targetTitle={reportTargetComment.content}
        />
      )}
    </section>
  );
};
