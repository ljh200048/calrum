import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Bookmark,
  Share2,
  Flag,
  Edit3,
  Trash2,
  Clock,
  Eye,
  Calendar,
  ChevronLeft,
  UserPlus,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Article, UserProfile } from '../types';
import {
  getArticleById,
  incrementViewCount,
  toggleLike,
  isArticleLiked,
  toggleBookmark,
  isArticleBookmarked,
  deleteArticle,
  getArticles,
} from '../services/articleService';
import { getUserProfile } from '../services/authService';
import { isFollowing, toggleFollow } from '../services/followService';
import { useAuth } from '../context/AuthContext';
import { formatDate, ArticleCard } from '../components/article/ArticleCard';
import { CommentSection } from '../components/article/CommentSection';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ReportModal } from '../components/common/ReportModal';
import { ShareModal } from '../components/common/ShareModal';
import { LoadingSpinner } from '../components/common/Loading';

export const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<UserProfile | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // User state on this article
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchArticleData = async () => {
      setLoading(true);
      try {
        const art = await getArticleById(id);
        if (!art) {
          setArticle(null);
          setLoading(false);
          return;
        }

        setArticle(art);
        setLikeCount(art.likeCount || 0);

        // Update document title for SEO
        document.title = `${art.title} | 글결 칼럼`;

        // Increment view count in Firestore
        await incrementViewCount(id);

        // Fetch author details
        const authorData = await getUserProfile(art.authorId);
        if (authorData) {
          setAuthor(authorData);
          setFollowers(authorData.followerCount || 0);
        }

        // Fetch related articles
        const related = await getArticles({
          category: art.categoryId,
          limit: 4,
          status: 'published',
        });
        setRelatedArticles(related.filter((r) => r.id !== art.id).slice(0, 3));

        // Check user like/bookmark/follow status
        if (currentUser) {
          const [hasLiked, hasBookmarked, isUserFollowing] = await Promise.all([
            isArticleLiked(id, currentUser.uid),
            isArticleBookmarked(id, currentUser.uid),
            isFollowing(currentUser.uid, art.authorId),
          ]);
          setLiked(hasLiked);
          setBookmarked(hasBookmarked);
          setFollowing(isUserFollowing);
        }
      } catch (err) {
        console.error('Failed to load article detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [id, currentUser]);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }
    if (!article) return;

    try {
      const res = await toggleLike(article.id, currentUser.uid);
      setLiked(res.liked);
      setLikeCount((prev) => prev + res.countDelta);
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }
    if (!article) return;

    try {
      const res = await toggleBookmark(article.id, currentUser.uid);
      setBookmarked(res);
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }
    if (!article) return;
    if (currentUser.uid === article.authorId) return;

    try {
      const res = await toggleFollow(currentUser.uid, article.authorId);
      setFollowing(res.following);
      setFollowers((prev) => (res.following ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  const handleDeleteArticle = async () => {
    if (!article) return;
    setDeleting(true);
    try {
      await deleteArticle(article.id, article.authorId);
      alert('칼럼이 성공적으로 삭제되었습니다.');
      navigate('/articles');
    } catch (err) {
      console.error('Article delete failed:', err);
      alert('칼럼 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="칼럼을 불러오는 중입니다..." size="lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center bg-white p-12 rounded-2xl border border-stone-200 shadow-xs">
        <h2 className="font-serif-kr text-2xl font-bold text-stone-900 mb-2">
          칼럼을 찾을 수 없습니다
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          요청하신 칼럼이 삭제되었거나 존재하지 않는 주소입니다.
        </p>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
        >
          <ChevronLeft className="w-4 h-4" /> 칼럼 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const isAuthor = currentUser?.uid === article.authorId;
  const canManage = isAuthor || isAdmin;

  // Simple markdown renderer for headers, quotes, lists, dividers
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-6 leading-relaxed">
            {currentParagraph.join('\n')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={`h2-${index}`} className="font-serif-kr text-2xl font-bold text-stone-900 mt-10 mb-4">
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h3 key={`h3-${index}`} className="font-serif-kr text-xl font-bold text-stone-900 mt-8 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('> ')) {
        flushParagraph();
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-stone-900 pl-5 my-8 font-serif-kr italic text-stone-700 text-lg sm:text-xl leading-relaxed bg-stone-50/50 py-3 rounded-r-lg">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      } else if (trimmed.startsWith('- ')) {
        flushParagraph();
        elements.push(
          <li key={`li-${index}`} className="ml-6 list-disc mb-2 text-stone-800">
            {trimmed.replace('- ', '')}
          </li>
        );
      } else if (trimmed.startsWith('---')) {
        flushParagraph();
        elements.push(
          <hr key={`hr-${index}`} className="my-10 border-stone-200 w-1/3 mx-auto" />
        );
      } else if (trimmed.startsWith('![') && trimmed.includes('](')) {
        flushParagraph();
        const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          elements.push(
            <div key={`img-${index}`} className="my-8 rounded-xl overflow-hidden shadow-xs">
              <img src={match[2]} alt={match[1]} className="w-full object-cover" />
              {match[1] && (
                <p className="text-center text-xs text-stone-500 mt-2 font-serif-kr">{match[1]}</p>
              )}
            </div>
          );
        }
      } else if (trimmed === '') {
        flushParagraph();
      } else {
        currentParagraph.push(line);
      }
    });

    flushParagraph();
    return elements;
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Top back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/articles"
          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> 칼럼 목록으로
        </Link>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              to={`/articles/${article.id}/edit`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700"
            >
              <Edit3 className="w-3.5 h-3.5" /> 수정
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" /> 삭제
            </button>
          </div>
        )}
      </div>

      {/* Article Header */}
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Link
            to={`/category/${article.categoryId}`}
            className="text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-full transition-colors uppercase tracking-wider"
          >
            {article.categoryName}
          </Link>
          {article.readTimeMinutes && (
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTimeMinutes}분 분량
            </span>
          )}
        </div>

        <h1 className="font-serif-kr text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-4 tracking-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-base sm:text-xl text-stone-600 leading-relaxed font-serif-kr font-light mb-8 max-w-2xl mx-auto">
            {article.subtitle}
          </p>
        )}

        {/* Author details bar */}
        <div className="flex items-center justify-center gap-6 text-xs text-stone-500 border-y border-stone-200/80 py-4 my-6">
          <Link
            to={`/author/${article.authorId}`}
            className="flex items-center gap-2.5 group hover:text-stone-900"
          >
            <img
              src={
                article.authorPhotoURL ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${article.authorId}`
              }
              alt={article.authorName}
              className="w-9 h-9 rounded-full object-cover border border-stone-300 group-hover:ring-2 group-hover:ring-stone-900 transition-all"
            />
            <div className="text-left">
              <span className="font-bold text-stone-900 block group-hover:underline">
                {article.authorName}
              </span>
              <span className="text-[11px] text-stone-500">칼럼니스트</span>
            </div>
          </Link>

          <span className="text-stone-300">|</span>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {formatDate(article.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              조회 {article.viewCount || 0}
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="aspect-16/9 rounded-2xl overflow-hidden mb-12 shadow-xs bg-stone-100">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Prose Content */}
      <main className="max-w-2xl mx-auto">
        <div className="article-prose leading-loose text-stone-900">
          {renderFormattedContent(article.content)}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 my-10 pt-8 border-t border-stone-200">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                to={`/articles?tag=${encodeURIComponent(tag)}`}
                className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-full font-medium transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Interactive Floating / Action Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between my-10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                liked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>좋아요 {likeCount}</span>
            </button>

            <button
              onClick={handleBookmarkToggle}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                bookmarked
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{bookmarked ? '저장됨' : '북마크'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1"
              title="공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-400 hover:text-red-600 text-xs font-semibold"
              title="칼럼 신고"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="bg-stone-50 p-6 sm:p-8 rounded-2xl border border-stone-200 my-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to={`/author/${article.authorId}`}>
                <img
                  src={
                    author?.photoURL ||
                    article.authorPhotoURL ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${article.authorId}`
                  }
                  alt={article.authorName}
                  className="w-16 h-16 rounded-full object-cover border border-stone-300"
                />
              </Link>
              <div>
                <Link
                  to={`/author/${article.authorId}`}
                  className="font-serif-kr text-lg font-bold text-stone-900 hover:underline"
                >
                  {article.authorName}
                </Link>
                <p className="text-xs text-stone-500 mt-0.5">
                  팔로워 {followers}명 · 작성 칼럼 {author?.articleCount || 1}편
                </p>
              </div>
            </div>

            {currentUser?.uid !== article.authorId && (
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                  following
                    ? 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{following ? '팔로잉' : '팔로우'}</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-stone-700 mt-4 leading-relaxed whitespace-pre-line">
            {author?.bio || article.authorBio || '세상을 향한 날카로운 시선과 사유를 칼럼으로 기록합니다.'}
          </p>
        </div>

        {/* Comment Section */}
        <CommentSection articleId={article.id} />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-16 mt-16 border-t border-stone-200">
            <h3 className="font-serif-kr text-xl font-bold text-stone-900 mb-6">
              같은 주제의 다른 칼럼
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Deletion Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="칼럼 삭제"
        message="이 칼럼을 완전히 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
        confirmText="삭제하기"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDeleteArticle}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={article.title}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="article"
        targetId={article.id}
        targetTitle={article.title}
      />
    </div>
  );
};
