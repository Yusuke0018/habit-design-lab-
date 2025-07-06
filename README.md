# 習慣デザイン・ラボ (Habit Design Lab)

## 概要

習慣デザイン・ラボは、BJ Fogg氏の行動モデル「B=MAP」と独自のPDCAサイクル（Play, Design, Check, Adapt）を統合した習慣デザインWebアプリケーションです。単なる習慣の記録・追跡ではなく、習慣そのものを体系的に「デザイン」し、継続的に改善していくプロセスを支援します。

## 主要機能

### 🎯 Play（プロジェクト設定）
- 達成したい「願望」と「得たい感情」を設定
- プロジェクト単位で習慣をグループ化

### 🎨 Design（習慣設計）
- B=MAPモデルを用いた習慣要素の設計
  - **M (Motivation)**: 動機
  - **A (Ability)**: 能力・実行可能性
  - **P (Prompt)**: きっかけ・トリガー

### ✅ Check（振り返り）
- 定期的な振り返りフレームワーク
  - うまくいった点
  - 難しかった点
  - 次に試したいこと
  - 自由記述
- 次回チェック日の設定

### 📈 Adapt（適応と改善）
- 振り返り履歴の表示
- 過去の習慣デザインの参照
- AIアドバイス機能（OpenAI APIを使用） 🆕

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: TanStack Query (React Query)
- **バックエンド**: Firebase
  - Authentication (Google OAuth)
  - Firestore
  - Hosting
- **その他**: React Router, Lucide Icons

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Firebaseプロジェクト

### インストール

1. リポジトリをクローン
```bash
git clone [repository-url]
cd habit-design-lab
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
`.env.example`を`.env`にコピーして、Firebaseの設定情報を入力
```bash
cp .env.example .env
```

4. Firebaseプロジェクトの設定
```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトを初期化
firebase init
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)で新規プロジェクトを作成

2. Authentication を有効化
   - Sign-in method で Google を有効化

3. Firestore Database を作成
   - Production mode で開始
   - `firestore.rules`の内容を適用

4. プロジェクト設定から構成情報を取得し、`.env`に設定

## プロジェクト構造

```
src/
├── components/       # 再利用可能なコンポーネント
├── contexts/        # React Context
├── pages/           # ページコンポーネント
├── services/        # Firebase関連のサービス層
├── types/           # TypeScript型定義
└── utils/           # ユーティリティ関数
```

## AI機能の設定

AIアドバイス機能を利用するには、OpenAI APIキーが必要です。
詳細な設定方法は [AI_SETUP.md](./AI_SETUP.md) を参照してください。

## 今後の開発予定

- [ ] Google Calendar連携
- [x] AIアドバイス機能（OpenAI API） ✅
- [ ] PWA対応
- [ ] ダークモード
- [ ] 多言語対応

## ライセンス

[ライセンスを選択してください]

## 貢献

プルリクエストは歓迎します。大きな変更の場合は、まずissueを作成して変更内容を説明してください。