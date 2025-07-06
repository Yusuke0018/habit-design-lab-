/**
 * @file Firebase設定・初期化
 * @description Firebase関連の設定と初期化処理
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.2 使用技術
 * 関連クラス: AuthService, ProjectService, HabitElementService
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase設定
// 注意: 本番環境では環境変数が使えないため、直接設定を記述
// これらは公開APIキーなので、Firebaseのセキュリティルールで保護されています
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDfy5pArjS3P_SEBE3DcB79oNnsD89Fta8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "habit-design-lab.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "habit-design-lab",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "habit-design-lab.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "253582894243",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:253582894243:web:c3db9f4028bfbd4642cb16",
};

// Firebase設定のデバッグ
console.log('Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? 'SET' : 'NOT SET',
  authDomain: firebaseConfig.authDomain || 'NOT SET',
  projectId: firebaseConfig.projectId || 'NOT SET',
});

// Firebaseアプリの初期化
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Firebase サービスのエクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;