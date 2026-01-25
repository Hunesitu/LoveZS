import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Heart, Calendar, Plus, Image as ImageIcon } from 'lucide-react';
import dayjs from 'dayjs';

interface Diary {
  _id: string;
  title: string;
  content: string;
  mood: string;
  category: string;
  tags: string[];
  date: string;
}

interface Countdown {
  _id: string;
  title: string;
  targetDate: string;
  direction: 'countup' | 'countdown';
  days: number;
  absoluteDays: number;
}

const Dashboard: React.FC = () => {
  const [recentDiaries, setRecentDiaries] = useState<Diary[]>([]);
  const [diaryCount, setDiaryCount] = useState<number>(0);
  const [loveDays, setLoveDays] = useState<number>(0);
  const [nextCountdown, setNextCountdown] = useState<Countdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 获取最近日记
      const diariesResponse = await api.get('/diaries', { params: { limit: 3 } });
      setRecentDiaries(diariesResponse.data.data.diaries);
      setDiaryCount(diariesResponse.data.data.pagination?.total || diariesResponse.data.data.diaries.length || 0);

      // 获取恋爱天数（最早的countup纪念日）
      const countdownsResponse = await api.get('/countdowns', { params: { direction: 'countup' } });
      const countups = countdownsResponse.data.data.countdowns;
      if (countups.length > 0) {
        // 找最早的那个（天数最多）
        const earliest = countups.reduce((prev: any, curr: any) =>
          curr.days < prev.days ? curr : prev
        );
        setLoveDays(Math.abs(earliest.days));
      }

      // 获取下一个倒计时
      const countdownResponse = await api.get('/countdowns', { params: { direction: 'countdown' } });
      const countdowns = countdownResponse.data.data.countdowns;
      if (countdowns.length > 0) {
        // 找最近的那个（天数最少且大于0）
        const upcoming = countdowns
          .filter((c: any) => c.days > 0)
          .sort((a: any, b: any) => a.days - b.days)[0];
        setNextCountdown(upcoming || null);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      excited: '🤩',
      calm: '😌',
      angry: '😠',
      tired: '😴',
      loved: '🥰',
      grateful: '🙏',
    };
    return moodEmojis[mood] || '😊';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          欢迎回来 💕
        </h1>
        <p className="text-gray-600">
          今天是 {dayjs().format('YYYY年MM月DD日')}，记录美好时光
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* 日记总数 */}
        <div className="card bg-gradient-to-br from-pink-500 to-rose-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">日记总数</p>
              <p className="text-3xl font-bold mt-1">{diaryCount}</p>
            </div>
            <BookOpen className="h-10 w-10 text-white/80" />
          </div>
        </div>

        {/* 恋爱天数 */}
        <div className="card bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">恋爱天数</p>
              <p className="text-3xl font-bold mt-1">{loveDays}</p>
            </div>
            <Heart className="h-10 w-10 text-white/80" />
          </div>
        </div>

        {/* 下一个纪念日/倒计时 */}
        <div className="card bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">
                {nextCountdown ? nextCountdown.title : '下一个纪念日'}
              </p>
              <p className="text-3xl font-bold mt-1">
                {nextCountdown ? `${nextCountdown.absoluteDays}天` : '--'}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-white/80" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/diaries/new"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-all duration-200 group"
          >
            <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <Plus className="h-5 w-5 text-pink-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">写日记</p>
              <p className="text-sm text-gray-600">记录今天</p>
            </div>
          </Link>

          <Link
            to="/photos"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <ImageIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">相册</p>
              <p className="text-sm text-gray-600">管理照片</p>
            </div>
          </Link>

          <Link
            to="/countdowns"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition-all duration-200 group"
          >
            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">重要日</p>
              <p className="text-sm text-gray-600">重要日子</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent diaries */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">最近日记</h2>
          <Link
            to="/diaries"
            className="text-pink-600 hover:text-pink-500 text-sm font-medium"
          >
            查看全部 →
          </Link>
        </div>

        {recentDiaries.length > 0 ? (
          <div className="space-y-3">
            {recentDiaries.map((diary) => (
              <Link
                key={diary._id}
                to={`/diaries/${diary._id}/edit`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-all duration-200"
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{getMoodEmoji(diary.mood)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{diary.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {diary.content.replace(/[#*`]/g, '').substring(0, 80)}...
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {dayjs(diary.date).format('YYYY-MM-DD')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📝</div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">还没有日记</h3>
            <p className="text-sm text-gray-500 mb-4">开始记录美好时光吧</p>
            <Link
              to="/diaries/new"
              className="btn-primary inline-flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              写第一篇日记
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
