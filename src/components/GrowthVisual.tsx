/**
 * @file 成長ビジュアルコンポーネント
 * @description 習慣の成長段階を視覚的に表現するコンポーネント
 */

import React from 'react';
import type { GrowthStage } from '../types';
import { getGrowthStageInfo } from '../services/habitRecords';

interface GrowthVisualProps {
  stage: GrowthStage;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showLabel?: boolean;
}

const GrowthVisual: React.FC<GrowthVisualProps> = ({
  stage,
  size = 'medium',
  animated = true,
  showLabel = false
}) => {
  const stageInfo = getGrowthStageInfo(stage);
  
  const sizeClasses = {
    small: 'w-12 h-12 text-2xl',
    medium: 'w-20 h-20 text-4xl',
    large: 'w-32 h-32 text-6xl'
  };

  const animationClasses = {
    seed: '',
    sprout: animated ? 'animate-bounce' : '',
    sapling: animated ? 'animate-pulse' : '',
    tree: '',
    blooming: animated ? 'animate-spin-slow' : '',
    fruit: animated ? 'animate-bounce' : ''
  };

  const backgroundGradients = {
    seed: 'from-amber-100 to-amber-200',
    sprout: 'from-green-100 to-green-200',
    sapling: 'from-green-200 to-green-300',
    tree: 'from-green-300 to-green-400',
    blooming: 'from-pink-100 to-pink-200',
    fruit: 'from-yellow-100 to-yellow-200'
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          ${sizeClasses[size]}
          ${animationClasses[stage]}
          bg-gradient-to-br ${backgroundGradients[stage]}
          rounded-full
          flex items-center justify-center
          shadow-lg
          transform transition-all duration-300
          hover:scale-110
          relative
          overflow-hidden
        `}
      >
        {/* 背景エフェクト */}
        <div className="absolute inset-0 opacity-20">
          {stage === 'blooming' && (
            <div className="absolute inset-0 bg-gradient-to-r from-pink-300 to-purple-300 animate-pulse" />
          )}
          {stage === 'fruit' && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 animate-pulse" />
          )}
        </div>

        {/* メインの絵文字 */}
        <span className="relative z-10">{stageInfo.emoji}</span>

        {/* 追加の装飾 */}
        {stage === 'blooming' && animated && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute text-pink-500 text-sm animate-float-up opacity-60">✨</span>
            <span className="absolute text-pink-400 text-xs animate-float-up-delayed opacity-60">🦋</span>
          </div>
        )}

        {stage === 'fruit' && animated && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute text-yellow-500 text-sm animate-pulse">✨</span>
          </div>
        )}
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <p className="text-sm font-medium" style={{ color: stageInfo.color }}>
            {stageInfo.name}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {stageInfo.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default GrowthVisual;