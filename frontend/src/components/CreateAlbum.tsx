import React, { useState } from 'react';
import { photoService } from '../services/photo';

interface Props {
  onCreated: (album: any) => void;
}

const CreateAlbum: React.FC<Props> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      alert('请填写相册名称');
      return;
    }
    setIsLoading(true);
    try {
      const res = await photoService.createAlbum({ name, description });
      onCreated(res.data.album);
      setName('');
      setDescription('');
    } catch (err: any) {
      console.error('创建相册失败', err);
      const errorMsg = err.response?.data?.message || err.message || '创建相册失败';
      alert(`创建失败: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">相册名称</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="例如：旅行、约会" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">描述（可选）</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="写一些相册描述..." />
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading ? '创建中...' : '创建相册'}
      </button>
    </form>
  );
};

export default CreateAlbum;

