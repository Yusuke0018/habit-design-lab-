# Firebase認証の設定手順

## エラー: auth/admin-restricted-operation

このエラーは、Firebase Authenticationで匿名認証が無効になっているために発生しています。

## 解決手順

### 1. Firebase Consoleで認証プロバイダーを有効化

1. [Firebase Console](https://console.firebase.google.com/project/habit-design-lab/authentication/providers) にアクセス
2. 「Sign-in method」タブをクリック
3. 以下のプロバイダーを有効化:
   - **Google** (必須)
   - **匿名** (テスト用、オプション)

### 2. Google認証の設定

1. 「Google」をクリック
2. 「有効にする」をトグル
3. プロジェクトのサポートメールを選択
4. 「保存」をクリック

### 3. 承認済みドメインの確認

1. Authentication → Settings → 承認済みドメイン
2. 以下が含まれていることを確認:
   - `localhost`
   - `127.0.0.1`
   - `yusuke0018.github.io`
   - `habit-design-lab.firebaseapp.com`

### 4. OAuth同意画面の設定（必要な場合）

エラーが続く場合は、Google Cloud Consoleでの設定が必要かもしれません:

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「OAuth同意画面」
4. 必要事項を入力

## テスト手順

1. `debug-firebase.html`を再度開く
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントでログイン
4. 認証成功後、「Firestoreテスト書き込み」をクリック

## 確認事項

- Firestoreデータベースが作成されているか
- セキュリティルールが適切に設定されているか
- APIキーが正しいか

これらの設定後、アプリケーションでのプロジェクト作成が可能になるはずです。