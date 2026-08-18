import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, FileText, Users, Hash, X } from 'lucide-react';
import { Article, UserProfile } from '../types';
import { getArticles } from '../services/articleService';
import { getAllUsers } from '../services/authService';
import { ArticleCard } from '../components/article/ArticleCard';
import { AuthorCard } from '../components/author/AuthorCard';
import { SkeletonCard } from '../components/common/Loading';

import { INITIAL_ARTICLES, INITIAL_AUTHORS } from '../services/sampleData';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentTab = searchParams.get('tab') || 'articles';

  const [inputVal, setInputVal] = useState(query);
  const [articles, setArticles] = useState<Article[]>(() => INITIAL_ARTICLES);
  const [authors, setAuthors] = useState<UserProfile[]>(() => INITIAL_AUTHORS);
  const [loading, setLoading] = useState(false);

  const executeSearch = async (term: string) => {
    if (term) setLoading(true);
    try {
      const [allArts, allAuthors] = await Promise.all([
        getArticles({ search: term || undefined, status: 'published' }),
        getAllUsers(50),
      ]);

      if (allArts) setArticles(allArts);

      if (term) {
        const lower = term.toLowerCase();
        setAuthors(
          allAuthors.filter(
            (u) =>
              u.nickname.toLowerCase().includes(lower) ||
              (u.bio && u.bio.toLowerCase().includes(lower))
          )
        );
      } else {
        setAuthors(allAuthors);
      }
    } catch (err) {
      console.warn('Search note:', err);
    } finally {
      if (term) setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(query);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (inputVal.trim()) {
      next.set('q', inputVal.trim());
    } else {
      next.delete('q');
    }
    setSearchParams(next);
  };

  const setTab = (t: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', t);
    setSearchParams(next);
  };

  // Collect unique tags from articles
  const tagCounts: { [key: string]: number } = {};
  articles.forEach((a) => {
    (a.tags || []).forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  const matchingTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .filter((t) => !query || t.tag.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Search Header Banner */}
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
        <h1 className="font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          칼럼 및 작가 통합 검색
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mb-6">
          궁금한 키워드, 관심 분야의 주제어, 또는 작가의 이름을 검색해 보세요.
        </p>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="예: 인공지능, 도시 산책, 경제 전망, 이소연..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors shrink-0 shadow-xs"
          >
            검색
          </button>
        </form>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-xs sm:text-sm font-semibold text-stone-500">
        <button
          onClick={() => setTab('articles')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            currentTab === 'articles'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" /> 칼럼 ({articles.length})
        </button>
        <button
          onClick={() => setTab('authors')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            currentTab === 'authors'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <Users className="w-4 h-4" /> 작가 ({authors.length})
        </button>
        <button
          onClick={() => setTab('tags')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            currentTab === 'tags'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <Hash className="w-4 h-4" /> 연관 태그 ({matchingTags.length})
        </button>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : currentTab === 'articles' ? (
        articles.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl border border-stone-200 text-center">
            <p className="text-sm font-bold text-stone-800 mb-1">
              "{query}"에 대한 검색 결과가 없습니다.
            </p>
            <p className="text-xs text-stone-500">
              단어의 철자가 정확한지 확인하거나 다른 키워드로 검색해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )
      ) : currentTab === 'authors' ? (
        authors.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl border border-stone-200 text-center">
            <p className="text-sm font-bold text-stone-800 mb-1">
              일치하는 작가를 찾을 수 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {authors.map((author) => (
              <AuthorCard key={author.uid} author={author} />
            ))}
          </div>
        )
      ) : (
        /* Tags Tab */
        matchingTags.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl border border-stone-200 text-center">
            <p className="text-sm font-bold text-stone-800 mb-1">
              관련 태그가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {matchingTags.map(({ tag, count }) => (
              <Link
                key={tag}
                to={`/articles?tag=${encodeURIComponent(tag)}`}
                className="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <span className="font-semibold text-stone-800 group-hover:text-stone-900 text-xs">
                  #{tag}
                </span>
                <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                  {count}편
                </span>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};
