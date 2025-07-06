# ローカルテストの手順

## Firebaseはfile://プロトコルでは動作しません

FirebaseはセキュリティのためHTTP/HTTPSプロトコルが必要です。

## ローカルサーバーの起動方法

### 方法1: npx serve（推奨）
```bash
npx serve -p 3000
```
アクセス: http://localhost:3000/debug-firebase-simple.html

### 方法2: Python HTTPサーバー
```bash
python3 -m http.server 8000
```
アクセス: http://localhost:8000/debug-firebase-simple.html

### 方法3: VS Code Live Server
VS Codeの拡張機能「Live Server」をインストールして、HTMLファイルを右クリック→「Open with Live Server」

## テスト手順

1. 上記いずれかの方法でローカルサーバーを起動
2. ブラウザで指定されたURLにアクセス
3. 「Googleでログイン」をクリック
4. ログイン成功後、「Firestoreテスト」をクリック

## 注意事項

- 必ずhttp://またはhttps://でアクセスすること
- file://でHTMLファイルを直接開かないこと
- ローカルサーバーが起動していることを確認すること