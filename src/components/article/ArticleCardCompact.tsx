import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { formatDate } from './ArticleCard';

interface ArticleCardCompactProps {
  article: Article;
  rank?: number;
}

export const ArticleCardCompact: React.FC<ArticleCardCompactProps> = ({ article, rank }) => {
  return (
    <div className="flex items-start gap-4 group py-3.5 border-b border-stone-100 last:border-0">
      {rank !== undefined && (
        <span className="font-brand text-2xl font-bold text-stone-300 group-hover:text-stone-900 transition-colors w-6 shrink-0 text-center">
          {rank.toString().padStart(2, '0')}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
            {article.categoryName}
          </span>
          <span className="text-[11px] text-stone-500 truncate">{article.authorName}</span>
        </div>
        <Link to={`/articles/${article.id}`} className="block">
          <h4 className="font-serif-kr text-sm font-bold text-stone-900 group-hover:text-stone-700 leading-snug line-clamp-2 transition-colors">
            {article.title}
          </h4>
        </Link>
        <div className="flex items-center gap-3 text-[10px] text-stone-500 mt-1">
          <span>{formatDate(article.createdAt)}</span>
          <span>·</span>
          <span>조회 {article.viewCount || 0}</span>
          <span>·</span>
          <span>좋아요 {article.likeCount || 0}</span>
        </div>
      </div>
      {article.coverImage && (
        <Link
          to={`/articles/${article.id}`}
          className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100"
        >
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </Link>
      )}
    </div>
  );
};
