/**
 * @file ダッシュボードページ
 * @description プロジェクト一覧を表示
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.2 ダッシュボード
 * 関連クラス: ProjectService, ProjectCard
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProjectCard } from '../components/ProjectCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getUserProjects } from '../services/projects';

export const DashboardPage: React.FC = () => {
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
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">プロジェクト一覧</h2>
        {projects && projects.length > 0 && (
          <span className="text-xs sm:text-sm text-muted-foreground">
            {projects.length}件のプロジェクト
          </span>
        )}
      </div>
      
      {projects && projects.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} delay={index * 100} />
          ))}
        </div>
      ) : (
        <div className="bg-card p-8 sm:p-12 rounded-lg border text-center">
          <div className="max-w-md mx-auto">
            <h3 className="font-semibold text-base sm:text-lg mb-2">プロジェクトがまだありません</h3>
            <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
              新しいプロジェクトを作成して習慣をデザインしましょう
            </p>
            <Link
              to="/projects/new"
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>プロジェクトを作成</span>
            </Link>
          </div>
        </div>
      )}

      {/* フローティングアクションボタン */}
      {projects && projects.length > 0 && (
        <Link
          to="/projects/new"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-primary text-primary-foreground rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-shadow"
          title="新規プロジェクト作成"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
};