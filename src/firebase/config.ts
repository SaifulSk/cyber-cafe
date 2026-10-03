import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyAMQyehh9uyltrkNHcMF--8waIRiKCfIII",
  authDomain: "cyber-cafe-83f78.firebaseapp.com",
  projectId: "cyber-cafe-83f78",
  storageBucket: "cyber-cafe-83f78.firebasestorage.app",
  messagingSenderId: "179774010896",
  appId: "1:179774010896:web:f286ca1c944229d009fc95",
  measurementId: "G-DSM9PD2Y3S"
};

// Initialize Firebase (singleton pattern)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics init
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics fallback / ignore in restricted environments
  });
}
