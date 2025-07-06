/**
 * Firebase設定の検証とデバッグ
 */

export const validateFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDfy5pArjS3P_SEBE3DcB79oNnsD89Fta8",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "habit-design-lab.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "habit-design-lab",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "habit-design-lab.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "253582894243",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:253582894243:web:c3db9f4028bfbd4642cb16",
  };

  console.log('=== Firebase Config Validation ===');
  console.log('API Key:', config.apiKey.substring(0, 10) + '...');
  console.log('Auth Domain:', config.authDomain);
  console.log('Project ID:', config.projectId);
  console.log('Storage Bucket:', config.storageBucket);
  console.log('App ID:', config.appId);
  console.log('================================');

  // 設定の妥当性チェック
  const errors = [];
  
  if (!config.apiKey || config.apiKey.length < 20) {
    errors.push('API Keyが正しく設定されていません');
  }
  
  if (!config.authDomain || !config.authDomain.includes('.firebaseapp.com')) {
    errors.push('Auth Domainが正しく設定されていません');
  }
  
  if (!config.projectId) {
    errors.push('Project IDが設定されていません');
  }
  
  if (errors.length > 0) {
    console.error('Firebase設定エラー:', errors);
    throw new Error('Firebase設定が正しくありません: ' + errors.join(', '));
  }

  return config;
};