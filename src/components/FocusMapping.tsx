/**
 * @file フォーカス・マッピングコンポーネント
 * @description 習慣要素をインパクトと実行可能性の2軸でマッピング
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.4 フォーカス・マッピング機能
 * 関連クラス: ProjectDetailPage, HabitElement
 */

import React, { useState, useRef, useEffect } from 'react';
import type { HabitElement } from '../types';
import { Info, Target, Move } from 'lucide-react';

interface FocusMappingProps {
  habitElements: HabitElement[];
  onUpdatePosition: (elementId: string, impact: number, feasibility: number) => void;
}

export const FocusMapping: React.FC<FocusMappingProps> = ({
  habitElements,
  onUpdatePosition,
}) => {
  const matrixRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingId(elementId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingId || !matrixRef.current) return;

    const matrix = matrixRef.current;
    const rect = matrix.getBoundingClientRect();
    
    // マウス位置からマトリクス内の相対位置を計算
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    // パーセンテージに変換（0-100）
    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));
    
    // 0-10のスケールに変換
    const impact = Math.round((xPercent / 100) * 10);
    const feasibility = Math.round((1 - yPercent / 100) * 10);
    
    onUpdatePosition(draggingId, impact, feasibility);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  useEffect(() => {
    if (draggingId) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingId, dragOffset]);

  return (
    <div className="space-y-6">
      {/* 説明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">フォーカス・マッピングの使い方</p>
            <ul className="space-y-1 text-xs">
              <li>• 習慣要素をドラッグして、インパクトと実行可能性を評価しましょう</li>
              <li>• 右上の「黄金の行動エリア」（高インパクト・高実行可能性）を目指して配置してください</li>
              <li>• 位置は自動的に保存されます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2軸マトリクス */}
      <div className="relative">
        {/* 軸ラベル */}
        <div className="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 -rotate-90 text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
          実行可能性
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 sm:translate-y-8 text-xs sm:text-sm font-medium text-muted-foreground">
          インパクト
        </div>
        
        {/* 軸の矢印と数値 */}
        <div className="absolute -left-6 sm:-left-8 top-0 text-xs text-muted-foreground">高い</div>
        <div className="absolute -left-6 sm:-left-8 bottom-0 text-xs text-muted-foreground">低い</div>
        <div className="absolute left-0 -bottom-5 sm:-bottom-6 text-xs text-muted-foreground">小</div>
        <div className="absolute right-0 -bottom-5 sm:-bottom-6 text-xs text-muted-foreground">大</div>

        {/* マトリクス本体 */}
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <div
            ref={matrixRef}
            className="absolute inset-0 bg-gradient-to-br from-gray-100 via-yellow-50 to-green-100 dark:from-gray-800 dark:via-yellow-900/20 dark:to-green-900/20 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          >
            {/* 黄金の行動エリア（右上）の強調 */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-yellow-200/50 to-green-200/50 dark:from-yellow-600/20 dark:to-green-600/20">
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xs font-medium text-green-700 dark:text-green-400">
                <span className="hidden sm:inline">黄金の行動</span>
                <Target className="sm:hidden h-3 w-3" />
              </div>
            </div>

            {/* グリッドライン */}
            <svg className="absolute inset-0 w-full h-full">
              {/* 縦線 */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <line
                  key={`v-${i}`}
                  x1={`${i * 10}%`}
                  y1="0"
                  x2={`${i * 10}%`}
                  y2="100%"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1"
                />
              ))}
              {/* 横線 */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={`${i * 10}%`}
                  x2="100%"
                  y2={`${i * 10}%`}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* 配置された要素 */}
            {habitElements.map((element) => {
              const impact = element.impact ?? 5;
              const feasibility = element.feasibility ?? 5;
              const x = (impact / 10) * 100;
              const y = (1 - feasibility / 10) * 100;
              
              return (
                <div
                  key={element.id}
                  className={`
                    absolute px-2 sm:px-3 py-1.5 sm:py-2 bg-card border rounded-lg shadow-sm
                    ${draggingId === element.id ? 'cursor-grabbing z-10 shadow-lg' : 'cursor-grab hover:shadow-md'}
                    transition-shadow
                  `}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '120px',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id!)}
                >
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <Move className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate font-medium">{element.elementName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    インパクト: {impact} / 実行可能性: {feasibility}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 各象限の説明 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-1">左下：低インパクト・低実行可能性</h4>
          <p className="text-xs text-muted-foreground">
            優先度が低い習慣。他の習慣を試してから検討しましょう。
          </p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium mb-1">右下：高インパクト・低実行可能性</h4>
          <p className="text-xs text-muted-foreground">
            効果は大きいが難しい習慣。もっと簡単にする工夫が必要です。
          </p>
        </div>
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <h4 className="font-medium mb-1">左上：低インパクト・高実行可能性</h4>
          <p className="text-xs text-muted-foreground">
            簡単だが効果が小さい習慣。最初の一歩として良いかもしれません。
          </p>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-medium mb-1 text-green-700 dark:text-green-400">
            右上：高インパクト・高実行可能性（黄金の行動）
          </h4>
          <p className="text-xs text-green-600 dark:text-green-300">
            最も優先すべき習慣！効果が大きく、実行しやすい理想的な習慣です。
          </p>
        </div>
      </div>
    </div>
  );
};