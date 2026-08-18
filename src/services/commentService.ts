import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Comment } from '../types';

const commentsCache = new Map<string, { data: Comment[]; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export const getComments = async (articleId: string, forceRefresh = false): Promise<Comment[]> => {
  const now = Date.now();
  if (!forceRefresh && commentsCache.has(articleId)) {
    const cached = commentsCache.get(articleId)!;
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const q = query(
      collection(db, 'comments'),
      where('articleId', '==', articleId)
    );
    const snap = await getDocs(q);
    const comments: Comment[] = [];
    snap.forEach((d) => {
      comments.push({ id: d.id, ...(d.data() as Omit<Comment, 'id'>) });
    });

    comments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    commentsCache.set(articleId, { data: comments, timestamp: now });
    return comments;
  } catch (error) {
    console.warn('Error fetching comments:', error);
    return commentsCache.get(articleId)?.data || [];
  }
};

export const addComment = async (
  articleId: string,
  user: { uid: string; nickname: string; photoURL?: string },
  content: string
): Promise<Comment> => {
  const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newComment: Comment = {
    id: commentId,
    articleId,
    authorId: user.uid,
    authorName: user.nickname,
    authorPhotoURL: user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.uid}`,
    content: content.trim(),
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'comments', commentId), newComment);
  commentsCache.delete(articleId); // invalidate cache

  try {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      commentCount: increment(1),
    });
  } catch (err) {
    console.warn('Could not increment article commentCount:', err);
  }

  return newComment;
};

export const deleteComment = async (commentId: string, articleId: string): Promise<void> => {
  await deleteDoc(doc(db, 'comments', commentId));
  commentsCache.delete(articleId); // invalidate cache

  try {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      commentCount: increment(-1),
    });
  } catch (err) {
    console.warn('Could not decrement article commentCount:', err);
  }
};

export const getAllComments = async (limitCount = 50): Promise<Comment[]> => {
  try {
    const snap = await getDocs(collection(db, 'comments'));
    const comments: Comment[] = [];
    snap.forEach((d) => {
      comments.push({ id: d.id, ...(d.data() as Omit<Comment, 'id'>) });
    });
    comments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return comments.slice(0, limitCount);
  } catch (error) {
    console.warn('Error fetching all comments:', error);
    return [];
  }
};
