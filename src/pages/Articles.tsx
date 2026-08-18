import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { Article, Category } from '../types';
import { getArticles } from '../services/articleService';
import { getCategories } from '../services/categoryService';
import { ArticleCard } from '../components/article/ArticleCard';
import { SkeletonCard } from '../components/common/Loading';

import { INITIAL_ARTICLES } from '../services/sampleData';
import { DEFAULT_CATEGORIES } from '../config/constants';

export const Articles: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>(() => INITIAL_ARTICLES);
  const [categories, setCategories] = useState<Category[]>(() => DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSort = (searchParams.get('sort') as any) || 'latest';
  const selectedTag = searchParams.get('tag') || '';
  const searchKeyword = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchKeyword);

  useEffect(() => {
    const fetchCats = async () => {
      const cats = await getCategories();
      if (cats && cats.length > 0) setCategories(cats);
    };
    fetchCats();
  }, []);

  const loadArticles = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      const data = await getArticles({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        tag: selectedTag || undefined,
        sort: selectedSort,
        search: searchKeyword || undefined,
        status: 'published',
      });
      if (data) setArticles(data);
    } catch (err) {
      console.warn('Failed to load articles:', err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(false);
  }, [selectedCategory, selectedSort, selectedTag, searchKeyword]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedTag || searchKeyword || selectedSort !== 'latest';

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
        <h1 className="font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          칼럼 아카이브
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          다양한 분야의 칼럼니스트들이 전하는 통찰과 이야기를 만나보세요.
        </p>

        {/* Search Input inside Archive */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="제목, 본문 내용, 작가명으로 검색..."
              className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shrink-0"
          >
            검색
          </button>
        </form>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => updateParam('category', 'all')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            전체 분야
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.id)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & View Mode controls */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-xs font-medium bg-transparent border-0 focus:ring-0 text-stone-800 cursor-pointer"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순 (추천)</option>
              <option value="views">조회수순</option>
              <option value="likes">좋아요순</option>
              <option value="comments">댓글 많은순</option>
            </select>
          </div>

          <div className="w-[1px] h-4 bg-stone-200 hidden sm:block" />

          {/* Grid / List toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500'
              }`}
              title="그리드 뷰"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500'
              }`}
              title="리스트 뷰"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-stone-600">
          <span className="font-semibold text-stone-700">적용된 조건:</span>
          {selectedCategory !== 'all' && (
            <span className="bg-stone-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
              카테고리: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
              <button onClick={() => updateParam('category', 'all')}>
                <X className="w-3 h-3 hover:text-stone-900" />
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="bg-stone-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
              태그: #{selectedTag}
              <button onClick={() => updateParam('tag', '')}>
                <X className="w-3 h-3 hover:text-stone-900" />
              </button>
            </span>
          )}
          {searchKeyword && (
            <span className="bg-stone-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
              검색어: "{searchKeyword}"
              <button
                onClick={() => {
                  setSearchInput('');
                  updateParam('search', '');
                }}
              >
                <X className="w-3 h-3 hover:text-stone-900" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-stone-500 hover:text-stone-900 underline text-xs ml-2"
          >
            모든 필터 초기화
          </button>
        </div>
      )}

      {/* Articles Grid or List */}
      {loading ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
          <p className="text-sm font-bold text-stone-800 mb-1">검색 결과가 없습니다.</p>
          <p className="text-xs text-stone-500 mb-6">
            다른 키워드로 검색하거나 필터를 재설정해 보세요.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            전체 목록 보기
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
};
