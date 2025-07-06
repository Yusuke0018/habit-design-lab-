/**
 * @file トースト通知管理フック
 * @description トースト通知の状態管理
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.3 UI/UX
 * 関連クラス: Toast
 */

import { useState, useCallback } from 'react';

interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'info',
    message: '',
  });

  const showToast = useCallback((type: ToastState['type'], message: string) => {
    setToast({
      show: true,
      type,
      message,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    addToast: showToast, // エイリアスとして追加
  };
};