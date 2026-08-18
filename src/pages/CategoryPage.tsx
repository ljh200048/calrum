import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Layers, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Article, Category } from '../types';
import { getArticles } from '../services/articleService';
import { getCategories } from '../services/categoryService';
import { ArticleCard } from '../components/article/ArticleCard';
import { SkeletonCard } from '../components/common/Loading';

import { INITIAL_ARTICLES } from '../services/sampleData';
import { DEFAULT_CATEGORIES } from '../config/constants';

export const CategoryPage: React.FC = () => {
  const { category: categoryId } = useParams<{ category: string }>();
  const initialCategory = DEFAULT_CATEGORIES.find((c) => c.id === categoryId) || null;
  const initialArticles = categoryId && categoryId !== 'all'
    ? INITIAL_ARTICLES.filter((a) => a.categoryId === categoryId)
    : INITIAL_ARTICLES;

  const [categories, setCategories] = useState<Category[]>(() => DEFAULT_CATEGORIES);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(initialCategory);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<'latest' | 'popular' | 'views'>('latest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await getCategories();
        if (cats && cats.length > 0) setCategories(cats);

        if (categoryId && categoryId !== 'all') {
          const match = cats.find((c) => c.id === categoryId);
          setCurrentCategory(
            match || {
              id: categoryId,
              name: categoryId,
              description: `${categoryId} 관련 칼럼`,
              order: 99,
            }
          );

          const arts = await getArticles({
            category: categoryId,
            sort,
            status: 'published',
          });
          if (arts) setArticles(arts);
        } else {
          setCurrentCategory(null);
          const arts = await getArticles({
            sort,
            status: 'published',
          });
          if (arts) setArticles(arts);
        }
      } catch (err) {
        console.warn('Failed to load category data:', err);
      }
    };

    fetchData();
  }, [categoryId, sort]);

  const isAll = !categoryId || categoryId === 'all';

  return (
    <div className="space-y-10 pb-16">
      {/* Category Header */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 text-stone-500 text-xs mb-2">
          <Layers className="w-4 h-4" />
          <span>카테고리 탐색</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif-kr text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
              {isAll ? '모든 주제별 칼럼' : currentCategory?.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              {isAll
                ? '사회의 다양한 분야에서 깊은 통찰을 제공하는 칼럼 아카이브입니다.'
                : currentCategory?.description}
            </p>
          </div>
          {!isAll && currentCategory && (
            <Link
              to={`/write?category=${currentCategory.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shrink-0 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentCategory.name} 칼럼 작성</span>
            </Link>
          )}
        </div>

        {/* Category switcher pills */}
        <div className="flex items-center gap-2 flex-wrap pt-6 mt-6 border-t border-stone-100 text-xs">
          <Link
            to="/category/all"
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
              isAll
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            전체 분야
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                categoryId === cat.id
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-stone-700">
          총 <span className="text-stone-900">{articles.length}</span>편의 칼럼
        </p>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="text-xs font-medium bg-transparent border-0 focus:ring-0 text-stone-800 cursor-pointer"
          >
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
            <option value="views">조회수순</option>
          </select>
        </div>
      </div>

      {/* Article Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-stone-200 text-center">
          <p className="text-sm font-bold text-stone-800 mb-1">
            아직 이 카테고리에 등록된 칼럼이 없습니다.
          </p>
          <p className="text-xs text-stone-500 mb-6">
            이 주제의 첫 번째 칼럼니스트가 되어 생각을 나누어보세요.
          </p>
          <Link
            to="/write"
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            칼럼 작성하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};
