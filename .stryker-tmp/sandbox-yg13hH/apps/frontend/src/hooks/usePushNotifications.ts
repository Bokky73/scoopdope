import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });

      setSubscription(sub);

      // Send to backend
      await api.post('/notifications/subscribe', sub);
      
      // Update preferences to enable push
      await api.patch('/notifications/preferences', { pushEnabled: true });

      return sub;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      await api.delete('/notifications/unsubscribe', { data: { endpoint: subscription.endpoint } });
      await api.patch('/notifications/preferences', { pushEnabled: false });
      
      setSubscription(null);
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    isSupported,
    subscribe,
    unsubscribe,
  };
}
