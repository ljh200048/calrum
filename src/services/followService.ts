import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Follow, UserProfile } from '../types';
import { getUserProfile } from './authService';
import { INITIAL_AUTHORS } from './sampleData';

let cachedPopularAuthors: UserProfile[] | null = null;
let lastAuthorsFetchTime = 0;
const AUTHORS_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  if (!followerId || !followingId || followerId === followingId) return false;
  try {
    const followDocId = `${followerId}_${followingId}`;
    const snap = await getDoc(doc(db, 'follows', followDocId));
    return snap.exists();
  } catch (err) {
    return false;
  }
};

export const toggleFollow = async (
  followerId: string,
  followingId: string
): Promise<{ following: boolean }> => {
  if (followerId === followingId) throw new Error('자신을 팔로우할 수 없습니다.');

  const followDocId = `${followerId}_${followingId}`;
  const followRef = doc(db, 'follows', followDocId);
  const followSnap = await getDoc(followRef);

  const followerUserRef = doc(db, 'users', followerId);
  const followingUserRef = doc(db, 'users', followingId);

  cachedPopularAuthors = null; // Invalidate cache

  if (followSnap.exists()) {
    await deleteDoc(followRef);
    try {
      await updateDoc(followingUserRef, { followerCount: increment(-1) });
      await updateDoc(followerUserRef, { followingCount: increment(-1) });
    } catch {}
    return { following: false };
  } else {
    const followData: Follow = {
      id: followDocId,
      followerId,
      followingId,
      createdAt: Date.now(),
    };
    await setDoc(followRef, followData);
    try {
      await updateDoc(followingUserRef, { followerCount: increment(1) });
      await updateDoc(followerUserRef, { followingCount: increment(1) });
    } catch {}
    return { following: true };
  }
};

export const getFollowedAuthors = async (followerId: string): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', followerId));
    const snap = await getDocs(q);
    const followingIds: string[] = [];
    snap.forEach((d) => {
      followingIds.push(d.data().followingId);
    });

    const authors: UserProfile[] = [];
    for (const uid of followingIds) {
      const profile = await getUserProfile(uid);
      if (profile) authors.push(profile);
    }
    return authors;
  } catch (error) {
    console.warn('Error fetching followed authors:', error);
    return [];
  }
};

export const getPopularAuthors = async (limitCount = 4, forceRefresh = false): Promise<UserProfile[]> => {
  const now = Date.now();
  if (!forceRefresh && cachedPopularAuthors && now - lastAuthorsFetchTime < AUTHORS_CACHE_TTL) {
    return cachedPopularAuthors.slice(0, limitCount);
  }

  try {
    const snap = await getDocs(collection(db, 'users'));
    const authors: UserProfile[] = [];
    snap.forEach((d) => {
      authors.push(d.data() as UserProfile);
    });

    if (authors.length < 2) {
      cachedPopularAuthors = INITIAL_AUTHORS;
      lastAuthorsFetchTime = now;
      return INITIAL_AUTHORS.slice(0, limitCount);
    }

    authors.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
    cachedPopularAuthors = authors;
    lastAuthorsFetchTime = now;
    return authors.slice(0, limitCount);
  } catch (error) {
    console.warn('Error fetching popular authors, using fallback:', error);
    return INITIAL_AUTHORS.slice(0, limitCount);
  }
};
