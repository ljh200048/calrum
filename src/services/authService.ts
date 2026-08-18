import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import { UserProfile, UserRole } from '../types';
import { ADMIN_EMAILS } from '../config/constants';
import { INITIAL_AUTHORS } from './sampleData';

const LOCAL_AUTH_KEY = 'insight_local_user_session';

export const isUserAdmin = (email?: string | null, role?: string | null): boolean => {
  if (email && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase())) {
    return true;
  }
  return role === 'admin';
};

// Local storage session helpers for fallback / offline / demo mode
export const getLocalStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setLocalStoredUser = (profile: UserProfile | null): void => {
  try {
    if (profile) {
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_AUTH_KEY);
    }
  } catch {}
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  // Check local stored user
  const local = getLocalStoredUser();
  if (local && local.uid === uid) {
    return local;
  }

  // Check sample authors fallback
  const sample = INITIAL_AUTHORS.find((a) => a.uid === uid);
  if (sample) return sample;

  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch user profile from Firestore, using fallback:', error);
    return sample || null;
  }
};

export const registerWithEmail = async (
  email: string,
  pass: string,
  nickname: string,
  bio?: string,
  photoURL?: string
): Promise<UserProfile> => {
  const isAdmin = isUserAdmin(email);
  const defaultPhoto =
    photoURL ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(nickname || email)}`;

  let uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    if (isFirebaseConfigured && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      uid = userCredential.user.uid;
      await updateFirebaseProfile(userCredential.user, {
        displayName: nickname,
        photoURL: defaultPhoto,
      });
    }
  } catch (err: any) {
    console.warn('Firebase Auth signup failed, falling back to local session:', err);
    // If it's already in use, re-throw so UI can notify
    if (err.code === 'auth/email-already-in-use') {
      throw err;
    }
  }

  const userProfile: UserProfile = {
    uid,
    email,
    nickname: nickname || email.split('@')[0],
    photoURL: defaultPhoto,
    bio: bio || 'INSIGHT.에서 생각을 기록하는 칼럼니스트입니다.',
    role: isAdmin ? 'admin' : 'user',
    createdAt: Date.now(),
    followerCount: 0,
    followingCount: 0,
    articleCount: 0,
  };

  try {
    await setDoc(doc(db, 'users', uid), userProfile);
  } catch {}

  setLocalStoredUser(userProfile);
  return userProfile;
};

export const loginWithEmail = async (email: string, pass: string): Promise<UserProfile | null> => {
  const cleanEmail = email.trim().toLowerCase();

  // Check matching demo author first
  const demoMatch = INITIAL_AUTHORS.find((a) => a.email.toLowerCase() === cleanEmail);
  if (demoMatch) {
    setLocalStoredUser(demoMatch);
    return demoMatch;
  }

  try {
    if (isFirebaseConfigured && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await getUserProfile(userCredential.user.uid);
      if (profile) {
        setLocalStoredUser(profile);
        return profile;
      }
    }
  } catch (err: any) {
    console.warn('Firebase Auth email login failed:', err);
    // If invalid credentials or user not found, throw to show proper UI message
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      throw err;
    }
  }

  // Graceful fallback for custom email
  const isAdmin = isUserAdmin(email);
  const fallbackProfile: UserProfile = {
    uid: `user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
    email: cleanEmail,
    nickname: cleanEmail.split('@')[0],
    photoURL: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(cleanEmail)}`,
    bio: 'INSIGHT.에서 사유와 통찰을 기록하는 칼럼니스트입니다.',
    role: isAdmin ? 'admin' : 'user',
    createdAt: Date.now(),
    followerCount: 0,
    followingCount: 0,
    articleCount: 0,
  };

  setLocalStoredUser(fallbackProfile);
  return fallbackProfile;
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
  try {
    if (isFirebaseConfigured && auth) {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      let profile = await getUserProfile(user.uid);
      if (!profile) {
        const isAdmin = isUserAdmin(user.email);
        profile = {
          uid: user.uid,
          email: user.email || '',
          nickname: user.displayName || user.email?.split('@')[0] || '익명 칼럼니스트',
          photoURL:
            user.photoURL ||
            `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.displayName || user.uid)}`,
          bio: '새롭게 INSIGHT.에 합류한 칼럼니스트입니다.',
          role: isAdmin ? 'admin' : 'user',
          createdAt: Date.now(),
          followerCount: 0,
          followingCount: 0,
          articleCount: 0,
        };
        try {
          await setDoc(doc(db, 'users', user.uid), profile);
        } catch {}
      }
      setLocalStoredUser(profile);
      return profile;
    }
  } catch (err: any) {
    console.warn('Google popup auth failed (possibly iframe restrictions), providing demo Google session:', err);
    if (err.code === 'auth/popup-closed-by-user') {
      throw err;
    }
  }

  // Google Demo fallback
  const demoGoogleProfile: UserProfile = {
    uid: 'google_user_demo_1',
    email: 'google.member@insight.com',
    nickname: '구글 칼럼니스트',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'INSIGHT.의 다양한 칼럼과 시선을 탐독하는 구독자이자 작가입니다.',
    role: 'user',
    createdAt: Date.now(),
    followerCount: 12,
    followingCount: 5,
    articleCount: 1,
  };
  setLocalStoredUser(demoGoogleProfile);
  return demoGoogleProfile;
};

export const loginWithDemoAccount = (role: 'admin' | 'editor' | 'user'): UserProfile => {
  let profile: UserProfile;

  if (role === 'admin') {
    profile = INITIAL_AUTHORS[0]; // 김지수 수석 에디터 (admin)
  } else if (role === 'editor') {
    profile = INITIAL_AUTHORS[1]; // 박서연 건축 비평가
  } else {
    profile = INITIAL_AUTHORS[2]; // 이현우 테크 칼럼니스트
  }

  setLocalStoredUser(profile);
  return profile;
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
  } catch (err) {
    console.warn('Password reset note:', err);
  }
};

export const logout = async (): Promise<void> => {
  try {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
  } catch {}
  setLocalStoredUser(null);
};

export const updateUserProfileData = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  const current = getLocalStoredUser();
  if (current && current.uid === uid) {
    const updated = { ...current, ...data };
    setLocalStoredUser(updated);
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);

    if (auth?.currentUser && auth.currentUser.uid === uid) {
      if (data.nickname || data.photoURL) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: data.nickname || auth.currentUser.displayName,
          photoURL: data.photoURL || auth.currentUser.photoURL,
        });
      }
    }
  } catch (err) {
    console.warn('Could not update Firestore user doc:', err);
  }
};

export const getAllUsers = async (limitCount = 50): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, 'users'), limit(limitCount));
    const snap = await getDocs(q);
    const users: UserProfile[] = [];
    snap.forEach((docSnap) => {
      users.push(docSnap.data() as UserProfile);
    });

    if (users.length === 0) {
      return INITIAL_AUTHORS;
    }
    return users;
  } catch (error) {
    console.warn('Error fetching users, using defaults:', error);
    return INITIAL_AUTHORS;
  }
};

export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  const current = getLocalStoredUser();
  if (current && current.uid === uid) {
    setLocalStoredUser({ ...current, role });
  }

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
  } catch (err) {
    console.warn('Could not update role in Firestore:', err);
  }
};
