/**
 * @file ダッシュボードページ
 * @description プロジェクト一覧を表示
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.2 ダッシュボード
 * 関連クラス: ProjectService, ProjectCard
 */

import React, { useState } from 'react';
import { Plus, Sparkles, Rocket, Star, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProjectCard } from '../components/ProjectCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getUserProjects } from '../services/projects';
import { AISettings } from '../components/AISettings';

export const DashboardPage: React.FC = () => {
  const [showAiSettings, setShowAiSettings] = useState(false);
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getUserProjects,
  });

  if (isLoading) {
    return <LoadingSpinner message="プロジェクトを読み込んでいます..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        type="error"
        message="プロジェクトの読み込みに失敗しました"
        details="ページを再読み込みしてください。問題が続く場合は、管理者にお問い合わせください。"
      />
    );
  }

  return (
    <div className="animate-fadeInUp">
      <div className="flex items-center justify-between mb-4 sm:mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-float" />
            <div className="absolute inset-0 bg-primary/50 blur-2xl" />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">プロジェクト一覧</h2>
        </div>
        <div className="flex items-center gap-2">
          {projects && projects.length > 0 && (
            <div className="glass px-3 py-1.5 rounded-full">
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {projects.length}件のプロジェクト
              </span>
            </div>
          )}
          <button
            onClick={() => setShowAiSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            title="AI設定"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">AI設定</span>
          </button>
      </div>
      
      {projects && projects.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} delay={index * 100} />
          ))}
        </div>
      ) : (
        <div className="glass p-8 sm:p-12 rounded-2xl border-2 border-white/20 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
          
          <div className="max-w-md mx-auto relative z-10">
            <div className="mb-6 relative">
              <Rocket className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-primary animate-bounce-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse-glow" />
              </div>
            </div>
            
            <h3 className="font-bold text-lg sm:text-2xl mb-3 text-gray-900 dark:text-white">
              習慣づくりの旅を始めよう！
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">
              新しいプロジェクトを作成して、理想の習慣をデザインしましょう
            </p>
            
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-3 btn-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl btn-glow"
            >
              <Plus className="h-5 w-5 animate-spin-slow" />
              <span>プロジェクトを作成</span>
              <Star className="h-4 w-4 animate-pulse" />
            </Link>
          </div>
        </div>
      )}

      {/* フローティングアクションボタン */}
      {projects && projects.length > 0 && (
        <Link
          to="/projects/new"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 btn-primary text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group animate-bounce-slow"
          title="新規プロジェクト作成"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
          <div className="absolute inset-0 btn-primary rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
        </Link>
      )}

      {/* AI設定モーダル */}
      <AISettings isOpen={showAiSettings} onClose={() => setShowAiSettings(false)} />
    </div>
  );
};