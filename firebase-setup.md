# Firebase セットアップ手順

## 1. Firebaseコンソールでの設定

### Authentication設定
1. Firebaseコンソール > 構築 > Authentication
2. 「始める」をクリック
3. Sign-in method タブで「Google」を有効化
   - プロジェクトのサポートメールを設定
   - 有効にして保存

### Firestore Database設定
1. Firebaseコンソール > 構築 > Firestore Database
2. 「データベースの作成」をクリック
3. 本番環境モードで開始
4. ロケーション: `asia-northeast1` (東京) を選択
5. セキュリティルールは後で設定

### Cloud Functions設定（任意）
1. Firebaseコンソール > 構築 > Functions
2. 料金プランのアップグレードが必要な場合は後回し

## 2. Firebaseプロジェクトの設定ファイル取得

1. プロジェクトの設定 > 全般
2. 「ウェブアプリを追加」をクリック
3. アプリのニックネーム: `habit-design-lab-web`
4. Firebase Hostingの設定はチェック
5. アプリを登録

生成される設定をコピー:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 3. ローカルプロジェクトへの適用

1. `.env`ファイルを作成して環境変数を設定:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

2. `src/services/firebase.ts`を更新（既に環境変数対応済み）

## 4. Firestoreセキュリティルール設定

Firebaseコンソール > Firestore Database > ルール で以下を設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // プロジェクトは所有者のみアクセス可能
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
        
      // プロジェクト内のサブコレクション
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && 
          request.auth.uid == get(/databases/$(database)/documents/projects/$(projectId)).data.userId;
      }
    }
  }
}
```

## 5. Firebase Hosting設定

```bash
# Firebase CLIのインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトの初期化
firebase init

# 選択項目:
# - Hosting を選択
# - 既存のプロジェクトを使用
# - Public directory: dist
# - Single-page app: Yes
# - GitHub自動デプロイ: 任意
```

## 6. デプロイ

```bash
# ビルド
npm run build

# デプロイ
firebase deploy --only hosting
```

## 完了チェックリスト

- [ ] Firebaseプロジェクト作成
- [ ] Google認証有効化
- [ ] Firestore Database作成
- [ ] Firebase設定をローカルプロジェクトに適用
- [ ] .envファイル作成
- [ ] Firestoreセキュリティルール設定
- [ ] Firebase Hosting初期化
- [ ] 初回デプロイ成功