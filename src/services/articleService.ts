import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Article, ArticleFilters, Bookmark, Like } from '../types';
import { INITIAL_ARTICLES } from './sampleData';

// Helper to estimate read time
export const calculateReadTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 180);
  return Math.max(1, minutes);
};

// Local storage keys for deleted and overridden articles (for offline / instant persist support)
const DELETED_ARTICLES_KEY = 'insight_deleted_articles_set';
const ARTICLE_OVERRIDES_KEY = 'insight_article_overrides_map';

const getDeletedArticleIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_ARTICLES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
};

const addDeletedArticleId = (id: string): void => {
  try {
    const set = getDeletedArticleIds();
    set.add(id);
    localStorage.setItem(DELETED_ARTICLES_KEY, JSON.stringify(Array.from(set)));
  } catch {}
};

const getArticleOverrides = (): Record<string, Partial<Article>> => {
  try {
    const raw = localStorage.getItem(ARTICLE_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const setArticleOverride = (id: string, updates: Partial<Article>): void => {
  try {
    const map = getArticleOverrides();
    map[id] = { ...(map[id] || {}), ...updates };
    localStorage.setItem(ARTICLE_OVERRIDES_KEY, JSON.stringify(map));
  } catch {}
};

// In-memory cache for fast article queries
interface CacheEntry {
  data: Article[];
  timestamp: number;
}
const articlesQueryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export const clearArticleCache = () => {
  articlesQueryCache.clear();
};

export const getArticles = async (filters: ArticleFilters = {}, forceRefresh = false): Promise<Article[]> => {
  const cacheKey = JSON.stringify(filters);
  const now = Date.now();

  if (!forceRefresh && articlesQueryCache.has(cacheKey)) {
    const cached = articlesQueryCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const deletedIds = getDeletedArticleIds();
  const overrides = getArticleOverrides();

  try {
    const articlesCol = collection(db, 'articles');
    let q = query(articlesCol);

    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    } else if (!filters.status) {
      q = query(q, where('status', '==', 'published'));
    }

    if (filters.category) {
      q = query(q, where('categoryId', '==', filters.category));
    }

    if (filters.authorId) {
      q = query(q, where('authorId', '==', filters.authorId));
    }

    const snapshot = await getDocs(q);
    let results: Article[] = [];

    snapshot.forEach((d) => {
      if (!deletedIds.has(d.id)) {
        const item = { id: d.id, ...(d.data() as Omit<Article, 'id'>) };
        if (overrides[d.id]) {
          Object.assign(item, overrides[d.id]);
        }
        results.push(item);
      }
    });

    // If firestore is empty or returning few, provide initial sample articles
    if (results.length === 0 && !filters.authorId) {
      results = INITIAL_ARTICLES.filter((a) => !deletedIds.has(a.id)).map((a) => {
        const item = { ...a };
        if (overrides[a.id]) {
          Object.assign(item, overrides[a.id]);
        }
        return item;
      });

      if (filters.category) {
        results = results.filter((a) => a.categoryId === filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        results = results.filter((a) => a.status === filters.status);
      }
    }

    // Apply any local status filtering
    if (filters.status && filters.status !== 'all') {
      results = results.filter((a) => a.status === filters.status);
    } else if (!filters.status) {
      results = results.filter((a) => a.status === 'published');
    }

    // Tag filter
    if (filters.tag) {
      const tagLower = filters.tag.toLowerCase();
      results = results.filter(
        (a) => a.tags && a.tags.some((t) => t.toLowerCase() === tagLower)
      );
    }

    // Search filter in title, subtitle, content, authorName, tags
    if (filters.search && filters.search.trim()) {
      const searchTerms = filters.search.toLowerCase().trim().split(/\s+/);
      results = results.filter((a) => {
        const fullText = `${a.title} ${a.subtitle || ''} ${a.content} ${a.authorName} ${a.categoryName} ${(a.tags || []).join(' ')}`.toLowerCase();
        return searchTerms.every((term) => fullText.includes(term));
      });
    }

    // Featured only filter
    if (filters.featuredOnly) {
      results = results.filter((a) => a.isFeatured);
    }

    // Sorting
    const sort = filters.sort || 'latest';
    results.sort((a, b) => {
      if (sort === 'popular') {
        const scoreA = (a.viewCount || 0) * 1 + (a.likeCount || 0) * 5 + (a.commentCount || 0) * 3;
        const scoreB = (b.viewCount || 0) * 1 + (b.likeCount || 0) * 5 + (b.commentCount || 0) * 3;
        return scoreB - scoreA;
      }
      if (sort === 'views') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (sort === 'likes') {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      if (sort === 'comments') {
        return (b.commentCount || 0) - (a.commentCount || 0);
      }
      // latest default
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    if (filters.limit && filters.limit > 0) {
      results = results.slice(0, filters.limit);
    }

    // Cache the result
    articlesQueryCache.set(cacheKey, { data: results, timestamp: now });

    return results;
  } catch (error) {
    console.warn('Error fetching articles, using fallback cache/samples:', error);
    let fallback = INITIAL_ARTICLES.filter((a) => !deletedIds.has(a.id)).map((a) => {
      const item = { ...a };
      if (overrides[a.id]) {
        Object.assign(item, overrides[a.id]);
      }
      return item;
    });

    if (filters.category) {
      fallback = fallback.filter((a) => a.categoryId === filters.category);
    }
    if (filters.status && filters.status !== 'all') {
      fallback = fallback.filter((a) => a.status === filters.status);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      fallback = fallback.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          a.authorName.toLowerCase().includes(term)
      );
    }
    return fallback;
  }
};

export const getArticleById = async (id: string): Promise<Article | null> => {
  const deletedIds = getDeletedArticleIds();
  if (deletedIds.has(id)) {
    return null;
  }

  const overrides = getArticleOverrides();

  try {
    const articleRef = doc(db, 'articles', id);
    const snap = await getDoc(articleRef);

    if (snap.exists()) {
      const data = { id: snap.id, ...(snap.data() as Omit<Article, 'id'>) };
      if (overrides[id]) {
        Object.assign(data, overrides[id]);
      }
      return data;
    }

    // Check sample articles
    const sample = INITIAL_ARTICLES.find((a) => a.id === id);
    if (sample && !deletedIds.has(sample.id)) {
      const data = { ...sample };
      if (overrides[id]) {
        Object.assign(data, overrides[id]);
      }
      return data;
    }

    return null;
  } catch (error) {
    console.warn('Error fetching article by ID:', error);
    const sample = INITIAL_ARTICLES.find((a) => a.id === id);
    if (sample && !deletedIds.has(sample.id)) {
      const data = { ...sample };
      if (overrides[id]) {
        Object.assign(data, overrides[id]);
      }
      return data;
    }
    return null;
  }
};

export const incrementViewCount = async (articleId: string): Promise<void> => {
  try {
    const viewedKey = `viewed_article_${articleId}`;
    if (sessionStorage.getItem(viewedKey)) {
      return;
    }
    sessionStorage.setItem(viewedKey, 'true');

    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      viewCount: increment(1),
    });
  } catch (error) {
    console.warn('Could not increment view count:', error);
  }
};

export const createArticle = async (
  articleData: Omit<Article, 'id' | 'viewCount' | 'likeCount' | 'commentCount' | 'createdAt' | 'updatedAt' | 'readTimeMinutes'>
): Promise<Article> => {
  const articleId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();
  const readTime = calculateReadTime(articleData.content);

  const newArticle: Article = {
    ...articleData,
    id: articleId,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    readTimeMinutes: readTime,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'articles', articleId), newArticle);
  } catch (err) {
    console.warn('Could not setDoc in Firestore, saving local override:', err);
    setArticleOverride(articleId, newArticle);
  }

  clearArticleCache();

  try {
    const authorRef = doc(db, 'users', articleData.authorId);
    await updateDoc(authorRef, {
      articleCount: increment(1),
    });
  } catch (err) {
    console.warn('Could not update author article count:', err);
  }

  return newArticle;
};

export const updateArticle = async (id: string, data: Partial<Article>): Promise<void> => {
  const updateData: Partial<Article> = {
    ...data,
    updatedAt: Date.now(),
  };

  if (data.content) {
    updateData.readTimeMinutes = calculateReadTime(data.content);
  }

  // Update local overrides immediately for instant sync
  setArticleOverride(id, updateData);
  clearArticleCache();

  try {
    const articleRef = doc(db, 'articles', id);
    await updateDoc(articleRef, updateData);
  } catch (err) {
    console.warn('Could not updateDoc in Firestore, local override applied:', err);
  }
};

export const deleteArticle = async (id: string, authorId?: string): Promise<void> => {
  // Add to deleted IDs set immediately
  addDeletedArticleId(id);
  clearArticleCache();

  try {
    await deleteDoc(doc(db, 'articles', id));
  } catch (err) {
    console.warn('Could not deleteDoc in Firestore, marked as deleted locally:', err);
  }

  if (authorId) {
    try {
      const authorRef = doc(db, 'users', authorId);
      await updateDoc(authorRef, {
        articleCount: increment(-1),
      });
    } catch (err) {
      console.warn('Could not decrement author article count:', err);
    }
  }
};

// Likes System
export const isArticleLiked = async (articleId: string, userId: string): Promise<boolean> => {
  try {
    const likeDocId = `${articleId}_${userId}`;
    const snap = await getDoc(doc(db, 'likes', likeDocId));
    return snap.exists();
  } catch (err) {
    return false;
  }
};

export const toggleLike = async (articleId: string, userId: string): Promise<{ liked: boolean; countDelta: number }> => {
  const likeDocId = `${articleId}_${userId}`;
  const likeRef = doc(db, 'likes', likeDocId);
  const articleRef = doc(db, 'articles', articleId);

  clearArticleCache();

  try {
    const likeSnap = await getDoc(likeRef);
    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      try {
        await updateDoc(articleRef, { likeCount: increment(-1) });
      } catch {}
      return { liked: false, countDelta: -1 };
    } else {
      const likeData: Like = {
        id: likeDocId,
        articleId,
        userId,
        createdAt: Date.now(),
      };
      await setDoc(likeRef, likeData);
      try {
        await updateDoc(articleRef, { likeCount: increment(1) });
      } catch {}
      return { liked: true, countDelta: 1 };
    }
  } catch {
    return { liked: true, countDelta: 1 };
  }
};

// Bookmarks System
export const isArticleBookmarked = async (articleId: string, userId: string): Promise<boolean> => {
  try {
    const bookmarkDocId = `${articleId}_${userId}`;
    const snap = await getDoc(doc(db, 'bookmarks', bookmarkDocId));
    return snap.exists();
  } catch (err) {
    return false;
  }
};

export const toggleBookmark = async (articleId: string, userId: string): Promise<boolean> => {
  const bookmarkDocId = `${articleId}_${userId}`;
  const bookmarkRef = doc(db, 'bookmarks', bookmarkDocId);

  try {
    const bookmarkSnap = await getDoc(bookmarkRef);
    if (bookmarkSnap.exists()) {
      await deleteDoc(bookmarkRef);
      return false;
    } else {
      const bookmarkData: Bookmark = {
        id: bookmarkDocId,
        articleId,
        userId,
        createdAt: Date.now(),
      };
      await setDoc(bookmarkRef, bookmarkData);
      return true;
    }
  } catch {
    return true;
  }
};

export const getUserBookmarkedArticles = async (userId: string): Promise<Article[]> => {
  try {
    const q = query(collection(db, 'bookmarks'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const articleIds: string[] = [];
    snap.forEach((d) => {
      articleIds.push(d.data().articleId);
    });

    if (articleIds.length === 0) return [];

    const articles: Article[] = [];
    for (const aId of articleIds) {
      const art = await getArticleById(aId);
      if (art) articles.push(art);
    }
    return articles;
  } catch (error) {
    console.warn('Error fetching user bookmarks:', error);
    return [];
  }
};

export const getUserLikedArticles = async (userId: string): Promise<Article[]> => {
  try {
    const q = query(collection(db, 'likes'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const articleIds: string[] = [];
    snap.forEach((d) => {
      articleIds.push(d.data().articleId);
    });

    if (articleIds.length === 0) return [];

    const articles: Article[] = [];
    for (const aId of articleIds) {
      const art = await getArticleById(aId);
      if (art) articles.push(art);
    }
    return articles;
  } catch (error) {
    console.warn('Error fetching user likes:', error);
    return [];
  }
};

export const seedSampleArticles = async (): Promise<void> => {
  for (const article of INITIAL_ARTICLES) {
    await setDoc(doc(db, 'articles', article.id), article, { merge: true });
  }
  clearArticleCache();
};
