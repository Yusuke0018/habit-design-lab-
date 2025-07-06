/**
 * @file アニメーションカードコンポーネント
 * @description ホバーやクリック時のアニメーション効果を持つカード
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.3 UI/UX
 * 関連クラス: ProjectCard, HabitElementCard
 */

import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
  delay = 0,
}) => {
  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-xl
        animate-fadeInUp
        ${className}
      `}
      style={{
        animationDelay: `${delay}ms`,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};