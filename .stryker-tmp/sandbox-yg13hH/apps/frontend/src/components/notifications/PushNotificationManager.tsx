'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationManager() {
  const { state } = useAuth();
  const { isSupported, permission, subscribe } = usePushNotifications();

  useEffect(() => {
    // Only ask if user is logged in, push is supported, and we haven't asked yet
    if (state.user && isSupported && permission === 'default') {
      const hasAsked = localStorage.getItem('push_permission_asked');
      
      if (!hasAsked) {
        // We delay slightly to not overwhelm on first load
        const timer = setTimeout(() => {
          subscribe();
          localStorage.setItem('push_permission_asked', 'true');
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [state.user, isSupported, permission, subscribe]);

  return null;
}
