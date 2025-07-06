/**
 * @file ダッシュボードページ
 * @description プロジェクト一覧を表示
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.2 ダッシュボード
 * 関連クラス: ProjectService, ProjectCard
 */

import React, { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProjectCard } from '../components/ProjectCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getUserProjects } from '../services/projects';
import { Project } from '../types';

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
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive">プロジェクトの読み込みに失敗しました。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">プロジェクト一覧</h2>
        {projects && projects.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {projects.length}件のプロジェクト
          </span>
        )}
      </div>
      
      {projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} delay={index * 100} />
          ))}
        </div>
      ) : (
        <div className="bg-card p-12 rounded-lg border text-center">
          <div className="max-w-md mx-auto">
            <h3 className="font-semibold text-lg mb-2">プロジェクトがまだありません</h3>
            <p className="text-muted-foreground text-sm mb-6">
              新しいプロジェクトを作成して習慣をデザインしましょう
            </p>
            <Link
              to="/projects/new"
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
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
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
          title="新規プロジェクト作成"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
};