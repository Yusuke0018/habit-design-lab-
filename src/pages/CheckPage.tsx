/**
 * @file 振り返りページ
 * @description 定期的な振り返り実行画面（Checkフェーズ）
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.5 振り返り設定・実行
 * 関連クラス: ReflectionForm, ProjectService
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Save,
  Loader2,
  Sparkles,
  Target,
  Lightbulb,
  Brain,
  Settings
} from 'lucide-react';
import { getProject, updateProject } from '../services/projects';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getHabitElements } from '../services/habitElements';
import { saveReflection, getLatestReflection } from '../services/history';
import type { Reflection } from '../types';
import { aiService, type AIAdvice } from '../services/ai';
import { AIAdviceDisplay } from '../components/AIAdvice';
import { AISettings } from '../components/AISettings';
import { useToast } from '../hooks/useToast';

export const CheckPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reflection, setReflection] = useState<Reflection>({
    well: '',
    challenge: '',
    next: '',
    freeText: '',
  });

  const [nextCheckDate, setNextCheckDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // デフォルト7日後
  );
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const { addToast } = useToast();

  // プロジェクト情報を取得
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });

  // 習慣要素を取得（現在のデザインを表示するため）
  const { data: habitElements, isLoading: elementsLoading } = useQuery({
    queryKey: ['habitElements', id],
    queryFn: () => getHabitElements(id!),
    enabled: !!id,
  });

  // 最新の振り返りを取得（参考用）
  const { data: latestReflection } = useQuery({
    queryKey: ['latestReflection', id],
    queryFn: () => getLatestReflection(id!),
    enabled: !!id,
  });

  // 振り返り保存
  const saveReflectionMutation = useMutation({
    mutationFn: async () => {
      // 振り返りを保存
      await saveReflection(id!, { reflection });
      // 次回チェック日を更新
      await updateProject(id!, { nextCheckDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['latestReflection', id] });
      navigate(`/projects/${id}`);
    },
  });

  // AIアドバイスを生成
  const generateAIAdvice = async () => {
    if (!project || !habitElements) return;

    if (!aiService.hasApiKey()) {
      setShowAiSettings(true);
      return;
    }

    setIsAiLoading(true);
    try {
      const advice = await aiService.analyzeCheckHistory({
        project,
        habitElements,
        checkHistory: {
          wellDone: reflection.well,
          difficult: reflection.challenge,
          nextTry: reflection.next,
          freeText: reflection.freeText,
          checkedAt: new Date().toISOString(),
        },
      });
      setAiAdvice(advice);
    } catch (error) {
      console.error('AI advice generation failed:', error);
      addToast('error', 'AIアドバイスの生成に失敗しました');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reflection.well || reflection.challenge || reflection.next || reflection.freeText) {
      saveReflectionMutation.mutate();
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (projectLoading || elementsLoading) {
    return <LoadingSpinner message="プロジェクトを読み込んでいます..." />;
  }

  if (!project) {
    return (
      <ErrorMessage
        type="error"
        message="プロジェクトが見つかりません"
        details="プロジェクトが削除されたか、アクセス権限がない可能性があります。"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeInUp">
      {/* ヘッダー */}
      <div className="mb-4 sm:mb-6">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-4 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          プロジェクトに戻る
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-float" />
            <div className="absolute inset-0 bg-primary/50 blur-2xl" />
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">振り返りタイム</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          プロジェクト「{project.projectName}」の進捗を振り返りましょう
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* 現在のデザイン（参考） */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="glass rounded-2xl border-2 border-white/20 p-3 sm:p-4 lg:sticky lg:top-4">
            <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <div className="relative">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <div className="absolute inset-0 bg-primary/50 blur-lg" />
              </div>
              <span className="text-gray-900 dark:text-white">現在の習慣要素</span>
            </h3>
            
            {habitElements && habitElements.length > 0 ? (
              <div className="space-y-2">
                {habitElements.map((element, index) => (
                  <div 
                    key={element.id} 
                    className="p-2 glass-subtle rounded-lg animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{element.elementName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      {element.mapSets.length}個のB=MAPセット
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                習慣要素がまだ設定されていません
              </p>
            )}

            {latestReflection && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">前回の振り返り</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestReflection.checkedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 振り返りフォーム */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* うまくいった点 */}
            <div className="glass rounded-2xl border-2 border-success/30 p-4 sm:p-6 hover:border-success/50 transition-all duration-300 group">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <div className="relative">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success animate-bounce-slow" />
                  <div className="absolute inset-0 bg-success/50 blur-xl" />
                </div>
                <span className="text-gray-900 dark:text-white">うまくいった点</span>
              </label>
              <textarea
                value={reflection.well}
                onChange={(e) => setReflection({ ...reflection, well: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 glass border border-white/20 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-success focus:border-success min-h-[80px] sm:min-h-[100px] text-sm sm:text-base transition-all duration-300"
                placeholder="実践できた習慣や、良かった変化を書きましょう"
              />
            </div>

            {/* 難しかった点 */}
            <div className="glass rounded-2xl border-2 border-warning/30 p-4 sm:p-6 hover:border-warning/50 transition-all duration-300 group">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <div className="relative">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning animate-pulse" />
                  <div className="absolute inset-0 bg-warning/50 blur-xl" />
                </div>
                <span className="text-gray-900 dark:text-white">難しかった点</span>
              </label>
              <textarea
                value={reflection.challenge}
                onChange={(e) => setReflection({ ...reflection, challenge: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 glass border border-white/20 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-warning focus:border-warning min-h-[80px] sm:min-h-[100px] text-sm sm:text-base transition-all duration-300"
                placeholder="実践が難しかった習慣や、障害となったことを書きましょう"
              />
            </div>

            {/* 次に試したいこと */}
            <div className="glass rounded-2xl border-2 border-info/30 p-4 sm:p-6 hover:border-info/50 transition-all duration-300 group">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <div className="relative">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-info animate-float" />
                  <div className="absolute inset-0 bg-info/50 blur-xl" />
                </div>
                <span className="text-gray-900 dark:text-white">次に試したいこと</span>
              </label>
              <textarea
                value={reflection.next}
                onChange={(e) => setReflection({ ...reflection, next: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 glass border border-white/20 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-info focus:border-info min-h-[80px] sm:min-h-[100px] text-sm sm:text-base transition-all duration-300"
                placeholder="改善案や新しいアプローチを書きましょう"
              />
            </div>

            {/* 自由記述 */}
            <div className="glass rounded-2xl border-2 border-accent/30 p-4 sm:p-6 hover:border-accent/50 transition-all duration-300 group">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <div className="relative">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-accent animate-pulse-slow" />
                  <div className="absolute inset-0 bg-accent/50 blur-xl" />
                </div>
                <span className="text-gray-900 dark:text-white">気づき・アイデア</span>
              </label>
              <textarea
                value={reflection.freeText}
                onChange={(e) => setReflection({ ...reflection, freeText: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 glass border border-white/20 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent min-h-[80px] sm:min-h-[100px] text-sm sm:text-base transition-all duration-300"
                placeholder="その他、気づいたことや感じたことを自由に書きましょう"
              />
            </div>

            {/* 次回チェック日 */}
            <div className="glass rounded-2xl border-2 border-primary/30 p-4 sm:p-6 hover:border-primary/50 transition-all duration-300 group">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <div className="relative">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-spin-slow" />
                  <div className="absolute inset-0 bg-primary/50 blur-xl" />
                </div>
                <span className="text-gray-900 dark:text-white">次回チェック日</span>
              </label>
              <input
                type="date"
                value={formatDateForInput(nextCheckDate)}
                onChange={(e) => setNextCheckDate(new Date(e.target.value))}
                min={formatDateForInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))}
                max={formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 glass border border-white/20 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base transition-all duration-300"
                required
              />
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                3日後〜1ヶ月後の範囲で設定できます
              </p>
            </div>

            {/* エラーメッセージ */}
            {saveReflectionMutation.isError && (
              <ErrorMessage
                type="error"
                message="振り返りの保存に失敗しました"
                details="もう一度お試しください。問題が続く場合は、管理者にお問い合わせください。"
              />
            )}

            {/* AIアドバイス */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border-2 border-purple-500/50 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold">
                  <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
                  <span className="text-gray-900 dark:text-white">AIアドバイス機能</span>
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">NEW</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAiSettings(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  title="APIキー設定"
                >
                  <Settings className="h-4 w-4" />
                  <span>API設定</span>
                </button>
              </div>

              {(reflection.well || reflection.challenge || reflection.next || reflection.freeText) ? (
                aiAdvice ? (
                  <AIAdviceDisplay advice={aiAdvice} isLoading={isAiLoading} />
                ) : (
                  <div className="text-center py-8">
                    <button
                      type="button"
                      onClick={generateAIAdvice}
                      disabled={isAiLoading}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base font-semibold"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          AIが分析中...
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5" />
                          AIアドバイスを生成
                          <Sparkles className="h-5 w-5" />
                        </>
                      )}
                    </button>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      振り返り内容をAIが分析し、あなたに最適なアドバイスを提供します
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    振り返り内容を入力すると、AIアドバイスが利用できます
                  </p>
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saveReflectionMutation.isPending || (!reflection.well && !reflection.challenge && !reflection.next && !reflection.freeText)}
                className="flex-1 btn-primary text-white py-3 sm:py-4 rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium btn-glow"
              >
                {saveReflectionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    振り返りを保存
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/projects/${id}`)}
                className="px-6 sm:px-8 py-3 sm:py-4 glass border border-white/20 rounded-full hover:bg-secondary/20 transition-all duration-300 text-sm sm:text-base"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI設定モーダル */}
      <AISettings isOpen={showAiSettings} onClose={() => setShowAiSettings(false)} />
    </div>
  );
};