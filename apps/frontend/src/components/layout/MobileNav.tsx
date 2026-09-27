'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu, Home, BookOpen, Award, User, Settings, LogOut } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface MobileNavProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isAuthenticated, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Courses', href: '/courses', icon: <BookOpen className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <Award className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Profile', href: '/profile', icon: <User className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" aria-hidden="true" /> },
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Move focus to close button when menu opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow transition to start
      const t = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Handle touch gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && isOpen) {
      setIsOpen(false);
    } else if (isRightSwipe && !isOpen) {
      setIsOpen(true);
    }
  };

  // Handle keyboard navigation within the drawer
  const handleDrawerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger Button — visible below md (768px) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        // min-w/h 44px satisfies WCAG 2.5.5 touch target size
        className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Menu className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu */}
      <nav
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onKeyDown={handleDrawerKeyDown}
        aria-label="Mobile navigation"
        // Hidden from assistive tech when closed
        aria-hidden={!isOpen}
        inert={!isOpen ? ('' as unknown as boolean) : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            ref={closeButtonRef}
            onClick={() => setIsOpen(false)}
            // min 44px touch target
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col p-4 space-y-1 overflow-y-auto h-[calc(100%-73px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                // min 44px height for touch target
                className={`flex items-center space-x-3 px-4 min-h-[44px] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Divider + Logout */}
          {isAuthenticated && (
            <>
              <div className="my-2 border-t dark:border-gray-800" role="separator" />
              <button
                onClick={() => {
                  onLogout?.();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-3 px-4 min-h-[44px] rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">Logout</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

// Compact mobile navigation bar for bottom of screen
export const BottomMobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Courses', href: '/courses', icon: <BookOpen className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <Award className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Profile', href: '/profile', icon: <User className="w-5 h-5" aria-hidden="true" /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 md:hidden z-30"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              // min 44px x 44px touch target (WCAG 2.5.5)
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-2 px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
