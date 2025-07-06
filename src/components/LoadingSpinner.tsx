/**
 * @file ローディングスピナーコンポーネント
 * @description 統一されたローディング表示
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.3 UI/UX
 * 関連クラス: 各ページコンポーネント
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
      </div>
      {message && (
        <p className="text-sm text-muted-foreground animate-fadeInUp">{message}</p>
      )}
    </div>
  );
};