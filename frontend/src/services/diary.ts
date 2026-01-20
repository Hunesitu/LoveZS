import api from './api';

export interface Photo {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimetype: string;
  album: string;
}

export interface Diary {
  _id: string;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'angry' | 'tired' | 'loved' | 'grateful';
  category: string;
  tags: string[];
  date: string;
  // 关联的照片
  attachedPhotos?: Photo[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiaryData {
  title: string;
  content: string;
  mood: Diary['mood'];
  category: string;
  tags?: string[];
  date?: string;
  attachedPhotos?: string[];
}

export interface DiariesResponse {
  success: boolean;
  data: {
    diaries: Diary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const diaryService = {
  async getDiaries(params?: {
    page?: number;
    limit?: number;
    category?: string;
    mood?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<DiariesResponse> {
    const response = await api.get('/diaries', { params });
    return response.data;
  },

  async getDiary(id: string): Promise<{ success: boolean; data: { diary: Diary } }> {
    const response = await api.get(`/diaries/${id}`);
    return response.data;
  },

  async createDiary(data: CreateDiaryData): Promise<{ success: boolean; message: string; data: { diary: Diary } }> {
    const response = await api.post('/diaries', data);
    return response.data;
  },

  async updateDiary(id: string, data: Partial<CreateDiaryData>): Promise<{ success: boolean; message: string; data: { diary: Diary } }> {
    const response = await api.put(`/diaries/${id}`, data);
    return response.data;
  },

  async deleteDiary(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/diaries/${id}`);
    return response.data;
  },

  async getCategories(): Promise<{ success: boolean; data: { categories: string[] } }> {
    const response = await api.get('/diaries/meta/categories');
    return response.data;
  },

  async getTags(): Promise<{ success: boolean; data: { tags: string[] } }> {
    const response = await api.get('/diaries/meta/tags');
    return response.data;
  },

  // 照片关联API
  async attachPhotos(diaryId: string, photoIds: string[]): Promise<{ success: boolean; message: string; data: { diary: Diary } }> {
    const response = await api.post(`/diaries/${diaryId}/photos`, { photoIds });
    return response.data;
  },

  async removePhoto(diaryId: string, photoId: string): Promise<{ success: boolean; message: string; data: { diary: Diary } }> {
    const response = await api.delete(`/diaries/${diaryId}/photos/${photoId}`);
    return response.data;
  },
};
