// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWC5KiiLxV0uBe6wKN4y8KZR08_0inzLE",
  authDomain: "kisan-marg-19c0a.firebaseapp.com",
  projectId: "kisan-marg-19c0a",
  storageBucket: "kisan-marg-19c0a.firebasestorage.app",
  messagingSenderId: "1056722606187",
  appId: "1:1056722606187:web:1a48a7263272e2f5cf792e"
};

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
