import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Comment, UserProfile } from '../types';

export const getComments = async (articleId: string): Promise<Comment[]> => {
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
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
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
    console.error('Error fetching all comments:', error);
    return [];
  }
};
