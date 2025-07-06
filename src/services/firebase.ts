/**
 * @file Firebase設定・初期化
 * @description Firebase関連の設定と初期化処理
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.2 使用技術
 * 関連クラス: AuthService, ProjectService, HabitElementService
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { validateFirebaseConfig } from './firebaseConfig';

// Firebase設定を検証して取得
const firebaseConfig = validateFirebaseConfig();

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

// 開発環境でエミュレーターを使用する場合（オプション）
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Firestoreの設定を確認（settingsメソッドは廃止されたため削除）

export default app;