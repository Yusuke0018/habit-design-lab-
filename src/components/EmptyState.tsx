/**
 * @file 空状態表示コンポーネント
 * @description データがない時に表示する楽しいイラスト付きメッセージ
 */

import React from 'react';
import { Rocket, Sparkles, Star } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="glass rounded-2xl border-2 border-white/20 p-8 sm:p-12 text-center relative overflow-hidden animate-fadeInUp">
      {/* 背景装飾 */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      
      <div className="relative z-10">
        {/* アイコン */}
        <div className="mb-6 relative">
          {icon || (
            <div className="relative inline-block">
              <Rocket className="h-16 w-16 sm:h-20 sm:w-20 text-primary animate-float mx-auto" />
              <Star className="absolute -top-4 -right-4 h-6 w-6 text-warning animate-spin-slow" />
              <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-accent animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse-glow" />
          </div>
        </div>
        
        {/* タイトルと説明 */}
        <h3 className="font-bold text-lg sm:text-2xl mb-3 text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md mx-auto">
          {description}
        </p>
        
        {/* アクション */}
        {action && (
          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};