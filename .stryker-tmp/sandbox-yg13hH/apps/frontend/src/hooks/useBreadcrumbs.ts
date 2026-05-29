import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { BreadcrumbItem } from '@/components/ui/Breadcrumb';

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

// Define custom breadcrumb labels for specific routes
const breadcrumbConfig: BreadcrumbConfig = {
  '/dashboard': { label: 'Dashboard' },
  '/courses': { label: 'Courses' },
  '/courses/[id]': { label: 'Course Details', parent: '/courses' },
  '/courses/[id]/lessons/[lessonId]': { label: 'Lesson', parent: '/courses/[id]' },
  '/profile': { label: 'Profile' },
  '/credentials': { label: 'Credentials' },
  '/instructor': { label: 'Instructor Dashboard' },
  '/instructor/courses': { label: 'My Courses', parent: '/instructor' },
  '/instructor/courses/create': { label: 'Create Course', parent: '/instructor/courses' },
  '/admin': { label: 'Admin Dashboard' },
  '/admin/users': { label: 'Users', parent: '/admin' },
  '/admin/courses': { label: 'Courses', parent: '/admin' },
};

export function useBreadcrumbs(customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    if (customItems) return customItems;

    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
    ];

    if (pathname === '/') return breadcrumbs;

    const segments = pathname.split('/').filter(Boolean);
    let currentPath = '';

    segments.forEach((segment, index) => {
      // Skip locale segments (e.g., /en, /es)
      if (segment.length === 2 && index === 0 && /^[a-z]{2}$/.test(segment)) {
        return;
      }

      currentPath += `/${segment}`;

      // Check if this path has a custom config
      const config = breadcrumbConfig[currentPath];
      
      let label = segment;
      
      if (config) {
        label = config.label;
      } else {
        // Format dynamic segments (e.g., [id] -> ID)
        if (segment.startsWith('[') && segment.endsWith(']')) {
          label = segment.slice(1, -1).toUpperCase();
        } else {
          // Capitalize and format regular segments
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        current: index === segments.length - 1,
      });
    });

    return breadcrumbs;
  }, [pathname, customItems]);
}
