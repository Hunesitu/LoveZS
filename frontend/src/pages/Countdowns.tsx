import React, { useEffect, useState } from 'react';
import { countdownService, Countdown, CountdownDirection, CountdownType } from '../services/countdown';
import { Plus, Trash2, Calendar as CalendarIcon, Heart, Clock } from 'lucide-react';
import dayjs from 'dayjs';

const Countdowns: React.FC = () => {
  const [anniversaries, setAnniversaries] = useState<Countdown[]>([]);
  const [upcoming, setUpcoming] = useState<Countdown[]>([]);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [direction, setDirection] = useState<CountdownDirection>('countup');
  const [type, setType] = useState<CountdownType>('anniversary');
  const [isLoading, setIsLoading] = useState(false);

  // 里程碑天数
  const milestones = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 3000, 5000, 10000];

  // 计算下一个里程碑
  const getNextMilestone = (currentDays: number) => {
    return milestones.find(m => m > currentDays) || milestones[milestones.length - 1];
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 获取纪念日（已过去的，countup）
      const annivRes = await countdownService.getCountdowns({ direction: 'countup' });
      setAnniversaries(annivRes.data.countdowns || []);

      // 获取倒计时（未来的，countdown）
      const upcomRes = await countdownService.getCountdowns({ direction: 'countdown' });
      setUpcoming(upcomRes.data.countdowns || []);
    } catch (err) {
      console.error('加载纪念日失败', err);
    }
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title || !targetDate) return;

    setIsLoading(true);
    try {
      await countdownService.createCountdown({
        title,
        targetDate,
        type,
        direction,
        isRecurring: false,
      });
      setTitle('');
      setTargetDate('');
      setDirection('countup');
      setType('anniversary');
      loadData();
    } catch (err: any) {
      console.error('创建纪念日失败', err);
      const errorMsg = err.response?.data?.message || err.message || '创建失败';
      alert(`创建失败: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除吗？')) return;
    try {
      await countdownService.deleteCountdown(id);
      loadData();
    } catch (err) {
      console.error('删除失败', err);
      alert('删除失败');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2 text-pink-500" />
          纪念日
        </h1>
        <p className="text-gray-600 mt-1">
          记录那些重要的日子 - 已经过的和即将到来的
        </p>
      </div>

      {/* 创建表单 */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">添加新纪念日</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              className="input-field"
              placeholder="如：她的生日、相识纪念日"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              className="input-field"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              className="input-field"
              value={direction}
              onChange={(e) => setDirection(e.target.value as CountdownDirection)}
            >
              <option value="countup">📅 已过去（纪念日）</option>
              <option value="countdown">⏰ 倒计时（即将到来）</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" type="submit" disabled={isLoading}>
              {isLoading ? '创建中...' : (
                <>
                  <Plus className="inline h-4 w-4 mr-2" />
                  添加
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 纪念日 - 已过去的 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-500" />
            纪念日
            <span className="ml-2 text-sm font-normal text-gray-500">（已过去）</span>
          </h2>

          {/* 里程碑倒计时卡片 */}
          {anniversaries.length > 0 && (() => {
            // 找到最早的纪念日（恋爱天数最多的）
            const longestAnniversary = anniversaries.reduce((prev, curr) =>
              curr.absoluteDays! > prev.absoluteDays! ? curr : prev
            );
            const currentDays = longestAnniversary.absoluteDays!;
            const nextMilestone = getNextMilestone(currentDays);
            const daysToMilestone = nextMilestone - currentDays;

            return (
              <div className="card mb-4 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <span className="text-xl mr-2">🏆</span>
                      下一个里程碑
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      已在一起 <span className="font-bold text-pink-600">{currentDays}</span> 天
                    </p>
                    <div className="mt-3 flex items-center">
                      <span className="text-2xl mr-2">🎯</span>
                      <span className="text-lg font-bold text-purple-600">
                        距离 {nextMilestone} 天还有 {daysToMilestone} 天
                      </span>
                    </div>
                    {/* 进度条 */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((currentDays / nextMilestone) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {Math.round((currentDays / nextMilestone) * 100)}% 完成
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {anniversaries.length > 0 ? (
            <div className="space-y-3">
              {anniversaries.map((c) => (
                <div key={c._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{c.title}</h3>
                      <p className="text-sm text-gray-500">
                        {dayjs(c.targetDate).format('YYYY年MM月DD日')}
                      </p>
                      <div className="mt-2 flex items-center">
                        <span className="text-2xl mr-2">💕</span>
                        <span className="text-lg font-bold text-pink-600">
                          已在一起 {c.absoluteDays} 天
                        </span>
                      </div>
                    </div>
                    <button
                      className="p-1 text-gray-400 hover:text-red-600 ml-2"
                      onClick={() => handleDelete(c._id)}
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <Heart className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">还没有添加纪念日</p>
            </div>
          )}
        </div>

        {/* 倒计时 - 即将到来的 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-amber-500" />
            倒计时
            <span className="ml-2 text-sm font-normal text-gray-500">（即将到来）</span>
          </h2>
          <div className="space-y-3">
            {upcoming.length > 0 ? (
              upcoming.map((c) => (
                <div key={c._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{c.title}</h3>
                      <p className="text-sm text-gray-500">
                        {dayjs(c.targetDate).format('YYYY年MM月DD日')}
                      </p>
                      <div className="mt-2 flex items-center">
                        <span className="text-2xl mr-2">🎉</span>
                        <span className="text-lg font-bold text-amber-600">
                          还有 {c.days} 天
                        </span>
                      </div>
                    </div>
                    <button
                      className="p-1 text-gray-400 hover:text-red-600 ml-2"
                      onClick={() => handleDelete(c._id)}
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-8">
                <Clock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">还没有添加倒计时</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdowns;
