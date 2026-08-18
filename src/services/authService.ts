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
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { UserProfile, UserRole } from '../types';
import { ADMIN_EMAILS } from '../config/constants';
import { INITIAL_AUTHORS } from './sampleData';

export const isUserAdmin = (email?: string | null, role?: string | null): boolean => {
  if (email && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase())) {
    return true;
  }
  return role === 'admin';
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    // Check sample authors fallback
    const sample = INITIAL_AUTHORS.find((a) => a.uid === uid);
    if (sample) return sample;

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    const sample = INITIAL_AUTHORS.find((a) => a.uid === uid);
    if (sample) return sample;
    return null;
  }
};

export const registerWithEmail = async (
  email: string,
  pass: string,
  nickname: string,
  bio?: string,
  photoURL?: string
): Promise<UserProfile> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  const defaultPhoto =
    photoURL ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(nickname || email)}`;

  await updateFirebaseProfile(user, {
    displayName: nickname,
    photoURL: defaultPhoto,
  });

  const isAdmin = isUserAdmin(email);
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    nickname: nickname || email.split('@')[0],
    photoURL: defaultPhoto,
    bio: bio || '생각을 나누는 새로운 칼럼니스트입니다.',
    role: isAdmin ? 'admin' : 'user',
    createdAt: Date.now(),
    followerCount: 0,
    followingCount: 0,
    articleCount: 0,
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);
  return userProfile;
};

export const loginWithEmail = async (email: string, pass: string): Promise<UserProfile | null> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const profile = await getUserProfile(userCredential.user.uid);
  return profile;
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
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
      bio: '새롭게 글결에 합류한 칼럼니스트입니다.',
      role: isAdmin ? 'admin' : 'user',
      createdAt: Date.now(),
      followerCount: 0,
      followingCount: 0,
      articleCount: 0,
    };
    await setDoc(doc(db, 'users', user.uid), profile);
  }

  return profile;
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const updateUserProfileData = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, data);

  if (auth.currentUser && auth.currentUser.uid === uid) {
    if (data.nickname || data.photoURL) {
      await updateFirebaseProfile(auth.currentUser, {
        displayName: data.nickname || auth.currentUser.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL,
      });
    }
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
    console.error('Error fetching users:', error);
    return INITIAL_AUTHORS;
  }
};

export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
};
