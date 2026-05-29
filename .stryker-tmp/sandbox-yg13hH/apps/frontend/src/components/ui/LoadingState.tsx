import React from 'react';
import {
  CourseListSkeleton,
  CourseDetailSkeleton,
  DashboardSkeleton,
} from './Skeleton';

interface LoadingStateProps {
  type: 'course-list' | 'course-detail' | 'dashboard' | 'default';
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type, message }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'course-list':
        return <CourseListSkeleton />;
      case 'course-detail':
        return <CourseDetailSkeleton />;
      case 'dashboard':
        return <DashboardSkeleton />;
      default:
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              {message && <p className="text-gray-600 dark:text-gray-400">{message}</p>}
            </div>
          </div>
        );
    }
  };

  return (
    <div aria-live="polite" aria-busy="true">
      {renderSkeleton()}
    </div>
  );
};
