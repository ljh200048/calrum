import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MessageSquare, Clock } from 'lucide-react';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'horizontal' | 'compact';
}

export const formatDate = (timestamp: number | any): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return '방금 전';
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}일 전`;

  return `${date.getFullYear()}. ${(date.getMonth() + 1).toString().padStart(2, '0')}. ${date.getDate().toString().padStart(2, '0')}`;
};

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'standard' }) => {
  const fallbackCover =
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80';

  if (variant === 'horizontal') {
    return (
      <article className="group bg-white rounded-xl border border-stone-200/80 p-5 hover:border-stone-400 transition-all shadow-xs flex flex-col sm:flex-row gap-5">
        <Link
          to={`/articles/${article.id}`}
          className="sm:w-1/3 aspect-16/10 rounded-lg overflow-hidden shrink-0 bg-stone-100 block"
        >
          <img
            src={article.coverImage || fallbackCover}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to={`/category/${article.categoryId}`}
                className="text-[11px] font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition-colors"
              >
                {article.categoryName}
              </Link>
              {article.readTimeMinutes && (
                <span className="text-[11px] text-stone-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-600" />
                  {article.readTimeMinutes}분 분량
                </span>
              )}
            </div>

            <Link to={`/articles/${article.id}`} className="block group-hover:text-stone-700">
              <h3 className="font-serif-kr text-lg sm:text-xl font-bold text-stone-900 leading-snug line-clamp-2 mb-1.5">
                {article.title}
              </h3>
              {article.subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-3">
                  {article.subtitle}
                </p>
              )}
            </Link>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-600">
            <Link
              to={`/author/${article.authorId}`}
              className="flex items-center gap-2 hover:text-stone-900"
            >
              <img
                src={
                  article.authorPhotoURL ||
                  `https://api.dicebear.com/7.x/notionists/svg?seed=${article.authorId}`
                }
                alt={article.authorName}
                className="w-6 h-6 rounded-full object-cover border border-stone-300"
              />
              <span className="font-medium text-stone-800">{article.authorName}</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-500">{formatDate(article.createdAt)}</span>
            </Link>

            <div className="flex items-center gap-3 text-stone-600 text-[11px]">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-stone-600" />
                {article.viewCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-stone-600" />
                {article.likeCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                {article.commentCount || 0}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-xl border border-stone-200/80 p-5 hover:border-stone-400 transition-all shadow-xs flex flex-col justify-between h-full">
      <div>
        <Link
          to={`/articles/${article.id}`}
          className="aspect-16/10 w-full rounded-lg overflow-hidden mb-4 bg-stone-100 block"
        >
          <img
            src={article.coverImage || fallbackCover}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="flex items-center gap-2 mb-2.5">
          <Link
            to={`/category/${article.categoryId}`}
            className="text-[11px] font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition-colors"
          >
            {article.categoryName}
          </Link>
          {article.readTimeMinutes && (
            <span className="text-[11px] text-stone-600 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-600" />
              {article.readTimeMinutes}분
            </span>
          )}
        </div>

        <Link to={`/articles/${article.id}`} className="block group-hover:text-stone-700">
          <h3 className="font-serif-kr text-lg font-bold text-stone-900 leading-snug line-clamp-2 mb-2">
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
              {article.subtitle}
            </p>
          )}
        </Link>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs text-stone-600 mt-2">
        <Link
          to={`/author/${article.authorId}`}
          className="flex items-center gap-2 hover:text-stone-900"
        >
          <img
            src={
              article.authorPhotoURL ||
              `https://api.dicebear.com/7.x/notionists/svg?seed=${article.authorId}`
            }
            alt={article.authorName}
            className="w-6 h-6 rounded-full object-cover border border-stone-300"
          />
          <span className="font-medium text-stone-800 truncate max-w-[100px]">
            {article.authorName}
          </span>
        </Link>

        <div className="flex items-center gap-2.5 text-stone-600 text-[11px]">
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3 text-stone-600" />
            {article.viewCount || 0}
          </span>
          <span className="flex items-center gap-0.5">
            <Heart className="w-3 h-3 text-stone-600" />
            {article.likeCount || 0}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare className="w-3 h-3 text-stone-600" />
            {article.commentCount || 0}
          </span>
        </div>
      </div>
    </article>
  );
};
