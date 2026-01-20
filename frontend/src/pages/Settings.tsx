import React, { useState } from 'react';
import { Download, Trash2, Settings as SettingsIcon, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Settings: React.FC = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/backup/export', { responseType: 'blob' });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lovezs-backup-${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showMessage('success', '备份导出成功');
    } catch (error) {
      console.error('Export backup error:', error);
      showMessage('error', '备份导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ 危险操作！\n\n确定要清除所有数据吗？\n这将删除所有日记、照片、纪念日等数据，且不可恢复！\n\n请输入 "DELETE ALL" 来确认。')) {
      return;
    }

    const confirmation = window.prompt('请输入 "DELETE ALL" 来确认：');
    if (confirmation !== 'DELETE ALL') {
      alert('操作已取消');
      return;
    }

    if (!window.confirm('最后确认！所有数据将被永久删除！')) {
      return;
    }

    try {
      // 这里可以调用后端API清除所有数据
      // await api.delete('/data/all');
      showMessage('success', '数据清除功能需要后端API支持');
      // 实际使用时，上面的API调用应该被取消注释
    } catch (error) {
      console.error('Clear data error:', error);
      showMessage('error', '数据清除失败');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
        <SettingsIcon className="h-6 w-6 mr-2 text-gray-600" />
        设置
      </h1>
      <p className="text-gray-600 mb-6">管理你的应用数据和备份</p>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* 数据备份 */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">数据备份</h2>
        <p className="text-gray-600 text-sm mb-4">
          导出所有数据（日记、照片、纪念日等）到本地备份文件
        </p>
        <button
          onClick={handleExportBackup}
          disabled={isExporting}
          className="btn-primary inline-flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? '导出中...' : '导出备份'}
        </button>
      </div>

      {/* 应用信息 */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">关于</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>应用名称</span>
            <span className="font-medium text-gray-900">LoveZs</span>
          </div>
          <div className="flex justify-between">
            <span>版本</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>用途</span>
            <span className="font-medium text-gray-900">记录美好时光 💕</span>
          </div>
        </div>
      </div>

      {/* 危险区域 */}
      <div className="card border-red-200">
        <h2 className="text-lg font-semibold text-red-900 mb-4">危险区域</h2>
        <p className="text-gray-600 text-sm mb-4">
          这些操作不可撤销，请谨慎操作
        </p>
        <button
          onClick={handleClearAllData}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center text-sm font-medium transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          清除所有数据
        </button>
        <p className="text-xs text-gray-500 mt-2">
          注意：此功能需要后端API支持，目前仅作展示
        </p>
      </div>
    </div>
  );
};

export default Settings;
