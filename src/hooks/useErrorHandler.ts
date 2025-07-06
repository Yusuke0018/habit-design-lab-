/**
 * @file エラーハンドリングフック
 * @description Firebase エラーを統一的に処理するカスタムフック
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.5 エラーハンドリング
 * 関連クラス: 各サービス関数
 */

import { useState, useCallback } from 'react';
import { FirebaseError } from 'firebase/app';

interface ErrorState {
  error: string | null;
  details: string | null;
  isError: boolean;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    details: null,
    isError: false,
  });

  const handleError = useCallback((error: unknown) => {
    console.error('エラーが発生しました:', error);

    if (error instanceof FirebaseError) {
      // Firebaseエラーの処理
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'メールアドレスの形式が正しくありません',
        'auth/user-disabled': 'このアカウントは無効化されています',
        'auth/user-not-found': 'ユーザーが見つかりません',
        'auth/wrong-password': 'パスワードが正しくありません',
        'auth/popup-closed-by-user': 'ログイン画面が閉じられました',
        'auth/cancelled-popup-request': 'ログイン処理がキャンセルされました',
        'auth/network-request-failed': 'ネットワークエラーが発生しました',
        'permission-denied': 'アクセス権限がありません',
        'not-found': 'データが見つかりません',
        'already-exists': 'すでに存在するデータです',
        'deadline-exceeded': 'リクエストがタイムアウトしました',
        'unavailable': 'サービスが一時的に利用できません',
      };

      const message = errorMessages[error.code] || 'エラーが発生しました';
      
      setErrorState({
        error: message,
        details: error.message,
        isError: true,
      });
    } else if (error instanceof Error) {
      // 一般的なエラーの処理
      setErrorState({
        error: 'エラーが発生しました',
        details: error.message,
        isError: true,
      });
    } else {
      // 未知のエラーの処理
      setErrorState({
        error: '予期しないエラーが発生しました',
        details: String(error),
        isError: true,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      details: null,
      isError: false,
    });
  }, []);

  return {
    error: errorState.error,
    details: errorState.details,
    isError: errorState.isError,
    handleError,
    clearError,
  };
};