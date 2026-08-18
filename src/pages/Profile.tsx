import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Edit2,
  FileText,
  Bookmark as BookmarkIcon,
  Heart,
  Users,
  PenSquare,
  Globe,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Article, UserProfile } from '../types';
import {
  getArticles,
  getUserBookmarkedArticles,
  getUserLikedArticles,
  deleteArticle,
} from '../services/articleService';
import { getFollowedAuthors } from '../services/followService';
import { ArticleCard } from '../components/article/ArticleCard';
import { AuthorCard } from '../components/author/AuthorCard';
import { SkeletonCard } from '../components/common/Loading';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const Profile: React.FC = () => {
  const { currentUser, userProfile, updateProfile, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'articles';

  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [draftArticles, setDraftArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [likes, setLikes] = useState<Article[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit Profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [updating, setUpdating] = useState(false);

  // Sub tab for my articles
  const [articleSubTab, setArticleSubTab] = useState<'published' | 'draft'>('published');

  // Deletion modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async (showLoading = false) => {
    if (!currentUser) return;
    if (showLoading) setLoading(true);
    try {
      const [allUserArts, userDrafts, userBookmarks, userLikes, followed] =
        await Promise.all([
          getArticles({ authorId: currentUser.uid, status: 'published' }),
          getArticles({ authorId: currentUser.uid, status: 'draft' }),
          getUserBookmarkedArticles(currentUser.uid),
          getUserLikedArticles(currentUser.uid),
          getFollowedAuthors(currentUser.uid),
        ]);

      if (allUserArts) setMyArticles(allUserArts);
      if (userDrafts) setDraftArticles(userDrafts);
      if (userBookmarks) setBookmarks(userBookmarks);
      if (userLikes) setLikes(userLikes);
      if (followed) setFollowedAuthors(followed);
    } catch (err) {
      console.warn('Failed to load profile data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      setEditNickname(userProfile.nickname || '');
      setEditBio(userProfile.bio || '');
      setEditPhotoURL(userProfile.photoURL || '');
      setEditWebsite(userProfile.website || '');
    }
  }, [userProfile]);

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({
        nickname: editNickname.trim(),
        bio: editBio.trim(),
        photoURL: editPhotoURL.trim(),
        website: editWebsite.trim(),
      });
      await refreshProfile();
      setShowEditModal(false);
      alert('프로필 정보가 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteArticleConfirm = async () => {
    if (!deleteTargetId || !currentUser) return;
    setDeleting(true);
    try {
      await deleteArticle(deleteTargetId, currentUser.uid);
      setMyArticles((prev) => prev.filter((a) => a.id !== deleteTargetId));
      setDraftArticles((prev) => prev.filter((a) => a.id !== deleteTargetId));
      setDeleteTargetId(null);
      await refreshProfile();
    } catch (err) {
      console.error('Failed to delete article:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Profile Header Box */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img
              src={
                userProfile?.photoURL ||
                currentUser.photoURL ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.uid}`
              }
              alt={userProfile?.nickname || '내 프로필'}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-stone-200 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900">
                  {userProfile?.nickname || currentUser.displayName || '칼럼니스트'}
                </h1>
                {userProfile?.role === 'admin' && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-sans">
                    관리자
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mb-3">{currentUser.email}</p>
              <p className="text-xs sm:text-sm text-stone-700 max-w-xl leading-relaxed mb-4 whitespace-pre-line">
                {userProfile?.bio || '작성된 자기소개가 없습니다.'}
              </p>

              {userProfile?.website && (
                <a
                  href={userProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors mb-2"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{userProfile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {/* Stats Counters */}
              <div className="flex items-center justify-center sm:justify-start gap-6 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <span>
                  작성 칼럼{' '}
                  <strong className="text-stone-900">
                    {myArticles.length + draftArticles.length}
                  </strong>
                  편
                </span>
                <span>
                  팔로워 <strong className="text-stone-900">{userProfile?.followerCount || 0}</strong>명
                </span>
                <span>
                  팔로잉 <strong className="text-stone-900">{userProfile?.followingCount || 0}</strong>명
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" /> 프로필 수정
            </button>
            <Link
              to="/write"
              className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PenSquare className="w-3.5 h-3.5" /> 새 칼럼 쓰기
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div>
        <div className="flex items-center gap-2 border-b border-stone-200 text-xs sm:text-sm font-semibold text-stone-500 overflow-x-auto pb-px">
          <button
            onClick={() => setSearchParams({ tab: 'articles' })}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'articles'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" /> 내 칼럼 ({myArticles.length + draftArticles.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'bookmarks' })}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent hover:text-stone-800'
            }`}
          >
            <BookmarkIcon className="w-4 h-4" /> 북마크한 글 ({bookmarks.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'likes' })}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'likes'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" /> 좋아요한 글 ({likes.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'followed' })}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'followed'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" /> 팔로우한 작가 ({followedAuthors.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="pt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : activeTab === 'articles' ? (
            /* Tab 1: My Articles */
            <div className="space-y-6">
              {/* Sub tabs: Published vs Draft */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setArticleSubTab('published')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    articleSubTab === 'published'
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  발행된 칼럼 ({myArticles.length})
                </button>
                <button
                  onClick={() => setArticleSubTab('draft')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    articleSubTab === 'draft'
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  임시저장 ({draftArticles.length})
                </button>
              </div>

              {articleSubTab === 'published' ? (
                myArticles.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
                    <p className="text-xs text-stone-500 mb-4">아직 발행한 칼럼이 없습니다.</p>
                    <Link
                      to="/write"
                      className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
                    >
                      첫 칼럼 발행하기
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myArticles.map((article) => (
                      <div key={article.id} className="relative group">
                        <ArticleCard article={article} />
                        <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-stone-200 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/articles/${article.id}/edit`}
                            className="p-1.5 hover:bg-stone-100 rounded text-stone-700"
                            title="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTargetId(article.id)}
                            className="p-1.5 hover:bg-red-50 rounded text-red-600"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : draftArticles.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
                  <p className="text-xs text-stone-500">임시저장된 칼럼이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftArticles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white rounded-xl border border-dashed border-stone-300 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                            임시저장
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {article.categoryName}
                          </span>
                        </div>
                        <h4 className="font-serif-kr text-base font-bold text-stone-900 mb-2 line-clamp-2">
                          {article.title || '(제목 없음)'}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 mb-4">
                          {article.subtitle || article.content.substring(0, 80)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <span className="text-[10px] text-stone-400">
                          수정일: {new Date(article.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/articles/${article.id}/edit`}
                            className="px-3 py-1 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800"
                          >
                            이어서 쓰기
                          </Link>
                          <button
                            onClick={() => setDeleteTargetId(article.id)}
                            className="p-1 text-stone-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'bookmarks' ? (
            /* Tab 2: Bookmarks */
            bookmarks.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
                <p className="text-xs text-stone-500 mb-3">아직 북마크한 칼럼이 없습니다.</p>
                <Link
                  to="/articles"
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 inline-block"
                >
                  칼럼 둘러보기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )
          ) : activeTab === 'likes' ? (
            /* Tab 3: Likes */
            likes.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
                <p className="text-xs text-stone-500 mb-3">좋아요를 누른 칼럼이 없습니다.</p>
                <Link
                  to="/articles"
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 inline-block"
                >
                  칼럼 둘러보기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likes.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )
          ) : (
            /* Tab 4: Followed Authors */
            followedAuthors.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
                <p className="text-xs text-stone-500 mb-3">팔로우 중인 작가가 없습니다.</p>
                <Link
                  to="/search?tab=authors"
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 inline-block"
                >
                  칼럼니스트 둘러보기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {followedAuthors.map((author) => (
                  <AuthorCard key={author.uid} author={author} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="font-serif-kr text-lg font-bold text-stone-900 mb-4">
              프로필 정보 수정
            </h3>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">닉네임</label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  프로필 이미지 URL
                </label>
                <input
                  type="text"
                  value={editPhotoURL}
                  onChange={(e) => setEditPhotoURL(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">자기소개</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="칼럼니스트로서의 관심 분야나 이력을 소개해 주세요."
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  개인 웹사이트 / 블로그 (선택)
                </label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://myblog.com"
                  className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 shadow-xs"
                >
                  {updating ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Article Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="칼럼 삭제"
        message="이 칼럼을 완전히 삭제하시겠습니까? 삭제된 칼럼은 복구할 수 없습니다."
        confirmText="삭제하기"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDeleteArticleConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
