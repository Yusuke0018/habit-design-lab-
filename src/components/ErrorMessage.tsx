/**
 * @file エラーメッセージコンポーネント
 * @description 統一されたエラーメッセージ表示
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.5 エラーハンドリング
 * 関連クラス: 各ページコンポーネント
 */

import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ErrorMessageProps {
  type?: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type = 'error',
  message,
  details,
  onClose,
}) => {
  const styles = {
    error: {
      container: 'bg-destructive/10 border-destructive/20 text-destructive',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      icon: <Info className="h-5 w-5" />,
    },
  };

  const style = styles[type];

  return (
    <div className={`border rounded-lg p-4 ${style.container}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {details && (
            <p className="mt-1 text-sm opacity-90">{details}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            aria-label="閉じる"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};