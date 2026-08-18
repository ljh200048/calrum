import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Heart, ArrowRight } from 'lucide-react';
import { Article } from '../../types';
import { formatDate } from './ArticleCard';

interface HeroArticleProps {
  article: Article;
}

export const HeroArticle: React.FC<HeroArticleProps> = ({ article }) => {
  return (
    <div className="relative bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Cover Image Col */}
        <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto lg:h-[480px] relative bg-stone-100 overflow-hidden">
          <img
            src={
              article.coverImage ||
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
            }
            alt={article.title}
            className="w-full h-full object-cover"
            decoding="async"
            loading="eager"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-900/90 text-stone-100 backdrop-blur-md">
              ★ 에디터 추천 칼럼
            </span>
          </div>
        </div>

        {/* Text Details Col */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link
                to={`/category/${article.categoryId}`}
                className="text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded transition-colors"
              >
                {article.categoryName}
              </Link>
              {article.readTimeMinutes && (
                <span className="text-xs text-stone-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-600" />
                  {article.readTimeMinutes}분 분량
                </span>
              )}
            </div>

            <Link to={`/articles/${article.id}`} className="block group">
              <h2 className="font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900 leading-snug mb-3 group-hover:text-stone-700 transition-colors">
                {article.title}
              </h2>
              {article.subtitle && (
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6 line-clamp-3">
                  {article.subtitle}
                </p>
              )}
            </Link>
          </div>

          <div className="pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-4">
              <Link
                to={`/author/${article.authorId}`}
                className="flex items-center gap-3 hover:text-stone-900"
              >
                <img
                  src={
                    article.authorPhotoURL ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${article.authorId}`
                  }
                  alt={article.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-stone-300"
                />
                <div>
                  <h4 className="font-bold text-xs text-stone-900">{article.authorName}</h4>
                  <p className="text-[11px] text-stone-600">{formatDate(article.createdAt)}</p>
                </div>
              </Link>

              <div className="flex items-center gap-3 text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-stone-600" /> {article.viewCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-stone-600" /> {article.likeCount || 0}
                </span>
              </div>
            </div>

            <Link
              to={`/articles/${article.id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-900 text-stone-50 font-semibold text-xs hover:bg-stone-800 transition-all shadow-xs"
            >
              <span>칼럼 전문 읽기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
