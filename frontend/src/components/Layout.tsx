import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition';
import {
  Home,
  BookOpen,
  Image as ImageIcon,
  Calendar,
  Settings
} from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: '首页', href: '/dashboard', icon: Home },
    { name: '日记', href: '/diaries', icon: BookOpen },
    { name: '相册', href: '/photos', icon: ImageIcon },
    { name: '纪念日', href: '/countdowns', icon: Calendar },
    { name: '设置', href: '/profile', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <span className="text-2xl">💕</span>
            <span className="ml-2 text-xl font-bold text-gray-900">LoveZs</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              记录美好时光 💕
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center">
            <span className="text-xl">💕</span>
            <span className="ml-2 text-lg font-bold text-gray-900">LoveZs</span>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden bg-white border-b border-gray-200">
          <nav className="flex justify-around">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center py-3 px-2 text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default Layout;
