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
  MessageSquare,
  Save,
  Loader2
} from 'lucide-react';
import { getProject, updateProject } from '../services/projects';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getHabitElements } from '../services/habitElements';
import { saveReflection, getLatestReflection } from '../services/history';
import { Reflection } from '../types';

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
      await saveReflection(id!, reflection);
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
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-4 sm:mb-6">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
          プロジェクトに戻る
        </Link>
        
        <h1 className="text-xl sm:text-3xl font-bold mb-2">振り返り</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          プロジェクト「{project.projectName}」の進捗を振り返りましょう
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* 現在のデザイン（参考） */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-card border rounded-lg p-3 sm:p-4 lg:sticky lg:top-4">
            <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              現在の習慣要素
            </h3>
            
            {habitElements && habitElements.length > 0 ? (
              <div className="space-y-2">
                {habitElements.map((element) => (
                  <div key={element.id} className="p-2 bg-muted/30 rounded-md">
                    <p className="text-xs sm:text-sm font-medium">{element.elementName}</p>
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
            <div className="bg-card border rounded-lg p-4 sm:p-6">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                うまくいった点
              </label>
              <textarea
                value={reflection.well}
                onChange={(e) => setReflection({ ...reflection, well: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                placeholder="実践できた習慣や、良かった変化を書きましょう"
              />
            </div>

            {/* 難しかった点 */}
            <div className="bg-card border rounded-lg p-4 sm:p-6">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                難しかった点
              </label>
              <textarea
                value={reflection.challenge}
                onChange={(e) => setReflection({ ...reflection, challenge: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                placeholder="実践が難しかった習慣や、障害となったことを書きましょう"
              />
            </div>

            {/* 次に試したいこと */}
            <div className="bg-card border rounded-lg p-4 sm:p-6">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                次に試したいこと
              </label>
              <textarea
                value={reflection.next}
                onChange={(e) => setReflection({ ...reflection, next: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                placeholder="改善案や新しいアプローチを書きましょう"
              />
            </div>

            {/* 自由記述 */}
            <div className="bg-card border rounded-lg p-4 sm:p-6">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                自由記述
              </label>
              <textarea
                value={reflection.freeText}
                onChange={(e) => setReflection({ ...reflection, freeText: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                placeholder="その他、気づいたことや感じたことを自由に書きましょう"
              />
            </div>

            {/* 次回チェック日 */}
            <div className="bg-card border rounded-lg p-4 sm:p-6">
              <label className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                次回チェック日
              </label>
              <input
                type="date"
                value={formatDateForInput(nextCheckDate)}
                onChange={(e) => setNextCheckDate(new Date(e.target.value))}
                min={formatDateForInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))}
                max={formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
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

            {/* ボタン */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saveReflectionMutation.isPending || (!reflection.well && !reflection.challenge && !reflection.next && !reflection.freeText)}
                className="flex-1 bg-primary text-primary-foreground py-2.5 sm:py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
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
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/projects/${id}`)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm sm:text-base"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};