import { initializeApp, getApps, getApp } from 'firebase/app';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Prefer the VITE_FIREBASE_* values from .env (your own Firebase project); fall back to
// firebase-applet-config.json only when they aren't set, so the two projects never get mixed.
const env = (import.meta as any).env || {};
const useEnvConfig = Boolean(env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = useEnvConfig
  ? {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    }
  : {
      apiKey: firebaseConfigRaw.apiKey,
      authDomain: firebaseConfigRaw.authDomain,
      projectId: firebaseConfigRaw.projectId,
      storageBucket: firebaseConfigRaw.storageBucket,
      messagingSenderId: firebaseConfigRaw.messagingSenderId,
      appId: firebaseConfigRaw.appId,
    };

// Empty / "(default)" means the project's default Firestore database
const firestoreDatabaseId: string = useEnvConfig
  ? env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || ''
  : firebaseConfigRaw.firestoreDatabaseId;

if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
  console.error(
    `[Firebase] apiKey/appId missing for project "${firebaseConfig.projectId}". ` +
      'Copy the Web app config from Firebase Console → Project settings into firebase-applet-config.json (or .env).'
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if specified
export const db =
  firestoreDatabaseId && firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firestoreDatabaseId)
    : getFirestore(app);

export const isNativeApp = Capacitor.isNativePlatform();

// Google Sign-In: popup on web; on Android the native Google account picker supplies an ID token
// that the Firebase JS SDK exchanges for a session (plugin runs with skipNativeAuth: true).
export async function signInWithGoogle(): Promise<UserCredential> {
  if (!isNativeApp) {
    return signInWithPopup(auth, googleProvider);
  }
  const result = await FirebaseAuthentication.signInWithGoogle();
  const idToken = result.credential?.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In did not return an ID token.');
  }
  return signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
}

export async function signOut(): Promise<void> {
  if (isNativeApp) {
    // Clears the native Google session so the account picker shows again next time
    await FirebaseAuthentication.signOut().catch(() => undefined);
  }
  await firebaseSignOut(auth);
}

// Test Firestore connection on boot as specified in the Firebase skill
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
    return false;
  }
}

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
};

export type { FirebaseUser };
export default app;
