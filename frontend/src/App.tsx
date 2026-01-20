import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/PageTransition';
import Layout from './components/Layout';
import { DiaryListSkeleton } from './components/Skeleton';
import './App.css';

// 代码分割 - 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Diaries = lazy(() => import('./pages/Diaries'));
const DiaryEditor = lazy(() => import('./pages/DiaryEditor'));
const Photos = lazy(() => import('./pages/Photos'));
const Countdowns = lazy(() => import('./pages/Countdowns'));
const Profile = lazy(() => import('./pages/Settings'));

// 页面加载骨架屏
const PageLoader = () => (
  <div className="p-6">
    <DiaryListSkeleton count={3} />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="diaries" element={<Diaries />} />
                <Route path="diaries/new" element={<DiaryEditor />} />
                <Route path="diaries/:id/edit" element={<DiaryEditor />} />
                <Route path="photos" element={<Photos />} />
                <Route path="countdowns" element={<Countdowns />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
