import React from 'react';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';

interface NavItem {
  label: string;
  href: string;
  roles?: string[]; // If empty/undefined, visible to all roles
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface RoleBasedNavProps {
  items: NavItem[];
  className?: string;
  itemClassName?: string;
  hiddenItemClassName?: string;
}

/**
 * Navigation component that respects role-based visibility
 * Items without roles property are visible to all users
 * Items with roles array are only visible to users with those roles
 */
export function RoleBasedNav({
  items,
  className = 'flex flex-col gap-2',
  itemClassName = 'px-3 py-2 rounded hover:bg-gray-100',
  hiddenItemClassName = 'hidden',
}: RoleBasedNavProps) {
  const { hasRole, role } = useRole();

  const isItemVisible = (item: NavItem): boolean => {
    // No role restriction = visible to all
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    // User not authenticated = hide
    if (!role) {
      return false;
    }

    // Check if user's role is in allowed roles
    return hasRole(item.roles);
  };

  const filterVisibleItems = (navItems: NavItem[]): NavItem[] => {
    return navItems
      .filter(isItemVisible)
      .map((item) => ({
        ...item,
        children: item.children ? filterVisibleItems(item.children) : undefined,
      }));
  };

  const renderItems = (navItems: NavItem[]) => {
    return navItems.map((item) => (
      <div key={item.href}>
        <Link
          href={item.href}
          className={`${itemClassName} ${!isItemVisible(item) ? hiddenItemClassName : ''}`}
        >
          {item.icon && <span className="inline mr-2">{item.icon}</span>}
          {item.label}
        </Link>
        {item.children && isItemVisible(item) && (
          <div className="ml-4">{renderItems(item.children)}</div>
        )}
      </div>
    ));
  };

  return (
    <nav className={className}>
      {renderItems(filterVisibleItems(items))}
    </nav>
  );
}

/**
 * Conditional nav item that only renders if user has required role
 */
export function ConditionalNavItem({
  label,
  href,
  roles = [],
  icon,
  activeClassName = 'font-semibold text-blue-600',
  defaultClassName = 'px-3 py-2 rounded hover:bg-gray-100',
  children,
}: {
  label: string;
  href: string;
  roles?: string[];
  icon?: React.ReactNode;
  activeClassName?: string;
  defaultClassName?: string;
  children?: React.ReactNode;
}) {
  const { hasRole } = useRole();

  // No role restriction = always show
  if (roles.length === 0) {
    return (
      <Link href={href} className={defaultClassName}>
        {icon && <span className="inline mr-2">{icon}</span>}
        {label}
      </Link>
    );
  }

  // User doesn't have required role = don't show
  if (!hasRole(roles)) {
    return null;
  }

  return (
    <Link href={href} className={defaultClassName}>
      {icon && <span className="inline mr-2">{icon}</span>}
      {label}
      {children}
    </Link>
  );
}
