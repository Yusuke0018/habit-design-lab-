/**
 * @file レイアウトコンポーネント
 * @description アプリケーション全体のレイアウト構造
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.3 UI/UX
 * 関連クラス: Header, Navigation, App
 */

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Plus, Calendar } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* 背景のグラデーションメッシュ */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      
      {/* アニメーションするブロブ */}
      <div className="fixed top-20 -left-20 w-96 h-96 bg-gradient-to-br from-gradient-start/20 to-gradient-middle/20 rounded-full blur-3xl animate-blob" />
      <div className="fixed bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-gradient-middle/20 to-gradient-end/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-gradient-end/20 to-gradient-start/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-1 sm:space-x-2 group">
              <div className="relative">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-float" />
                <div className="absolute inset-0 bg-primary/50 blur-xl group-hover:blur-2xl transition-all duration-300" />
              </div>
              <h1 className="text-base sm:text-xl font-bold gradient-text">習慣デザイン・ラボ</h1>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                />
              )}
              <span className="hidden sm:block text-sm text-muted-foreground">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={signOut}
                className="p-1.5 sm:p-2 hover:bg-accent/20 rounded-lg transition-all duration-300 glass-subtle group"
                title="ログアウト"
              >
                <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <nav className="glass-subtle border-b border-white/10 overflow-x-auto sticky top-[60px] sm:top-[68px] z-40">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 min-w-max">
            <Link
              to="/dashboard"
              className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2 border-b-2 whitespace-nowrap relative group ${
                isActive('/dashboard')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive('/dashboard') && (
                <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-t-lg" />
              )}
              <Home className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive('/dashboard') ? 'animate-bounce-slow' : 'group-hover:scale-110'} transition-transform`} />
              <span className="relative">ダッシュボード</span>
            </Link>
            
            <Link
              to="/projects/new"
              className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2 border-b-2 whitespace-nowrap relative group ${
                isActive('/projects/new')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive('/projects/new') && (
                <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-t-lg" />
              )}
              <Plus className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive('/projects/new') ? 'animate-spin-slow' : 'group-hover:rotate-90'} transition-transform`} />
              <span className="relative">新規プロジェクト</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};