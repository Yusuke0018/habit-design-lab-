/**
 * @file プロジェクトカードコンポーネント
 * @description ダッシュボードで表示するプロジェクトカード
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.2 ダッシュボード
 * 関連クラス: DashboardPage, Project
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle, Sparkles, Target, TrendingUp } from 'lucide-react';
import type { Project } from '../types';
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
        className="block glass border-2 border-white/20 hover:border-primary/50 rounded-2xl p-4 sm:p-6 transition-all duration-300 relative overflow-hidden group card-3d"
      >
        {/* 背景装飾 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gradient-start/10 via-gradient-middle/10 to-gradient-end/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 animate-pulse-slow" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 animate-pulse-slow animation-delay-2000" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="h-4 w-4 text-primary animate-spin-slow" />
                <div className="absolute inset-0 bg-primary/50 blur-xl animate-pulse-glow" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-500 line-clamp-1 drop-shadow-md">{project.projectName}</h3>
            </div>
            {isOverdue ? (
              <div className="relative">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 animate-bounce" />
                <div className="absolute inset-0 bg-destructive/50 blur-xl animate-pulse" />
              </div>
            ) : daysUntilCheck <= 3 ? (
              <div className="relative">
                <Calendar className="h-5 w-5 text-warning flex-shrink-0 animate-pulse" />
                <div className="absolute inset-0 bg-warning/50 blur-xl" />
              </div>
            ) : (
              <div className="relative">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <div className="absolute inset-0 bg-success/50 blur-xl" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 italic">
              "{project.aspiration}"
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs sm:text-sm text-muted-foreground">次回チェック</span>
              </div>
              <span className={`font-bold text-sm ${isOverdue ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                {isOverdue && '⚠️ '}
                {formatDate(checkDate)}
              </span>
            </div>

            {!isOverdue && daysUntilCheck <= 7 && (
              <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-warning/20 to-warning/10 text-warning px-3 py-2 rounded-lg animate-pulse-slow">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">あと{daysUntilCheck}日でチェック！</span>
              </div>
            )}
            
            {isOverdue && (
              <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive px-3 py-2 rounded-lg animate-pulse">
                <AlertCircle className="h-3 w-3" />
                <span className="font-medium">チェックが必要です</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </AnimatedCard>
  );
};