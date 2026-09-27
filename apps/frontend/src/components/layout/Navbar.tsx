'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MobileNav } from '@/components/layout/MobileNav';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, clearUnread } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    pathname === href || pathname.endsWith(href)
      ? 'text-blue-600 dark:text-blue-400 font-semibold'
      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white';

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Keyboard navigation for dropdown menu (Escape, ArrowDown/Up, Tab)
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!dropdownOpen) return;
    const items = dropdownRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (!items || items.length === 0) return;
    const active = document.activeElement as HTMLElement;
    const idx = Array.from(items).indexOf(active);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setDropdownOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0].focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1].focus();
        break;
    }
  };

  // Move focus to first menu item when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      const first = dropdownRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [dropdownOpen]);

  return (
    <nav
      aria-label="Site navigation"
      className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors relative z-40"
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-lg text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          scoopdope
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/courses"
            aria-current={pathname.endsWith('/courses') ? 'page' : undefined}
            className={`text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${isActive('/courses')}`}
          >
            Courses
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              aria-current={pathname.endsWith('/dashboard') ? 'page' : undefined}
              className={`text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${isActive('/dashboard')}`}
            >
              Dashboard
            </Link>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          <ConnectionStatus />
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <Link
                href="/notifications"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                onClick={clearUnread}
                className="relative p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-0.5"
                    aria-hidden="true"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative" ref={dropdownRef} onKeyDown={handleDropdownKeyDown}>
                <button
                  ref={triggerRef}
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  aria-label={`User menu for ${user.username}`}
                  className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={`${user.username}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300"
                      aria-hidden="true"
                    >
                      {user.username[0]?.toUpperCase()}
                    </span>
                  )}
                </button>
                {dropdownOpen && (
                  <div
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 text-sm"
                  >
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/bookmarks"
                      role="menuitem"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Bookmarks
                    </Link>
                    <Link
                      href="/credentials"
                      role="menuitem"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Credentials
                    </Link>
                    <button
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile: slide-out drawer trigger */}
        <div className="md:hidden">
          <MobileNav isAuthenticated={isAuthenticated} onLogout={logout} />
        </div>
      </div>
    </nav>
  );
}
