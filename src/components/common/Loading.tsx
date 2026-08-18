import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  message = '불러오는 중입니다...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-stone-500">
      <div
        className={`${sizeClasses[size]} rounded-full border-stone-300 border-t-stone-900 animate-spin mb-3`}
      />
      {message && <p className="text-sm font-medium tracking-tight text-stone-600">{message}</p>}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs animate-pulse flex flex-col justify-between">
      <div>
        <div className="w-full h-48 bg-stone-200 rounded-lg mb-4" />
        <div className="w-20 h-5 bg-stone-200 rounded-full mb-3" />
        <div className="w-4/5 h-6 bg-stone-200 rounded-md mb-2" />
        <div className="w-full h-4 bg-stone-100 rounded mb-1" />
        <div className="w-2/3 h-4 bg-stone-100 rounded mb-4" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-stone-200" />
          <div className="w-24 h-4 bg-stone-200 rounded" />
        </div>
        <div className="w-16 h-4 bg-stone-100 rounded" />
      </div>
    </div>
  );
};
