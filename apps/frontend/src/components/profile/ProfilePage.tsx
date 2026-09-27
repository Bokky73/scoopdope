'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StreakWidget } from '@/components/ui/StreakWidget';
import { CreditCard, Star } from 'lucide-react';
import { toast } from '@/lib/toast';
import WalletSection from './WalletSection';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
import ReferralSection from './ReferralSection';
import { KycVerification } from '@/components/profile/KycVerification';
import { TwoFactorAuthentication } from '@/components/profile/TwoFactorAuthentication';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { GdprSection } from '@/components/profile/GdprSection';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useBookmarksStore } from '@/store/bookmarks.store';
import BadgeDisplay, { type BadgeProgress } from './BadgeDisplay';

interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
  stellarPublicKey?: string;
  currentStreak?: number;
  longestStreak?: number;
  referralCode?: string;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  subscriptionExpiresAt?: string;
  mfaEnabled?: boolean;
}

interface FormData {
  username: string;
  bio: string;
  avatarUrl: string;
}

export function ProfilePage() {
  const t = useTranslations('profile');
  const locale = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>({ username: '', bio: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const { bookmarks, fetchBookmarks } = useBookmarksStore();

  const handleMfaStatusChange = useCallback((enabled: boolean) => {
    setUser((prev) => (prev ? { ...prev, mfaEnabled: enabled } : prev));
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

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

  // Fetch badges and achievements when user changes
  useEffect(() => {
    if (!user) return;

    api.get('/v1/badges/me').then((response) => setBadges(response.data ?? [])).catch(() => setBadges([]));
  }, [user]);

  // Cleanup timeout and object URL on unmount
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const handleAvatarUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Revoke previous object URL to avoid memory leak
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }

      setAvatarError(null);

      // Validate file type
      if (!ALLOWED_AVATAR_TYPES.includes(file.type as typeof ALLOWED_AVATAR_TYPES[number])) {
        setAvatarError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Validate file size
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setAvatarError(`File is too large (${sizeMB} MB). Maximum size is 5 MB.`);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Valid file — create preview with object URL
      const objectUrl = URL.createObjectURL(file);
      avatarObjectUrlRef.current = objectUrl;
      setAvatarPreview(objectUrl);
    },
    []
  );

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user) return;

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

        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }

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

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-gray-900 dark:text-gray-100">
        <p role="status" aria-live="polite">
          {t('loading')}
        </p>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-gray-900 dark:text-gray-100">
        <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="secondary">
            {t('retry')}
          </Button>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const joinedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(user.createdAt));
  const initial = user.username[0]?.toUpperCase() ?? '?';

  return (
    <ProtectedRoute>
      <main className="max-w-2xl mx-auto p-8 space-y-8">
        {/* Profile Header */}
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
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-700 dark:text-blue-300 select-none">
              {initial}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
              {user.role === 'instructor' && (
                <span
                  title="Verified Instructor"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  ✓ {t('verifiedInstructor', 'Verified Instructor')}
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {user.email} · {user.role} · {t('joined', { date: joinedDate })}
            </p>
            {bookmarks.length > 0 && (
              <div className="mt-2">
                <Link href="/bookmarks" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <svg className="w-4 h-4 fill-blue-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {bookmarks.length} {t('bookmarkedCourses', `Bookmarked Course${bookmarks.length !== 1 ? 's' : ''}`)}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Streak Section */}
        {user.currentStreak !== undefined && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('myStreak', 'My Streak')}
            </h2>
            <StreakWidget currentStreak={user.currentStreak ?? 0} longestStreak={user.longestStreak ?? 0} />
          </section>
        )}

        {/* Subscription Section */}
        {user.subscriptionTier && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('subscription', 'Subscription')}</h2>
            <Card className="p-6 border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 dark:text-white capitalize">
                        {user.subscriptionTier} {t('plan', 'Plan')}
                      </span>
                      {user.subscriptionTier !== 'free' && <Badge className="bg-green-500 text-white">{t('active', 'Active')}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.subscriptionTier === 'free'
                        ? t('upgradePrompt', 'Upgrade to unlock all courses')
                        : t('nextBillingDate', { date: new Date(user.subscriptionExpiresAt!).toLocaleDateString() })}
                    </p>
                  </div>
                </div>
                {user.subscriptionTier === 'free' ? (
                  <Link href="/pricing">
                    <Button size="sm" className="flex items-center space-x-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{t('upgradNow', 'Upgrade Now')}</span>
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => toast.info(t('billingComing', 'Billing portal coming soon!'))}>
                    {t('manageBilling', 'Manage Billing')}
                  </Button>
                )}
              </div>
            </Card>
          </section>
        )}

        {/* Error Banner */}
        {error && (
          <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Edit Profile Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('editProfile')}</h2>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
              {t('usernameHint', 'Your public display name')}
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
              {t('bioHint', { count: form.bio.length }, `${form.bio.length}/500`)}
            </p>
          </div>

          {/* Avatar Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('avatarUrl', 'Avatar')}
            </label>

            {/* Upload area */}
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={t('avatarAlt', { name: user.username })}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400 select-none">
                    {initial}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={saving}
                  className="hidden"
                  aria-describedby="avatar-hint"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    saving
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload Avatar
                </label>
                <p id="avatar-hint" className="text-xs text-gray-500 dark:text-gray-400">
                  JPEG, PNG, or WebP. Max 5 MB.
                </p>

                {avatarPreview && !avatarError && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    New avatar selected
                  </p>
                )}
              </div>
            </div>

            {/* Inline validation error */}
            {avatarError && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-700 dark:text-red-300"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {avatarError}
              </div>
            )}

            {/* URL alternative */}
            <details className="group">
              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                Or use a URL instead
              </summary>
              <div className="mt-2">
                <input
                  id="avatarUrl"
                  type="url"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.avatarUrl}
                  onChange={(e) => {
                    handleFormChange('avatarUrl', e.target.value);
                    // Revoke object URL and clear preview when switching to URL input
                    if (avatarObjectUrlRef.current) {
                      URL.revokeObjectURL(avatarObjectUrlRef.current);
                      avatarObjectUrlRef.current = null;
                    }
                    setAvatarPreview(null);
                    setAvatarError(null);
                  }}
                  disabled={saving}
                  placeholder="https://example.com/avatar.jpg"
                  aria-label={t('avatarUrl', 'Avatar URL')}
                />
              </div>
            </details>
          </div>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {saved ? t('saved') : ''}
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? t('saving') : saved ? t('saved') : t('saveChanges')}
          </Button>
        </form>

        {/* Two-Factor Authentication */}
        <TwoFactorAuthentication mfaEnabled={user.mfaEnabled ?? false} onStatusChange={handleMfaStatusChange} />

        {/* Wallet Section */}
        <WalletSection userId={user.id} stellarPublicKey={user.stellarPublicKey} onLinked={onWalletLinked} onUnlinked={onWalletUnlinked} />

        {/* Referral Section */}
        {user.referralCode && <ReferralSection userId={user.id} referralCode={user.referralCode} />}

        {/* KYC Verification */}
        <KycVerification stellarPublicKey={user.stellarPublicKey} />

        {/* Achievements Section */}
        {badges.length > 0 && <BadgeDisplay badges={badges} />}

        {/* Notification Settings */}
        <NotificationSettings />

        {/* GDPR Section */}
        <GdprSection userId={user.id} />
      </main>
    </ProtectedRoute>
  );
}



