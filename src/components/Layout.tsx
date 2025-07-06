/**
 * @file レイアウトコンポーネント
 * @description アプリケーション全体のレイアウト構造
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 3.3 UI/UX
 * 関連クラス: Header, Navigation, App
 */

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Plus, Calendar, History } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">習慣デザイン・ラボ</h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-muted-foreground">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={signOut}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="ログアウト"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <nav className="bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <Link
              to="/dashboard"
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center space-x-2 border-b-2 ${
                isActive('/dashboard')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>ダッシュボード</span>
            </Link>
            
            <Link
              to="/projects/new"
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center space-x-2 border-b-2 ${
                isActive('/projects/new')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>新規プロジェクト</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};