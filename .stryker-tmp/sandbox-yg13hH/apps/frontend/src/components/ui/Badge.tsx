interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const styles = {
    default: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    success: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100',
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
