/**
 * @file プロジェクト作成ページ
 * @description 新規プロジェクトの作成（Playフェーズ）
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.3 プロジェクト作成
 * 関連クラス: ProjectService, ProjectForm
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Target, Heart, Loader2 } from 'lucide-react';
import { createProject } from '../services/projects';

export const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    projectName: '',
    aspiration: '',
    feeling: '',
    nextCheckDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // デフォルト7日後
  });

  const createMutation = useMutation({
    mutationFn: () => createProject(formData),
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${projectId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.projectName && formData.aspiration && formData.feeling) {
      createMutation.mutate();
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">新規プロジェクト作成</h2>
      
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg border space-y-6">
        {/* プロジェクト名 */}
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium mb-2">
            プロジェクト名 <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              id="projectName"
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="例：家庭円満プロジェクト"
              required
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            わかりやすく、モチベーションが上がる名前をつけましょう
          </p>
        </div>

        {/* 具体的な願望 */}
        <div>
          <label htmlFor="aspiration" className="block text-sm font-medium mb-2">
            具体的な願望 (Outcome) <span className="text-destructive">*</span>
          </label>
          <textarea
            id="aspiration"
            value={formData.aspiration}
            onChange={(e) => setFormData({ ...formData, aspiration: e.target.value })}
            className="w-full px-4 py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            placeholder="例：妻が笑顔でいる時間を増やし、子供の成長を穏やかな気持ちで見守る"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            このプロジェクトで実現したい具体的な成果を書きましょう
          </p>
        </div>

        {/* 得たい感情 */}
        <div>
          <label htmlFor="feeling" className="block text-sm font-medium mb-2">
            得たい感情 (Feeling) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Heart className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              id="feeling"
              type="text"
              value={formData.feeling}
              onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="例：穏やかさ、家族との一体感"
              required
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            願望が達成されたときに感じたい感情を書きましょう
          </p>
        </div>

        {/* 次回チェック日 */}
        <div>
          <label htmlFor="nextCheckDate" className="block text-sm font-medium mb-2">
            最初のチェック日
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              id="nextCheckDate"
              type="date"
              value={formatDateForInput(formData.nextCheckDate)}
              onChange={(e) => setFormData({ ...formData, nextCheckDate: new Date(e.target.value) })}
              min={formatDateForInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))} // 最短3日後
              max={formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))} // 最長30日後
              className="w-full pl-10 pr-4 py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground hidden sm:block">
            3日後〜1ヶ月後の範囲で設定できます。最初は1週間後がおすすめです
          </p>
        </div>

        {/* エラーメッセージ */}
        {createMutation.isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">
              プロジェクトの作成に失敗しました。もう一度お試しください。
            </p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 bg-primary text-primary-foreground py-2.5 sm:py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                作成中...
              </>
            ) : (
              'プロジェクトを作成'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 sm:py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm sm:text-base"
          >
            キャンセル
          </button>
        </div>
      </form>

      {/* 説明テキスト */}
      <div className="mt-6 sm:mt-8 bg-muted/30 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">プロジェクト作成のヒント</h3>
        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>願望は具体的に、測定可能な形で書くと効果的です</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>感情は「〜したい」ではなく「〜を感じたい」という形で書きましょう</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>最初のチェック日は短めに設定し、小さな成功体験を積み重ねましょう</span>
          </li>
        </ul>
      </div>
    </div>
  );
};