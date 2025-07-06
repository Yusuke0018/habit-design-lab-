/**
 * @file プロジェクト作成ページ
 * @description 新規プロジェクトの作成（Playフェーズ）
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.3 プロジェクト作成
 * 関連クラス: ProjectService, ProjectForm
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Target, Heart, Loader2, Sparkles, Rocket, Star, Lightbulb } from 'lucide-react';
import { createProject } from '../services/projects';
import { ErrorMessage } from '../components/ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';

export const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { error, details, isError, handleError, clearError } = useErrorHandler();
  
  const [formData, setFormData] = useState({
    projectName: '',
    aspiration: '',
    feeling: '',
    nextCheckDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // デフォルト7日後
  });

  const createMutation = useMutation({
    mutationFn: () => {
      console.log('プロジェクト作成を開始します:', formData);
      return createProject(formData);
    },
    onSuccess: (projectId) => {
      console.log('プロジェクト作成成功:', projectId);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // 少し遅延させてから遷移（Firestoreの書き込みが完全に完了するまで待つ）
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 500);
    },
    onError: (error) => {
      console.error('プロジェクト作成エラー:', error);
      handleError(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // 以前のエラーをクリア
    
    // バリデーション
    if (!formData.projectName.trim()) {
      handleError(new Error('プロジェクト名を入力してください'));
      return;
    }
    if (!formData.aspiration.trim()) {
      handleError(new Error('具体的な願望を入力してください'));
      return;
    }
    if (!formData.feeling.trim()) {
      handleError(new Error('得たい感情を入力してください'));
      return;
    }
    
    createMutation.mutate();
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeInUp">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="relative">
          <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-bounce-slow" />
          <div className="absolute inset-0 bg-primary/50 blur-2xl" />
        </div>
        <h2 className="text-xl sm:text-3xl font-bold gradient-text">新しい習慣プロジェクトを始めよう！</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="glass rounded-2xl border-2 border-white/20 p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        {/* プロジェクト名 */}
        <div className="relative z-10">
          <label htmlFor="projectName" className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="gradient-text">プロジェクト名</span>
            <span className="text-destructive">*</span>
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-3 text-primary animate-spin-slow">
              <Star className="h-5 w-5" />
            </div>
            <input
              id="projectName"
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 group-hover:border-primary/50"
              placeholder="例：家庭円満プロジェクト"
              required
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            わかりやすく、モチベーションが上がる名前をつけましょう ✨
          </p>
        </div>

        {/* 具体的な願望 */}
        <div className="relative z-10">
          <label htmlFor="aspiration" className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning animate-pulse" />
            <span className="gradient-text">具体的な願望 (Outcome)</span>
            <span className="text-destructive">*</span>
          </label>
          <textarea
            id="aspiration"
            value={formData.aspiration}
            onChange={(e) => setFormData({ ...formData, aspiration: e.target.value })}
            className="w-full px-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-warning focus:border-warning min-h-[100px] transition-all duration-300"
            placeholder="例：妻が笑顔でいる時間を増やし、子供の成長を穏やかな気持ちで見守る"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            このプロジェクトで実現したい具体的な成果を書きましょう 🎯
          </p>
        </div>

        {/* 得たい感情 */}
        <div className="relative z-10">
          <label htmlFor="feeling" className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4 text-accent animate-pulse-slow" />
            <span className="gradient-text">得たい感情 (Feeling)</span>
            <span className="text-destructive">*</span>
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-3 text-accent animate-float">
              <Heart className="h-5 w-5" />
            </div>
            <input
              id="feeling"
              type="text"
              value={formData.feeling}
              onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
              className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-300 group-hover:border-accent/50"
              placeholder="例：穏やかさ、家族との一体感"
              required
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            願望が達成されたときに感じたい感情を書きましょう 💗
          </p>
        </div>

        {/* 次回チェック日 */}
        <div className="relative z-10">
          <label htmlFor="nextCheckDate" className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-info" />
            <span className="gradient-text">最初のチェック日</span>
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-3 text-info animate-bounce-slow">
              <Calendar className="h-5 w-5" />
            </div>
            <input
              id="nextCheckDate"
              type="date"
              value={formatDateForInput(formData.nextCheckDate)}
              onChange={(e) => setFormData({ ...formData, nextCheckDate: new Date(e.target.value) })}
              min={formatDateForInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))} // 最短3日後
              max={formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))} // 最長30日後
              className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-info focus:border-info transition-all duration-300 group-hover:border-info/50"
              required
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground hidden sm:block">
            3日後〜1ヶ月後の範囲で設定できます。最初は1週間後がおすすめです 📅
          </p>
        </div>

        {/* エラーメッセージ */}
        {isError && (
          <ErrorMessage
            type="error"
            message={error || 'プロジェクトの作成に失敗しました'}
            details={details || undefined}
            onClose={clearError}
          />
        )}

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4 relative z-10">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 btn-primary text-white py-3 sm:py-4 rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium btn-glow"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                作成中...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                プロジェクトを作成
                <Sparkles className="h-4 w-4 animate-pulse" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 sm:py-4 glass border border-white/20 rounded-full hover:bg-secondary/20 transition-all duration-300 text-sm sm:text-base"
          >
            キャンセル
          </button>
        </div>
      </form>

      {/* 説明テキスト */}
      <div className="mt-6 sm:mt-8 glass rounded-2xl border border-white/10 p-4 sm:p-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning animate-pulse" />
          <span className="gradient-text">プロジェクト作成のヒント</span>
        </h3>
        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Star className="h-3 w-3 text-warning mt-0.5 animate-spin-slow" />
            <span>願望は具体的に、測定可能な形で書くと効果的です</span>
          </li>
          <li className="flex items-start gap-2">
            <Heart className="h-3 w-3 text-accent mt-0.5 animate-pulse" />
            <span>感情は「〜したい」ではなく「〜を感じたい」という形で書きましょう</span>
          </li>
          <li className="flex items-start gap-2">
            <Target className="h-3 w-3 text-success mt-0.5 animate-bounce-slow" />
            <span>最初のチェック日は短めに設定し、小さな成功体験を積み重ねましょう</span>
          </li>
        </ul>
      </div>
    </div>
  );
};