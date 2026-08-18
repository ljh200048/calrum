import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Feather,
  RefreshCw,
} from 'lucide-react';
import { Article, Category, UserProfile } from '../types';
import { getArticles, seedSampleArticles } from '../services/articleService';
import { getCategories } from '../services/categoryService';
import { getPopularAuthors } from '../services/followService';
import { HeroArticle } from '../components/article/HeroArticle';
import { ArticleCard } from '../components/article/ArticleCard';
import { ArticleCardCompact } from '../components/article/ArticleCardCompact';
import { AuthorCard } from '../components/author/AuthorCard';
import { SkeletonCard } from '../components/common/Loading';

export const Home: React.FC = () => {
  const [heroArticle, setHeroArticle] = useState<Article | null>(null);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularAuthors, setPopularAuthors] = useState<UserProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allArticles, cats, authors] = await Promise.all([
        getArticles({ status: 'published' }),
        getCategories(),
        getPopularAuthors(4),
      ]);

      setCategories(cats);
      setPopularAuthors(authors);

      if (allArticles.length > 0) {
        const featured = allArticles.find((a) => a.isFeatured) || allArticles[0];
        setHeroArticle(featured);

        // Sort for popular
        const sortedPopular = [...allArticles].sort((a, b) => {
          const scoreA = (a.viewCount || 0) + (a.likeCount || 0) * 5;
          const scoreB = (b.viewCount || 0) + (b.likeCount || 0) * 5;
          return scoreB - scoreA;
        });
        setPopularArticles(sortedPopular.slice(0, 5));
        setLatestArticles(allArticles);
      }
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedSampleArticles();
      await loadData();
      alert('샘플 칼럼 데이터가 Firestore에 성공적으로 생성되었습니다.');
    } catch (err) {
      console.error('Seed error:', err);
      alert('샘플 데이터 생성 중 문제가 발생했습니다.');
    } finally {
      setSeeding(false);
    }
  };

  const filteredLatest =
    selectedCategory === 'all'
      ? latestArticles.slice(0, 6)
      : latestArticles.filter((a) => a.categoryId === selectedCategory).slice(0, 6);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="pt-2">
        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 h-96 animate-pulse" />
        ) : heroArticle ? (
          <HeroArticle article={heroArticle} />
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-stone-200 text-center">
            <h2 className="font-serif-kr text-2xl font-bold mb-2">아직 발행된 칼럼이 없습니다</h2>
            <p className="text-xs text-stone-500 mb-6">
              첫 번째 칼럼니스트가 되어 생각을 기록하거나 샘플 데이터를 불러와보세요.
            </p>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              샘플 칼럼 데이터 초기화
            </button>
          </div>
        )}
      </section>

      {/* 2. Popular & Trending Columns Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-stone-900" />
            <h2 className="font-serif-kr text-xl sm:text-2xl font-bold text-stone-900">
              실시간 인기 칼럼
            </h2>
          </div>
          <Link
            to="/articles?sort=popular"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            더보기 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Top 1 Popular Featured card */}
            {popularArticles[0] && (
              <div className="lg:col-span-6">
                <ArticleCard article={popularArticles[0]} />
              </div>
            )}

            {/* Ranked 2-5 Compact List */}
            <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="divide-y divide-stone-100">
                {popularArticles.slice(1, 5).map((article, idx) => (
                  <ArticleCardCompact
                    key={article.id}
                    article={article}
                    rank={idx + 2}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Category Carousel / Grid */}
      <section className="bg-stone-100/70 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 rounded-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif-kr text-xl font-bold text-stone-900">
                주제별 칼럼 탐색
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">관심 있는 분야의 깊이 있는 사유를 만나보세요</p>
            </div>
            <Link
              to="/category/all"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              전체 보기 →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="bg-white p-4 rounded-xl border border-stone-200/80 hover:border-stone-400 hover:shadow-xs transition-all text-left group"
              >
                <span className="text-xs font-bold text-stone-900 group-hover:text-stone-700 block mb-1">
                  {cat.name}
                </span>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Latest Columns with Category Tab Filters */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-stone-900" />
            <h2 className="font-serif-kr text-xl sm:text-2xl font-bold text-stone-900">
              최신 칼럼
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              전체
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredLatest.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-stone-200 text-center">
            <p className="text-xs text-stone-500 mb-2">선택한 카테고리에 등록된 칼럼이 없습니다.</p>
            <Link
              to="/write"
              className="text-xs font-semibold text-stone-900 underline underline-offset-4"
            >
              이 분야의 첫 번째 칼럼 쓰기 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLatest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/articles"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-2xs"
          >
            칼럼 전체 아카이브 둘러보기
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 5. Popular Columnists Section */}
      <section className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-900" />
            <h2 className="font-serif-kr text-xl sm:text-2xl font-bold text-stone-900">
              주목받는 칼럼니스트
            </h2>
          </div>
          <Link
            to="/search?tab=authors"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            작가 더보기 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularAuthors.map((author) => (
            <AuthorCard key={author.uid} author={author} />
          ))}
        </div>
      </section>

      {/* 6. Become a Columnist CTA */}
      <section className="bg-stone-900 text-white rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden shadow-md">
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-300 bg-stone-800 px-3 py-1 rounded-full">
            <Feather className="w-3 h-3" /> 누구나 칼럼니스트가 될 수 있습니다
          </span>
          <h2 className="font-serif-kr text-2xl sm:text-3xl font-bold leading-snug">
            당신의 고유한 시선과 통찰을<br />세상과 나누어보세요
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg mx-auto">
            일상의 사소한 발견부터 사회를 향한 날카로운 제언까지. 글결은 진솔한 생각의 힘을 믿습니다.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/write"
              className="px-6 py-3 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-bold transition-colors shadow-xs w-full sm:w-auto"
            >
              지금 칼럼 작성하기
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-colors w-full sm:w-auto"
            >
              무료 회원가입
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
