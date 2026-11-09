import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDWC5KiiLxV0uBe6wKN4y8KZR08_0inzLE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kisan-marg-19c0a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kisan-marg-19c0a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kisan-marg-19c0a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1056722606187',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1056722606187:web:1a48a7263272e2f5cf792e',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
