/**
 * @file プロジェクトカードコンポーネント
 * @description ダッシュボードで表示するプロジェクトカード
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.2 ダッシュボード
 * 関連クラス: DashboardPage, Project
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Project } from '../types';
import { AnimatedCard } from './AnimatedCard';

interface ProjectCardProps {
  project: Project;
  delay?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, delay = 0 }) => {
  const today = new Date();
  const checkDate = new Date(project.nextCheckDate);
  const isOverdue = checkDate < today;
  const daysUntilCheck = Math.ceil((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <AnimatedCard delay={delay}>
      <Link
        to={`/projects/${project.id}`}
        className="block bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group"
      >
        {/* 背景装飾 */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse-slow" />
              <h3 className="text-lg font-semibold text-foreground">{project.projectName}</h3>
            </div>
            {isOverdue ? (
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 animate-bounce-slow" />
            ) : daysUntilCheck <= 3 ? (
              <Calendar className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
          </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {project.aspiration}
      </p>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">次回チェック日</span>
        <span className={`font-medium ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
          {isOverdue && '期限超過: '}
          {formatDate(checkDate)}
        </span>
      </div>

          {!isOverdue && daysUntilCheck <= 7 && (
            <div className="mt-3 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 px-3 py-1 rounded-md">
              あと{daysUntilCheck}日でチェック
            </div>
          )}
        </div>
      </Link>
    </AnimatedCard>
  );
};