/**
 * @file メインアプリケーションコンポーネント
 * @description ルーティングとレイアウトを管理
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書
 * 関連クラス: AuthContext, Router, Layout
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectCreatePage } from './pages/ProjectCreatePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CheckPage } from './pages/CheckPage';
import { HistoryPage } from './pages/HistoryPage';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      // cacheTimeは削除（v5ではgcTimeを使用）
      retry: 1,
      gcTime: 1000 * 60 * 10, // 10分（cacheTimeから変更）
    },
  },
});

function App() {
  console.log('App component rendering');
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="projects/new" element={<ProjectCreatePage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="projects/:id/check" element={<CheckPage />} />
              <Route path="projects/:id/history" element={<HistoryPage />} />
            </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;