import React, { useState, useRef } from 'react';
import { photoService } from '../services/photo';

interface Props {
  albumId: string;
  onUploaded?: (photos: any[]) => void;
}

const PhotoUploader: React.FC<Props> = ({ albumId, onUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...arr].slice(0, 50));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const upload = async () => {
    if (files.length === 0) return;
    const form = new FormData();
    form.append('albumId', albumId);
    files.forEach(f => form.append('photos', f));

    try {
      const res = await photoService.uploadPhotos(form, (ev: ProgressEvent) => {
        const percent = Math.round((ev.loaded * 100) / (ev.total || 1));
        setProgressMap({ overall: percent });
      });
      setFiles([]);
      setProgressMap({});
      onUploaded?.(res.data.photos || []);
    } catch (err) {
      console.error('上传错误', err);
      alert('上传失败，请重试');
    }
  };

  return (
    <div className="card p-4">
      <div
        className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-gray-600">拖拽图片到此处，或点击选择（最多 50 张）</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {files.map((f, idx) => {
              const url = URL.createObjectURL(f);
              return (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt={f.name}
                    className="w-full h-24 object-cover rounded"
                    loading="lazy"
                    onLoad={() => { try { URL.revokeObjectURL(url); } catch { /* noop */ } }}
                  />
                  <div className="text-xs truncate mt-1">{f.name}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">{files.length} 张待上传</div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary" onClick={() => setFiles([])}>清空</button>
              <button className="btn-primary" onClick={upload}>开始上传</button>
            </div>
          </div>
          {progressMap.overall != null && (
            <div className="mt-2">
              <div className="w-full bg-gray-100 rounded h-2">
                <div className="bg-primary-500 h-2 rounded" style={{ width: `${progressMap.overall}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">{progressMap.overall}%</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;

