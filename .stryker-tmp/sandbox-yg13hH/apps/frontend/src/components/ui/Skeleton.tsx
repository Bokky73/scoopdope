import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:from-gray-700 bg-[length:200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm" aria-busy="true">
      <Skeleton height={200} className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton height={24} width="80%" />
        <Skeleton height={16} width="60%" />
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="90%" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton height={20} width={80} variant="rectangular" />
          <Skeleton height={32} width={100} variant="rectangular" />
        </div>
      </div>
    </div>
  );
};

export const CourseListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading courses">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const CourseDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" aria-busy="true" role="status">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton height={40} width="70%" />
        <Skeleton height={20} width="40%" />
        <div className="flex gap-4 mt-4">
          <Skeleton height={24} width={100} variant="rectangular" />
          <Skeleton height={24} width={100} variant="rectangular" />
          <Skeleton height={24} width={100} variant="rectangular" />
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton height={400} className="w-full" />
          <div className="space-y-3">
            <Skeleton height={24} width="50%" />
            <Skeleton height={16} width="100%" />
            <Skeleton height={16} width="95%" />
            <Skeleton height={16} width="98%" />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton height={200} className="w-full" />
            <Skeleton height={48} className="w-full" />
            <Skeleton height={20} width="60%" />
            <Skeleton height={20} width="70%" />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <Skeleton height={32} width="30%" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <Skeleton height={24} width="60%" />
            <Skeleton height={16} width="40%" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" aria-busy="true" role="status">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton height={36} width="40%" />
        <Skeleton height={20} width="60%" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-6 space-y-3">
            <Skeleton height={20} width="60%" />
            <Skeleton height={32} width="40%" />
            <Skeleton height={16} width="80%" />
          </div>
        ))}
      </div>

      {/* Progress section */}
      <div className="space-y-4">
        <Skeleton height={28} width="30%" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex gap-4">
                <Skeleton height={80} width={80} variant="rectangular" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={20} width="80%" />
                  <Skeleton height={16} width="60%" />
                  <Skeleton height={8} className="w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
