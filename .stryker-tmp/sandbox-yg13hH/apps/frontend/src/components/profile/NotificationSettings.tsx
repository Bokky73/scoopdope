'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/Button';

interface Preferences {
  courseUpdates: boolean;
  liveSessions: boolean;
  tokenRewards: boolean;
  pushEnabled: boolean;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isSupported, permission, subscribe, unsubscribe } = usePushNotifications();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data } = await api.get('/users/me');
        setPreferences(data.notificationPreferences || {
          courseUpdates: true,
          liveSessions: true,
          tokenRewards: true,
          pushEnabled: false,
        });
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = async (key: keyof Preferences) => {
    if (!preferences) return;

    const newPrefs = { ...preferences, [key]: !preferences[key] };
    
    // If enabling push, we need to request permission/subscribe
    if (key === 'pushEnabled' && newPrefs.pushEnabled) {
      if (permission !== 'granted') {
        const sub = await subscribe();
        if (!sub) return; // Permission denied or failed
      }
    } else if (key === 'pushEnabled' && !newPrefs.pushEnabled) {
      await unsubscribe();
    }

    setPreferences(newPrefs);
    setSaving(true);
    try {
      await api.patch('/notifications/preferences', newPrefs);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading preferences...</div>;
  if (!preferences) return null;

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Course Updates</p>
            <p className="text-sm text-gray-500">New lessons, course changes, and announcements.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.courseUpdates}
            onChange={() => handleToggle('courseUpdates')}
            className="w-5 h-5 accent-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Live Sessions</p>
            <p className="text-sm text-gray-500">Reminders for upcoming live coding sessions.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.liveSessions}
            onChange={() => handleToggle('liveSessions')}
            className="w-5 h-5 accent-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Token Rewards</p>
            <p className="text-sm text-gray-500">Notifications when you earn BST tokens or badges.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.tokenRewards}
            onChange={() => handleToggle('tokenRewards')}
            className="w-5 h-5 accent-blue-600"
          />
        </div>

        <div className="pt-4 border-t dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">
                {!isSupported 
                  ? 'Not supported in this browser.' 
                  : permission === 'denied' 
                    ? 'Permission blocked. Please enable in browser settings.'
                    : 'Receive notifications even when the app is closed.'}
              </p>
            </div>
            <input
              type="checkbox"
              disabled={!isSupported || permission === 'denied'}
              checked={preferences.pushEnabled && permission === 'granted'}
              onChange={() => handleToggle('pushEnabled')}
              className="w-5 h-5 accent-blue-600 disabled:opacity-50"
            />
          </div>
        </div>
      </div>
      
      {saving && <p className="text-xs text-blue-600 animate-pulse">Saving changes...</p>}
    </div>
  );
}
