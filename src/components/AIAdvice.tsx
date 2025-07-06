/**
 * @file AIアドバイスコンポーネント
 * @description 振り返りに基づくAIアドバイスの表示
 */

import React from 'react';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Heart,
  ChevronRight
} from 'lucide-react';
import type { AIAdvice } from '../services/ai';

interface AIAdviceDisplayProps {
  advice: AIAdvice;
  isLoading?: boolean;
}

export const AIAdviceDisplay: React.FC<AIAdviceDisplayProps> = ({ advice, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            AIアドバイスを生成中...
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          AIアドバイス
        </h3>
      </div>

      {/* サマリー */}
      <div className="mb-6 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg">
        <p className="text-gray-800 dark:text-gray-200">
          {advice.summary}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 強み */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              うまくいっている点
            </h4>
          </div>
          <ul className="space-y-2">
            {advice.strengths.map((strength, index) => (
              <li 
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <ChevronRight className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 改善点 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              改善のヒント
            </h4>
          </div>
          <ul className="space-y-2">
            {advice.improvements.map((improvement, index) => (
              <li 
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <ChevronRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 次のアクション */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-purple-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">
            次に試すこと
          </h4>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4">
          <ul className="space-y-3">
            {advice.nextActions.map((action, index) => (
              <li 
                key={index}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {action}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 励ましのメッセージ */}
      <div className="mt-6 p-4 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            {advice.motivationalMessage}
          </p>
        </div>
      </div>
    </div>
  );
};