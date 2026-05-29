'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StreakWidget } from '@/components/ui/StreakWidget';
import { CreditCard, Star, ExternalLink } from 'lucide-react';
import WalletSection from './WalletSection';

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
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionExpiresAt?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', bio: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/users/me').then((r) => {
      setUser(r.data);
      setForm({
        username: r.data.username,
        bio: r.data.bio ?? '',
        avatarUrl: r.data.avatarUrl ?? '',
      });
    });
  }, []);

  if (!user)
    return <main className="max-w-2xl mx-auto p-8 text-gray-900 dark:text-gray-100">Loading…</main>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data } = await api.patch(`/users/${user.id}`, form);
    setUser({ ...user, ...data });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onWalletLinked = (key: string) => setUser({ ...user, stellarPublicKey: key });
  const onWalletUnlinked = () => setUser({ ...user, stellarPublicKey: undefined });

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt="avatar"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover"
            priority
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300">
            {user.username[0]?.toUpperCase()}
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
                ✓ Verified Instructor
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {user.email} · {user.role} · Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">My Streak</h2>
        <StreakWidget
          currentStreak={user.currentStreak ?? 0}
          longestStreak={user.longestStreak ?? 0}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription</h2>
        <Card className="p-6 border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900 dark:text-white capitalize">
                    {user.subscriptionTier} Plan
                  </span>
                  {user.subscriptionTier !== 'free' && (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.subscriptionTier === 'free'
                    ? 'Upgrade to unlock all courses'
                    : `Next billing date: ${new Date(user.subscriptionExpiresAt!).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            {user.subscriptionTier === 'free' ? (
              <Link href="/pricing">
                <Button size="sm" className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Upgrade Now</span>
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={() => toast.info('Billing portal coming soon!')}>
                Manage Billing
              </Button>
            )}
          </div>
        </Card>
      </section>

      <form onSubmit={handleSave} className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Avatar URL
          </label>
          <input
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </Button>
      </form>

      <WalletSection
        userId={user.id}
        stellarPublicKey={user.stellarPublicKey}
        onLinked={onWalletLinked}
        onUnlinked={onWalletUnlinked}
      />
    </main>
  );
}
