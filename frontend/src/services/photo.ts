import api from './api';

// 获取完整的图片 URL
// 在开发模式下，代理会将 /uploads/* 和 /api/* 转发到后端
export const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // 直接返回相对路径，由代理处理
  return url;
};

export interface Album {
  _id: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoItem {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
  album: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  compressedUrl?: string;
}

export const photoService = {
  async getAlbums(): Promise<{ success: boolean; data: { albums: Album[] } }> {
    const res = await api.get('/photos/albums');
    return res.data;
  },

  async createAlbum(payload: { name: string; description?: string }) {
    const res = await api.post('/photos/albums', payload);
    return res.data;
  },

  async updateAlbum(id: string, payload: { name?: string; description?: string }) {
    const res = await api.put(`/photos/albums/${id}`, payload);
    return res.data;
  },

  async deleteAlbum(id: string) {
    const res = await api.delete(`/photos/albums/${id}`);
    return res.data;
  },

  async uploadPhotos(formData: FormData, onProgress?: (ev: any) => void) {
    const res = await api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    });
    return res.data;
  },

  async getPhotos(params?: { albumId?: string; page?: number; limit?: number }) {
    const res = await api.get('/photos', { params });
    return res.data;
  },

  async deletePhoto(id: string) {
    const res = await api.delete(`/photos/${id}`);
    return res.data;
  },

  async exportBackup() {
    const res = await api.get('/backup/export', { responseType: 'blob' as const });
    return res.data;
  }
};
