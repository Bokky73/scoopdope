'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import WalletSection from './WalletSection';
import ReferralSection from './ReferralSection';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useBookmarksStore } from '@/store/bookmarks.store';

interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
  stellarPublicKey?: string;
  referralCode?: string;
}

interface FormData {
  username: string;
  bio: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const t = useTranslations('profile');
  const locale = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>({ username: '', bio: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { bookmarks, fetchBookmarks } = useBookmarksStore();

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/users/me');
        setUser(response.data);
        setForm({
          username: response.data.username,
          bio: response.data.bio ?? '',
          avatarUrl: response.data.avatarUrl ?? '',
        });
      } catch (err) {
        setError(t('loadError'));
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [t]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user) return;

      // Basic validation
      if (!form.username.trim()) {
        setError(t('usernameRequired'));
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const { data } = await api.patch(`/users/${user.id}`, form);
        setUser({ ...user, ...data });
        setSaved(true);

        // Clear any existing timeout
        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }

        // Reset saved state after 2 seconds
        savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError(t('saveError'));
        console.error('Failed to save profile:', err);
      } finally {
        setSaving(false);
      }
    },
    [user, form, t]
  );

  const handleFormChange = useCallback(
    (field: keyof FormData, value: string) => {
      setForm((prev: FormData) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (error) setError(null);
    },
    [error]
  );

  const onWalletLinked = useCallback((key: string) => {
    setUser((prev: User | null) => (prev ? { ...prev, stellarPublicKey: key } : null));
  }, []);

  const onWalletUnlinked = useCallback(() => {
    setUser((prev: User | null) => (prev ? { ...prev, stellarPublicKey: undefined } : null));
  }, []);

  // Loading state
  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-gray-900 dark:text-gray-100">
        <p role="status" aria-live="polite">
          {t('loading')}
        </p>
      </main>
    );
  }

  // Error state (no user data)
  if (error && !user) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-gray-900 dark:text-gray-100">
        <div
          role="alert"
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="secondary">
            {t('retry')}
          </Button>
        </div>
      </main>
    );
  }

  // Should not happen, but handle edge case
  if (!user) {
    return null;
  }

  const joinedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(user.createdAt)
  );

  const initial = user.username[0]?.toUpperCase() ?? '?';

  return (
    <ProtectedRoute>
      <main className="max-w-2xl mx-auto p-8 space-y-8">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={t('avatarAlt', { name: user.username })}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
              priority
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-700 dark:text-blue-300 select-none"
            >
              {initial}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {user.email} · {user.role} · {t('joined', { date: joinedDate })}
            </p>
            <div className="mt-2">
              <Link
                href="/bookmarks"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <svg className="w-4 h-4 fill-blue-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {bookmarks.length} Bookmarked Course{bookmarks.length !== 1 ? 's' : ''}
              </Link>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('editProfile')}
          </h2>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              {t('username')}
            </label>
            <input
              id="username"
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
              disabled={saving}
              required
              maxLength={50}
              aria-describedby="username-hint"
            />
            <p id="username-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('usernameHint')}
            </p>
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              {t('bio')}
            </label>
            <textarea
              id="bio"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={form.bio}
              onChange={(e) => handleFormChange('bio', e.target.value)}
              disabled={saving}
              maxLength={500}
              aria-describedby="bio-hint"
            />
            <p id="bio-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('bioHint', { count: form.bio.length })}
            </p>
          </div>

          <div>
            <label
              htmlFor="avatarUrl"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              {t('avatarUrl')}
            </label>
            <input
              id="avatarUrl"
              type="url"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.avatarUrl}
              onChange={(e) => handleFormChange('avatarUrl', e.target.value)}
              disabled={saving}
              placeholder="https://example.com/avatar.jpg"
              aria-describedby="avatar-hint"
            />
            <p id="avatar-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('avatarUrlHint')}
            </p>
          </div>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {saved ? t('saved') : ''}
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? t('saving') : saved ? t('saved') : t('saveChanges')}
          </Button>
        </form>

        {/* Wallet Section */}
        <WalletSection
          userId={user.id}
          stellarPublicKey={user.stellarPublicKey}
          onLinked={onWalletLinked}
          onUnlinked={onWalletUnlinked}
        />

        {/* Referral Section */}
        {user.referralCode && <ReferralSection userId={user.id} referralCode={user.referralCode} />}

        {/* Notification Settings */}
        <NotificationSettings />
      </main>
    </ProtectedRoute>
  );
}
