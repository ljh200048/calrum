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

export const getCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const list: Category[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<Category, 'id'>) });
      });
      return list;
    }

    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error fetching categories, using defaults:', error);
    return DEFAULT_CATEGORIES;
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
  return newCat;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<void> => {
  const catRef = doc(db, 'categories', id);
  await updateDoc(catRef, data);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'categories', id));
};

export const seedDefaultCategories = async (): Promise<void> => {
  for (const cat of DEFAULT_CATEGORIES) {
    await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
  }
};
