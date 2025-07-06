/**
 * @file 認証保護ルートコンポーネント
 * @description 認証が必要なページへのアクセスを制御
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.1 ユーザー認証
 * 関連クラス: AuthContext, LoginPage
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};