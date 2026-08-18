import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../config/constants';

// Fast In-Memory Cache
let cachedCategories: Category[] | null = null;
let lastCategoryFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export const getCategories = async (forceRefresh = false): Promise<Category[]> => {
  const now = Date.now();
  if (!forceRefresh && cachedCategories && now - lastCategoryFetchTime < CACHE_TTL) {
    return cachedCategories;
  }

  try {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const list: Category[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<Category, 'id'>) });
      });
      cachedCategories = list;
      lastCategoryFetchTime = now;
      return list;
    }

    cachedCategories = DEFAULT_CATEGORIES;
    lastCategoryFetchTime = now;
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.warn('Error fetching categories, using cache/defaults:', error);
    if (!cachedCategories) {
      cachedCategories = DEFAULT_CATEGORIES;
    }
    return cachedCategories;
  }
};

export const addCategory = async (name: string, description: string, order = 99): Promise<Category> => {
  const id = name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-') || `cat_${Date.now()}`;
  const newCat: Category = {
    id,
    name,
    description,
    order,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'categories', id), newCat);
  cachedCategories = null; // Invalidate cache
  return newCat;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<void> => {
  const catRef = doc(db, 'categories', id);
  await updateDoc(catRef, data);
  cachedCategories = null; // Invalidate cache
};

export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'categories', id));
  cachedCategories = null; // Invalidate cache
};

export const seedDefaultCategories = async (): Promise<void> => {
  for (const cat of DEFAULT_CATEGORIES) {
    await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
  }
  cachedCategories = null; // Invalidate cache
};
