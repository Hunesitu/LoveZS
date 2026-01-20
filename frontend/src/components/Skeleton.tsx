import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 rounded';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%')
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// 日记列表骨架屏
export const DiaryListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow p-4">
        <div className="flex items-start space-x-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={16} />
            <Skeleton width="90%" height={16} />
            <Skeleton width="80%" height={16} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// 照片网格骨架屏
export const PhotoGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="aspect-square">
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </div>
    ))}
  </div>
);

// 倒计时列表骨架屏
export const CountdownListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow p-4">
        <Skeleton width="70%" height={28} className="mb-2" />
        <Skeleton width="50%" height={20} className="mb-3" />
        <div className="flex space-x-2">
          <Skeleton width={60} height={60} variant="rectangular" />
          <Skeleton width={60} height={60} variant="rectangular" />
          <Skeleton width={60} height={60} variant="rectangular" />
        </div>
      </div>
    ))}
  </div>
);

// 个人资料骨架屏
export const ProfileSkeleton: React.FC = () => (
  <div className="max-w-2xl mx-auto">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton variant="circular" width={100} height={100} />
        <div className="flex-1 space-y-3">
          <Skeleton width="50%" height={28} />
          <Skeleton width="70%" height={18} />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton width="30%" height={20} />
        <Skeleton width="100%" height={40} />
        <Skeleton width="30%" height={20} />
        <Skeleton width="100%" height={40} />
      </div>
    </div>
  </div>
);

// 仪表板骨架屏
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* 欢迎卡片 */}
    <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-lg p-6 text-white">
      <Skeleton width="40%" height={28} className="bg-white/30" />
      <Skeleton width="60%" height={18} className="bg-white/20 mt-2" />
    </div>

    {/* 统计卡片 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <Skeleton width={40} height={40} variant="circular" className="mb-4" />
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={28} className="mt-2" />
        </div>
      ))}
    </div>

    {/* 最近活动 */}
    <div className="bg-white rounded-lg shadow p-6">
      <Skeleton width="30%" height={24} className="mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton width="70%" height={16} />
              <Skeleton width="40%" height={14} className="mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 卡片骨架屏
export const CardSkeleton: React.FC<{ hasImage?: boolean }> = ({ hasImage = false }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    {hasImage && <Skeleton width="100%" height={200} variant="rectangular" />}
    <div className="p-4 space-y-3">
      <Skeleton width="80%" height={24} />
      <Skeleton width="100%" height={16} />
      <Skeleton width="90%" height={16} />
      <div className="flex space-x-2 pt-2">
        <Skeleton width={60} height={24} variant="rectangular" />
        <Skeleton width={60} height={24} variant="rectangular" />
      </div>
    </div>
  </div>
);

export default Skeleton;
