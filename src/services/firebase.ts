import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Read Firebase configurations from Vite environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || '';
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '';

const firebaseConfig = {
  apiKey: apiKey || 'dummy-api-key-for-build',
  authDomain: authDomain || 'dummy-project.firebaseapp.com',
  projectId: projectId || 'dummy-project',
  storageBucket: storageBucket || 'dummy-project.firebasestorage.app',
  messagingSenderId: messagingSenderId || '000000000000',
  appId: appId || '1:000000000000:web:0000000000000000000000',
};

// Check if environment variables are set
export const isFirebaseConfigured = Boolean(apiKey && projectId);

if (!isFirebaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '⚠️ [Firebase] Firebase 환경변수가 설정되지 않았습니다.\n' +
    '로컬 개발 환경에서는 .env 파일에, Netlify 배포 환경에서는 Site configuration -> Environment variables에\n' +
    'VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID 등을 등록해주세요.\n' +
    '안내 문서: NETLIFY_FIREBASE_SETUP.md를 참조하세요.'
  );
}

// Initialize or reuse Firebase App
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
let firestoreInstance: Firestore;
try {
  firestoreInstance =
    firestoreDatabaseId && firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firestoreDatabaseId)
      : getFirestore(app);
} catch {
  firestoreInstance = getFirestore(app);
}
export const db: Firestore = firestoreInstance;

// Initialize Storage
let storageInstance: FirebaseStorage;
try {
  storageInstance = getStorage(app);
} catch {
  // Graceful fallback for non-storage environments
  storageInstance = {} as FirebaseStorage;
}
export const storage: FirebaseStorage = storageInstance;

export default app;
