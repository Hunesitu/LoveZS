import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { diaryService, Diary, CreateDiaryData, Photo } from '../services/diary';
import { photoService, getImageUrl } from '../services/photo';
import { Save, ArrowLeft, Calendar, Tag, Smile, ImagePlus, X, Upload } from 'lucide-react';
import dayjs from 'dayjs';

const DiaryEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CreateDiaryData>({
    title: '',
    content: '',
    mood: 'happy',
    category: '',
    tags: [],
    date: dayjs().format('YYYY-MM-DD'),
    attachedPhotos: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // 照片相关状态
  const [attachedPhotos, setAttachedPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const tags = formData.tags ?? [];

  useEffect(() => {
    loadAlbums();
    if (isEditing) {
      loadDiary();
    }
  }, [id, isEditing]);

  const loadAlbums = async () => {
    try {
      const response = await photoService.getAlbums();
      setAlbums(response.data.albums);
      if (response.data.albums.length > 0) {
        setSelectedAlbumId(response.data.albums[0]._id);
        loadAlbumPhotos(response.data.albums[0]._id);
      }
    } catch (error) {
      console.error('Failed to load albums:', error);
    }
  };

  const loadAlbumPhotos = async (albumId: string) => {
    try {
      const response = await photoService.getPhotos({ albumId, limit: 100 });
      setAlbumPhotos(response.data.photos);
    } catch (error) {
      console.error('Failed to load album photos:', error);
    }
  };

  const loadDiary = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await diaryService.getDiary(id);
      const diary = response.data.diary;
      setFormData({
        title: diary.title,
        content: diary.content,
        mood: diary.mood,
        category: diary.category,
        tags: diary.tags,
        date: dayjs(diary.date).format('YYYY-MM-DD'),
        attachedPhotos: diary.attachedPhotos?.map(p => p._id) || [],
      });
      setAttachedPhotos(diary.attachedPhotos || []);
    } catch (error) {
      console.error('Failed to load diary:', error);
      setError('加载日记失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim() || !formData.category.trim()) {
      setError('请填写标题、内容和分类');
      return;
    }

    setIsSaving(true);
    try {
      // 先保存日记
      let savedDiary;
      if (isEditing && id) {
        const response = await diaryService.updateDiary(id, formData);
        savedDiary = response.data.diary;
      } else {
        const response = await diaryService.createDiary(formData);
        savedDiary = response.data.diary;
      }

      // 如果有照片要关联，且照片ID还没在attachedPhotos中
      const currentPhotoIds = attachedPhotos.map(p => p._id);
      const newPhotoIds = formData.attachedPhotos?.filter(id => !currentPhotoIds.includes(id)) || [];

      if (newPhotoIds.length > 0 && savedDiary) {
        await diaryService.attachPhotos(savedDiary._id, newPhotoIds);
      }

      navigate('/diaries');
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 添加照片到日记
  const handleAttachPhoto = (photo: Photo) => {
    if (attachedPhotos.some(p => p._id === photo._id)) {
      return; // 已存在
    }
    const newPhotos = [...attachedPhotos, photo];
    setAttachedPhotos(newPhotos);
    setFormData({
      ...formData,
      attachedPhotos: newPhotos.map(p => p._id),
    });
  };

  // 移除照片
  const handleRemovePhoto = (photoId: string) => {
    const newPhotos = attachedPhotos.filter(p => p._id !== photoId);
    setAttachedPhotos(newPhotos);
    setFormData({
      ...formData,
      attachedPhotos: newPhotos.map(p => p._id),
    });
  };

  // 上传新照片
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('albumId', selectedAlbumId);
      Array.from(files).forEach(file => {
        formData.append('photos', file);
      });

      // 直接上传到相册
      const uploadFn = photoService.uploadPhotos;
      // 注意：这里需要特殊处理，因为uploadPhotos需要不同的调用方式
      // 为简化，我们假设用户先在相册里上传，然后在这里选择
      alert('请先在"相册"页面上传照片，然后在这里选择关联到日记');
    } catch (error) {
      console.error('Upload photo error:', error);
      alert('上传失败');
    } finally {
      setIsUploading(false);
      // 重置input
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/diaries')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? '编辑日记' : '写日记'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? '修改你们的美好回忆' : '记录今天的美好时刻'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            标题
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field text-lg font-medium"
            placeholder="给今天一个温暖的标题..."
            required
          />
        </div>

        {/* Date and Mood */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              日期
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
              <Smile className="h-4 w-4 inline mr-1" />
              心情
            </label>
            <select
              id="mood"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value as Diary['mood'] })}
              className="input-field"
            >
              <option value="happy">开心 😊</option>
              <option value="sad">伤心 😢</option>
              <option value="excited">兴奋 🤩</option>
              <option value="calm">平静 😌</option>
              <option value="angry">生气 😠</option>
              <option value="tired">疲惫 😴</option>
              <option value="loved">被爱 🥰</option>
              <option value="grateful">感激 🙏</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            分类
          </label>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input-field"
            placeholder="如：约会、旅行、日常等"
            required
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImagePlus className="h-4 w-4 inline mr-1" />
            照片
          </label>

          {/* 已关联的照片 */}
          {attachedPhotos.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedPhotos.map((photo) => (
                <div key={photo._id} className="relative group">
                  <img
                    src={getImageUrl(photo.url)}
                    alt={photo.originalName}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-pink-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo._id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 添加照片按钮 */}
          <button
            type="button"
            onClick={() => setShowPhotoSelector(!showPhotoSelector)}
            className="btn-secondary inline-flex items-center"
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            {attachedPhotos.length > 0 ? '添加更多照片' : '添加照片'}
          </button>

          {/* 照片选择器 */}
          {showPhotoSelector && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">从相册选择照片</h3>
                <button
                  type="button"
                  onClick={() => setShowPhotoSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 相册选择 */}
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">选择相册</label>
                <select
                  value={selectedAlbumId}
                  onChange={(e) => {
                    setSelectedAlbumId(e.target.value);
                    loadAlbumPhotos(e.target.value);
                  }}
                  className="input-field text-sm"
                >
                  {albums.map(album => (
                    <option key={album._id} value={album._id}>
                      {album.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 照片列表 */}
              {albumPhotos.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {albumPhotos.map((photo) => (
                    <div
                      key={photo._id}
                      onClick={() => handleAttachPhoto(photo)}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        attachedPhotos.some(p => p._id === photo._id)
                          ? 'border-pink-500 ring-2 ring-pink-200'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(photo.url || photo.thumbnailUrl || '')}
                        alt={photo.originalName}
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  该相册还没有照片，请先在"相册"页面上传
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="h-4 w-4 inline mr-1" />
            标签
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-pink-600 hover:text-pink-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              className="input-field flex-1"
              placeholder="添加标签..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary"
            >
              添加
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容
          </label>
          <div data-color-mode="light" className="border border-gray-300 rounded-lg">
            <MDEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value || '' })}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={false}
              textareaProps={{
                placeholder: '写下你们的故事...\n\n支持 Markdown 格式：\n- **粗体** *斜体*\n- `代码`\n- 列表\n- 等等...',
              }}
              height={400}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default DiaryEditor;
