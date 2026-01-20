import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { diaryService, Diary } from '../services/diary';
import { getImageUrl } from '../services/photo';
import { Plus, Search, Filter, Calendar, Tag, Trash2, Edit } from 'lucide-react';
import dayjs from 'dayjs';

const Diaries: React.FC = () => {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [filteredDiaries, setFilteredDiaries] = useState<Diary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  useEffect(() => {
    loadDiaries();
    loadCategoriesAndTags();
  }, []);

  useEffect(() => {
    filterDiaries();
  }, [diaries, searchTerm, selectedCategory, selectedMood]);

  const loadDiaries = async () => {
    try {
      const response = await diaryService.getDiaries();
      setDiaries(response.data.diaries);
    } catch (error) {
      console.error('Failed to load diaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        diaryService.getCategories(),
        diaryService.getTags(),
      ]);
      setCategories(categoriesResponse.data.categories);
      setTags(tagsResponse.data.tags);
    } catch (error) {
      console.error('Failed to load categories and tags:', error);
    }
  };

  const filterDiaries = () => {
    let filtered = diaries;

    if (searchTerm) {
      filtered = filtered.filter(diary =>
        diary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diary.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diary.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(diary => diary.category === selectedCategory);
    }

    if (selectedMood) {
      filtered = filtered.filter(diary => diary.mood === selectedMood);
    }

    setFilteredDiaries(filtered);
  };

  const handleDeleteDiary = async (id: string) => {
    if (!window.confirm('确定要删除这篇日记吗？此操作不可撤销。')) {
      return;
    }

    try {
      await diaryService.deleteDiary(id);
      setDiaries(diaries.filter(diary => diary._id !== id));
    } catch (error) {
      console.error('Failed to delete diary:', error);
      alert('删除失败，请稍后重试');
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

  const getMoodColor = (mood: string) => {
    const moodColors: { [key: string]: string } = {
      happy: 'mood-happy',
      sad: 'mood-sad',
      excited: 'mood-excited',
      calm: 'mood-calm',
      angry: 'mood-angry',
      tired: 'mood-tired',
      loved: 'mood-loved',
      grateful: 'mood-grateful',
    };
    return moodColors[mood] || 'mood-happy';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的日记</h1>
          <p className="mt-1 text-gray-600">记录生活的点点滴滴</p>
        </div>
        <Link
          to="/diaries/new"
          className="mt-4 sm:mt-0 btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          写日记
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索日记..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="">所有分类</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="input-field"
          >
            <option value="">所有心情</option>
            <option value="happy">开心 😊</option>
            <option value="sad">伤心 😢</option>
            <option value="excited">兴奋 🤩</option>
            <option value="calm">平静 😌</option>
            <option value="angry">生气 😠</option>
            <option value="tired">疲惫 😴</option>
            <option value="loved">相爱 🥰</option>
            <option value="grateful">感恩 🙏</option>
          </select>

          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              共 {filteredDiaries.length} 篇日记
            </span>
          </div>
        </div>
      </div>

      {/* Diaries list */}
      {filteredDiaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiaries.map((diary) => (
            <div key={diary._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getMoodEmoji(diary.mood)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {diary.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dayjs(diary.date).format('YYYY-MM-DD')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/diaries/${diary._id}/edit`}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                    title="编辑"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteDiary(diary._id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-700 text-sm line-clamp-2">
                  {diary.content.replace(/[#*`]/g, '').substring(0, 100)}...
                </p>
              </div>

              {/* 显示关联的照片 */}
              {diary.attachedPhotos && diary.attachedPhotos.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {diary.attachedPhotos.slice(0, 3).map((photo) => (
                      <img
                        key={photo._id}
                        src={getImageUrl(photo.url || photo.thumbnailUrl || '')}
                        alt={photo.originalName}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                    {diary.attachedPhotos.length > 3 && (
                      <div className="w-16 h-16 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500 bg-gray-50">
                        +{diary.attachedPhotos.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    {diary.category}
                  </span>
                  {diary.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                {diary.attachedPhotos && diary.attachedPhotos.length > 0 && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <span className="mr-1">📷</span>
                    {diary.attachedPhotos.length}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory || selectedMood ? '没有找到匹配的日记' : '还没有日记'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory || selectedMood
                ? '尝试调整搜索条件或清除筛选'
                : '开始写下你们的第一篇日记吧'
              }
            </p>
            <Link to="/diaries/new" className="btn-primary inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              写第一篇日记
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diaries;