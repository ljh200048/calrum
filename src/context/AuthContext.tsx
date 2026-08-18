import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserProfile } from '../types';
import {
  getUserProfile,
  isUserAdmin,
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
  resetPassword,
  updateUserProfileData,
} from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile | null>;
  loginGoogle: () => Promise<UserProfile>;
  signup: (email: string, pass: string, nickname: string, bio?: string, photoURL?: string) => Promise<UserProfile>;
  signout: () => Promise<void>;
  resetPass: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user: User | null) => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        // Enforce admin if email is in ADMIN_EMAILS
        const adminCheck = isUserAdmin(user.email, profile.role);
        if (adminCheck && profile.role !== 'admin') {
          profile.role = 'admin';
        }
        setUserProfile(profile);
      } else {
        // Fallback user profile
        const adminCheck = isUserAdmin(user.email);
        const fallback: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          nickname: user.displayName || user.email?.split('@')[0] || '칼럼니스트',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.uid}`,
          bio: '생각을 기록하는 칼럼니스트입니다.',
          role: adminCheck ? 'admin' : 'user',
          createdAt: Date.now(),
          followerCount: 0,
          followingCount: 0,
          articleCount: 0,
        };
        setUserProfile(fallback);
      }
    } catch (err) {
      console.error('Failed to fetch user profile in context:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await fetchProfile(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    const profile = await loginWithEmail(email, pass);
    if (profile) setUserProfile(profile);
    return profile;
  };

  const handleLoginGoogle = async () => {
    const profile = await loginWithGoogle();
    setUserProfile(profile);
    return profile;
  };

  const handleSignup = async (
    email: string,
    pass: string,
    nickname: string,
    bio?: string,
    photoURL?: string
  ) => {
    const profile = await registerWithEmail(email, pass, nickname, bio, photoURL);
    setUserProfile(profile);
    return profile;
  };

  const handleSignout = async () => {
    await logout();
    setUserProfile(null);
    setCurrentUser(null);
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('로그인이 필요합니다.');
    await updateUserProfileData(currentUser.uid, data);
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const isAdmin = Boolean(
    currentUser &&
      (isUserAdmin(currentUser.email, userProfile?.role) || userProfile?.role === 'admin')
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        login: handleLogin,
        loginGoogle: handleLoginGoogle,
        signup: handleSignup,
        signout: handleSignout,
        resetPass: resetPassword,
        updateProfile: handleUpdateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
