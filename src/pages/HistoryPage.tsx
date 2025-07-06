/**
 * @file 履歴ページ
 * @description プロジェクトの変更履歴表示（Adaptフェーズ）
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.6 適応と改善
 * 関連クラス: HistoryList, AIAdvice
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  History as HistoryIcon, 
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  TrendingUp,
  MessageSquare,
  Loader2,
  Target,
  Brain
} from 'lucide-react';
import { getProject } from '../services/projects';
import { getProjectHistory } from '../services/history';
import { History } from '../types';

export const HistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // プロジェクト情報を取得
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });

  // 履歴を取得
  const { data: histories, isLoading: historiesLoading } = useQuery({
    queryKey: ['projectHistory', id],
    queryFn: () => getProjectHistory(id!),
    enabled: !!id,
  });

  const toggleExpanded = (historyId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(historyId)) {
      newExpanded.delete(historyId);
    } else {
      newExpanded.add(historyId);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (projectLoading || historiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive">プロジェクトが見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          プロジェクトに戻る
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">変更履歴</h1>
            <p className="text-muted-foreground">
              プロジェクト「{project.projectName}」の振り返りと改善の記録
            </p>
          </div>
          
          {/* AIアドバイスボタン（将来実装） */}
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md opacity-50 cursor-not-allowed"
            title="AIアドバイス機能は今後実装予定です"
          >
            <Brain className="h-4 w-4" />
            AIからアドバイスをもらう
          </button>
        </div>
      </div>

      {/* 履歴一覧 */}
      {histories && histories.length > 0 ? (
        <div className="space-y-4">
          {histories.map((history) => (
            <div key={history.id} className="bg-card border rounded-lg overflow-hidden">
              {/* 履歴ヘッダー */}
              <button
                onClick={() => toggleExpanded(history.id!)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">
                      {formatDate(new Date(history.checkedAt))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      習慣要素: {history.designSnapshot.habitElements.length}個
                    </p>
                  </div>
                </div>
                
                {expandedItems.has(history.id!) ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {/* 展開時の詳細 */}
              {expandedItems.has(history.id!) && (
                <div className="px-6 pb-6 border-t">
                  {/* 振り返り内容 */}
                  <div className="grid gap-4 mt-4 md:grid-cols-2">
                    {history.reflection.well && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          うまくいった点
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {history.reflection.well}
                        </p>
                      </div>
                    )}
                    
                    {history.reflection.challenge && (
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400 mb-2">
                          <XCircle className="h-4 w-4" />
                          難しかった点
                        </h4>
                        <p className="text-sm text-orange-600 dark:text-orange-300">
                          {history.reflection.challenge}
                        </p>
                      </div>
                    )}
                    
                    {history.reflection.next && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400 mb-2">
                          <TrendingUp className="h-4 w-4" />
                          次に試したいこと
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          {history.reflection.next}
                        </p>
                      </div>
                    )}
                    
                    {history.reflection.freeText && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-purple-700 dark:text-purple-400 mb-2">
                          <MessageSquare className="h-4 w-4" />
                          自由記述
                        </h4>
                        <p className="text-sm text-purple-600 dark:text-purple-300">
                          {history.reflection.freeText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 当時の習慣要素 */}
                  <div className="mt-6">
                    <h4 className="flex items-center gap-2 font-medium mb-3">
                      <Target className="h-4 w-4" />
                      当時の習慣要素
                    </h4>
                    <div className="space-y-2">
                      {history.designSnapshot.habitElements.map((element, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-md">
                          <p className="font-medium text-sm">{element.elementName}</p>
                          {element.mapSets.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {element.mapSets.map((mapSet, mapIndex) => (
                                <div key={mapIndex} className="text-xs text-muted-foreground pl-4">
                                  <span className="font-medium">M:</span> {mapSet.M}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card p-12 rounded-lg border text-center">
          <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">まだ振り返り履歴がありません</p>
          <p className="text-sm text-muted-foreground mb-6">
            プロジェクトの振り返りを行うと、ここに履歴が表示されます
          </p>
          <Link
            to={`/projects/${id}/check`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Calendar className="h-4 w-4" />
            最初の振り返りをする
          </Link>
        </div>
      )}
    </div>
  );
};