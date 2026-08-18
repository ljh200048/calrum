import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, FileText } from 'lucide-react';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { isFollowing, toggleFollow } from '../../services/followService';

interface AuthorCardProps {
  author: UserProfile;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(author.followerCount || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFollow = async () => {
      if (currentUser && currentUser.uid !== author.uid) {
        const res = await isFollowing(currentUser.uid, author.uid);
        setFollowing(res);
      }
    };
    checkFollow();
  }, [currentUser, author.uid]);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.uid === author.uid) return;

    setLoading(true);
    try {
      const res = await toggleFollow(currentUser.uid, author.uid);
      setFollowing(res.following);
      setFollowers((prev) => (res.following ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSelf = currentUser?.uid === author.uid;

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-5 hover:border-stone-400 transition-all shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link to={`/author/${author.uid}`} className="flex items-center gap-3 group">
            <img
              src={
                author.photoURL ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${author.uid}`
              }
              alt={author.nickname}
              className="w-12 h-12 rounded-full object-cover border border-stone-300 group-hover:ring-2 group-hover:ring-stone-900 transition-all"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h4 className="font-serif-kr text-base font-bold text-stone-900 group-hover:text-stone-700 transition-colors">
                {author.nickname}
              </h4>
              <span className="text-[11px] text-stone-500 font-sans">
                {author.role === 'admin'
                  ? '수석 에디터'
                  : author.role === 'editor'
                  ? '전문 칼럼니스트'
                  : '칼럼니스트'}
              </span>
            </div>
          </Link>

          {!isSelf && (
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                following
                  ? 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
              title={following ? '언팔로우' : '팔로우'}
            >
              {following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {author.bio || '생각을 나누는 새로운 칼럼니스트입니다.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-stone-400" /> 칼럼 {author.articleCount || 0}편
        </span>
        <span>팔로워 {followers}명</span>
      </div>
    </div>
  );
};
