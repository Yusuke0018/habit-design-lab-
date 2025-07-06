/**
 * @file エラーメッセージ定義
 * @description ユーザーフレンドリーなエラーメッセージの定義
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.5 エラーハンドリング
 * 関連クラス: useErrorHandler, ErrorMessage
 */

export const ERROR_MESSAGES = {
  // 認証関連
  AUTH_FAILED: 'ログインに失敗しました。もう一度お試しください。',
  AUTH_REQUIRED: 'この機能を使用するにはログインが必要です。',
  
  // データ取得関連
  FETCH_FAILED: 'データの取得に失敗しました。',
  PROJECT_NOT_FOUND: 'プロジェクトが見つかりません。',
  
  // データ作成・更新関連
  CREATE_FAILED: 'データの作成に失敗しました。',
  UPDATE_FAILED: 'データの更新に失敗しました。',
  DELETE_FAILED: 'データの削除に失敗しました。',
  
  // バリデーション関連
  REQUIRED_FIELD: '必須項目を入力してください。',
  INVALID_DATE: '有効な日付を入力してください。',
  
  // ネットワーク関連
  NETWORK_ERROR: 'ネットワークエラーが発生しました。接続を確認してください。',
  TIMEOUT: 'リクエストがタイムアウトしました。',
  
  // その他
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;