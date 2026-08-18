import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  UserCheck,
  Globe,
  FileText,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { Article, UserProfile } from '../types';
import { getUserProfile } from '../services/authService';
import { getArticles } from '../services/articleService';
import { isFollowing, toggleFollow } from '../services/followService';
import { useAuth } from '../context/AuthContext';
import { ArticleCard } from '../components/article/ArticleCard';
import { SkeletonCard, LoadingSpinner } from '../components/common/Loading';

import { INITIAL_ARTICLES, INITIAL_AUTHORS } from '../services/sampleData';

export const AuthorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const cachedAuthor = id ? INITIAL_AUTHORS.find((a) => a.uid === id) || null : null;
  const cachedArts = id ? INITIAL_ARTICLES.filter((a) => a.authorId === id) : [];

  const [author, setAuthor] = useState<UserProfile | null>(cachedAuthor);
  const [articles, setArticles] = useState<Article[]>(cachedArts);
  const [loading, setLoading] = useState(cachedAuthor ? false : true);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(cachedAuthor?.followerCount || 0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAuthorData = async () => {
      try {
        const [profile, arts] = await Promise.all([
          getUserProfile(id),
          getArticles({ authorId: id, status: 'published' }),
        ]);

        if (profile) {
          setAuthor(profile);
          setFollowers(profile.followerCount || 0);
          document.title = `${profile.nickname} 칼럼니스트 | INSIGHT.`;
        }
        if (arts) setArticles(arts);

        if (currentUser && id && currentUser.uid !== id) {
          isFollowing(currentUser.uid, id).then((isUserFollowing) => {
            setFollowing(isUserFollowing);
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Failed to load author page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!id || currentUser.uid === id) return;

    setFollowLoading(true);
    try {
      const res = await toggleFollow(currentUser.uid, id);
      setFollowing(res.following);
      setFollowers((prev) => (res.following ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="작가 프로필을 불러오는 중입니다..." />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center bg-white p-12 rounded-2xl border border-stone-200 shadow-xs">
        <h2 className="font-serif-kr text-2xl font-bold text-stone-900 mb-2">
          작가를 찾을 수 없습니다
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          존재하지 않는 작가이거나 탈퇴한 회원입니다.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
        >
          <ChevronLeft className="w-4 h-4" /> 홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const isSelf = currentUser?.uid === author.uid;

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto">
      {/* Author Profile Header */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img
              src={
                author.photoURL ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${author.uid}`
              }
              alt={author.nickname}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-stone-200 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900">
                  {author.nickname}
                </h1>
                <span className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-sans">
                  {author.role === 'admin'
                    ? '수석 에디터'
                    : author.role === 'editor'
                    ? '전문 칼럼니스트'
                    : '칼럼니스트'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed mb-4 whitespace-pre-line">
                {author.bio || '세상을 향한 날카로운 시선과 사유를 칼럼으로 기록합니다.'}
              </p>

              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors mb-2"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{author.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {/* Stats Bar */}
              <div className="flex items-center justify-center sm:justify-start gap-6 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-stone-400" />
                  칼럼 <strong className="text-stone-900">{articles.length}</strong>편
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-stone-400" />
                  팔로워 <strong className="text-stone-900">{followers}</strong>명
                </span>
                <span>
                  팔로잉 <strong className="text-stone-900">{author.followingCount || 0}</strong>명
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div>
            {isSelf ? (
              <Link
                to="/profile"
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors shadow-2xs block text-center"
              >
                내 프로필 관리
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
                  following
                    ? 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{following ? '팔로잉 중' : '작가 팔로우'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Author's Articles List */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200">
          <h2 className="font-serif-kr text-xl sm:text-2xl font-bold text-stone-900">
            {author.nickname} 작가의 발행 칼럼 ({articles.length})
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
            <p className="text-xs text-stone-500">아직 공개 발행된 칼럼이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
