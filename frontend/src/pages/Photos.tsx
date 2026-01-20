import React, { useEffect, useState } from 'react';
import { photoService, Album, getImageUrl } from '../services/photo';
import PhotoUploader from '../components/PhotoUploader';
import CreateAlbum from '../components/CreateAlbum';
import { Trash2, Folder, Image } from 'lucide-react';
import dayjs from 'dayjs';

const Photos: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadAlbums = async () => {
    try {
      const res = await photoService.getAlbums();
      setAlbums(res.data.albums);
      if (res.data.albums.length > 0 && !selectedAlbum) {
        setSelectedAlbum(res.data.albums[0]._id);
        loadPhotos(res.data.albums[0]._id);
      }
    } catch (err) {
      console.error('加载相册失败', err);
      showMessage('error', '加载相册失败');
    }
  };

  const loadPhotos = async (albumId: string) => {
    console.log('loadPhotos called with albumId:', albumId);
    try {
      const res = await photoService.getPhotos({ albumId, limit: 50 });
      console.log('loadPhotos response:', res.data);
      setPhotos(res.data.photos);
      console.log('Photos state after setPhotos:', res.data.photos);
    } catch (err) {
      console.error('加载照片失败', err);
      showMessage('error', '加载照片失败');
    }
  };

  const handleUploaded = (newPhotos: any[]) => {
    setPhotos(prev => [...newPhotos, ...prev]);
  };

  const handleDeleteAlbum = async (albumId: string, albumName: string) => {
    // Check if it's the default album
    const album = albums.find(a => a._id === albumId);
    if (album?.isDefault) {
      showMessage('error', '不能删除默认相册');
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      `确定要删除相册"${albumName}"吗？\n\n此操作将删除相册中的所有照片，且无法恢复。`
    );
    if (!confirmed) return;

    try {
      await photoService.deleteAlbum(albumId);
      setAlbums(prev => prev.filter(a => a._id !== albumId));
      showMessage('success', '相册删除成功');

      // If the deleted album was selected, select another one
      if (selectedAlbum === albumId) {
        const remainingAlbums = albums.filter(a => a._id !== albumId);
        if (remainingAlbums.length > 0) {
          setSelectedAlbum(remainingAlbums[0]._id);
          loadPhotos(remainingAlbums[0]._id);
        } else {
          setSelectedAlbum(null);
          setPhotos([]);
        }
      }
    } catch (err: any) {
      console.error('删除相册失败', err);
      showMessage('error', err.response?.data?.message || '删除相册失败');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const confirmed = window.confirm('确定要删除这张照片吗？');
    if (!confirmed) return;

    try {
      await photoService.deletePhoto(photoId);
      setPhotos(prev => prev.filter(p => p._id !== photoId));
      showMessage('success', '照片删除成功');
    } catch (err: any) {
      console.error('删除照片失败', err);
      showMessage('error', '删除照片失败');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的相册</h1>
          <p className="text-gray-600">管理你的相册与照片</p>
        </div>
        <div>
          <button
            className="btn-secondary"
            onClick={async () => {
              try {
                const blob = await photoService.exportBackup();
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `lovezs-backup-${Date.now()}.zip`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error('导出备份失败', err);
                showMessage('error', '导出失败，请稍后重试');
              }
            }}
          >
            导出备份
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Album Sidebar */}
        <div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center">
                <Folder className="h-4 w-4 mr-1" />
                相册
              </h3>
              <div>
                <button
                  className="btn-secondary text-sm"
                  onClick={async () => {
                    try {
                      const res = await photoService.createAlbum({ name: '默认相册' });
                      setAlbums(prev => [res.data.album, ...prev]);
                      setSelectedAlbum(res.data.album._id);
                      loadPhotos(res.data.album._id);
                      showMessage('success', '相册创建成功');
                    } catch (err) {
                      console.error('创建默认相册失败', err);
                      showMessage('error', '创建相册失败');
                    }
                  }}
                >
                  快速创建
                </button>
              </div>
            </div>
            <CreateAlbum
              onCreated={(alb) => {
                setAlbums(prev => [alb, ...prev]);
                setSelectedAlbum(alb._id);
                loadPhotos(alb._id);
              }}
            />
            <div className="space-y-2 mt-3">
              {albums.map(a => (
                <div
                  key={a._id}
                  className={`group relative flex items-center ${
                    selectedAlbum === a._id ? 'bg-primary-50 rounded' : ''
                  }`}
                >
                  <button
                    onClick={() => { setSelectedAlbum(a._id); loadPhotos(a._id); }}
                    className={`flex-1 text-left px-3 py-2 rounded ${
                      selectedAlbum === a._id ? 'text-primary-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium truncate">{a.name}</div>
                    <div className="text-xs text-gray-500">{dayjs(a.createdAt).format('YYYY-MM-DD')}</div>
                  </button>
                  {!a.isDefault && (
                    <button
                      onClick={() => handleDeleteAlbum(a._id, a.name)}
                      className="absolute right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-50"
                      title="删除相册"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {albums.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  暂无相册，创建一个吧
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="md:col-span-3">
          {selectedAlbum ? (
            <>
              <PhotoUploader albumId={selectedAlbum} onUploaded={handleUploaded} />

              <div className="mt-6">
                <h3 className="font-medium mb-4 flex items-center">
                  <Image className="h-4 w-4 mr-1" />
                  照片 ({photos.length})
                </h3>
                {/* Debug info */}
                <div className="mb-2 p-2 bg-yellow-100 text-xs">
                  DEBUG: photos.length = {photos.length}, first photo: {JSON.stringify(photos[0])}
                </div>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map(p => {
                      const src = getImageUrl(p.compressedUrl || p.thumbnailUrl || p.url);
                      console.log('Photo URL:', { src, original: p.url, thumbnail: p.thumbnailUrl });
                      return (
                        <div key={p._id} className="group relative rounded overflow-hidden shadow-sm bg-gray-100" style={{ minHeight: '200px' }}>
                          <img
                            src={src}
                            alt={p.originalName}
                            className="w-full h-48 object-cover"
                            onLoad={() => console.log('Image loaded:', src)}
                            onError={(e) => {
                              console.error('Image load error:', e, src);
                              (e.target as HTMLImageElement).className = 'w-full h-48 object-cover bg-red-100';
                              (e.target as HTMLImageElement).alt = '加载失败';
                            }}
                          />
                          <div className="p-2 text-sm text-gray-700 truncate">{p.originalName}</div>
                          <button
                            onClick={() => handleDeletePhoto(p._id)}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow"
                            title="删除照片"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="card py-12 text-center text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>暂无照片，上传一些美好回忆吧</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card py-12 text-center text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>请先创建或选择一个相册</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Photos;
