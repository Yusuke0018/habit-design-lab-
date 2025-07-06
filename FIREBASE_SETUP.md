# Firebase Setup Guide

## Firestore接続エラーの解決手順

現在、Firestore接続で400エラーが発生しています。以下の手順で解決してください：

### 1. Firebase Consoleでの確認事項

1. [Firebase Console](https://console.firebase.google.com/project/habit-design-lab) にアクセス
2. 以下を確認：
   - **Firestore Database**が作成されているか
   - **Authentication**が有効になっているか
   - **Google認証プロバイダー**が有効になっているか

### 2. Firestoreデータベースの作成

もしFirestoreが作成されていない場合：

1. Firebase Console → Firestore Database
2. 「データベースを作成」をクリック
3. 「本番環境モード」を選択
4. ロケーションを選択（asia-northeast1 推奨）
5. 作成完了を待つ

### 3. セキュリティルールの更新

1. Firebase Console → Firestore Database → ルール
2. 以下のルールをコピー&ペースト：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 一時的に認証済みユーザーに全権限を付与（開発用）
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. 「公開」をクリック

### 4. 認証ドメインの追加

1. Firebase Console → Authentication → Settings
2. 「承認済みドメイン」タブ
3. 以下のドメインを追加：
   - `yusuke0018.github.io`
   - `localhost`

### 5. プロジェクトの再デプロイ

```bash
npm run build
git add -A
git commit -m "Fix Firebase configuration"
git push origin main
```

### 6. テスト

1. まず `debug-firebase.html` をブラウザで開いてローカルでテスト
2. 成功したら、デプロイされたサイトでテスト

## トラブルシューティング

### エラー: "Failed to get document because the client is offline"
- インターネット接続を確認
- Firebase Consoleでプロジェクトがアクティブか確認

### エラー: "Missing or insufficient permissions"
- セキュリティルールが正しく設定されているか確認
- ユーザーが正しく認証されているか確認

### エラー: "auth/invalid-api-key"
- Firebase Console → プロジェクト設定でAPIキーを確認
- 環境変数またはハードコードされた値が正しいか確認

## 開発環境での推奨設定

Firebase Emulatorを使用することで、本番環境に影響を与えずに開発できます：

```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# ログイン
firebase login

# エミュレーターの初期化
firebase init emulators

# エミュレーターの起動
firebase emulators:start
```

`.env.local`に以下を追加：
```
VITE_USE_FIREBASE_EMULATOR=true
```