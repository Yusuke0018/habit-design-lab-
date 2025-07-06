# Firestore 400エラーの解決方法

## 問題の症状
- Firestore接続時に400 Bad Requestエラーが発生
- `WebChannelConnection RPC 'Write' stream transport errored`というエラーメッセージ

## 最も可能性の高い原因と解決策

### 1. Firestoreデータベースが未作成

**解決手順:**
1. [Firebase Console](https://console.firebase.google.com/project/habit-design-lab/firestore) にアクセス
2. 「データベースを作成」ボタンをクリック
3. セキュリティルールの選択:
   - 「テストモードで開始」を選択（30日間の期限付き）
   - または「本番環境モードで開始」を選択して、以下のルールを使用
4. ロケーションを選択（asia-northeast1推奨）

### 2. 一時的なセキュリティルール（テスト用）

Firebase Console → Firestore → ルールで以下を設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開発テスト用: 認証済みユーザーに全アクセスを許可
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. 本番用セキュリティルール

テストが成功したら、以下のルールに更新:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 認証されているユーザーのみアクセス可能
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // プロジェクトのルール
    match /projects/{projectId} {
      // 読み取り: 自分のプロジェクトのみ
      allow read: if isAuthenticated() && resource.data.ownerUid == request.auth.uid;
      
      // 作成: 必須フィールドの確認
      allow create: if isAuthenticated() && 
        request.resource.data.ownerUid == request.auth.uid;
      
      // 更新: オーナーのみ
      allow update: if isAuthenticated() && 
        resource.data.ownerUid == request.auth.uid;
      
      // 削除: オーナーのみ
      allow delete: if isAuthenticated() && 
        resource.data.ownerUid == request.auth.uid;
      
      // サブコレクションのルール
      match /{subcollection}/{document=**} {
        allow read, write: if isAuthenticated() && 
          get(/databases/$(database)/documents/projects/$(projectId)).data.ownerUid == request.auth.uid;
      }
    }
  }
}
```

### 4. 承認済みドメインの追加

Firebase Console → Authentication → Settings → 承認済みドメインで以下を追加:
- `yusuke0018.github.io`
- `localhost`
- `127.0.0.1`

### 5. ブラウザでのテスト

1. まずローカルでテスト:
   ```bash
   # プロジェクトルートで
   python3 -m http.server 8000
   # または
   npx serve .
   ```
   
2. ブラウザで `http://localhost:8000/debug-firebase.html` を開く

3. コンソールでエラーを確認

### 6. キャッシュのクリア

ブラウザのキャッシュをクリア:
- Chrome: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- デベロッパーツール → Application → Storage → Clear site data

## トラブルシューティング

### それでも400エラーが続く場合

1. **プロジェクトIDの確認**
   - Firebase Console → プロジェクト設定
   - プロジェクトIDが`habit-design-lab`であることを確認

2. **APIキーの確認**
   - Firebase Console → プロジェクト設定 → 全般
   - ウェブAPIキーをコピーして、コードと照合

3. **Quotaの確認**
   - Firebase Console → 使用量と請求
   - 無料枠の制限に達していないか確認

4. **新しいFirebaseアプリの作成**
   - Firebase Console → プロジェクト設定 → アプリを追加
   - ウェブアプリを追加して、新しい設定を取得

## 確認用コマンド

```bash
# ビルドとデプロイ
npm run build
git add -A
git commit -m "Fix Firebase configuration"
git push origin main

# 数分待ってからアクセス
# https://yusuke0018.github.io/habit-design-lab-/
```