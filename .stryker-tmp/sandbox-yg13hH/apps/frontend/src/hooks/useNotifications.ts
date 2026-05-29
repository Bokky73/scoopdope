import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

export type NotificationType = 'enrollment' | 'progress' | 'credential' | 'token_reward' | 'general';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  enrollment: '📚',
  progress: '📈',
  credential: '🏆',
  token_reward: '🪙',
  general: '🔔',
};

export { TYPE_ICONS };

export function useNotifications() {
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!token) return;

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/notifications`,
      { auth: { token }, transports: ['websocket'] }
    );
    socketRef.current = socket;

    // Load existing notifications on connect
    socket.on('notifications:init', (initial: AppNotification[]) => {
      setNotifications(initial);
    });

    // New incoming notification
    socket.on('notification', (n: AppNotification) => {
      setNotifications((prev) => [n, ...prev]);
    });

    // Server confirms mark-as-read
    socket.on('notifications:read', (ids: string[]) => {
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const markAsRead = useCallback((ids: string[]) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
    );
    socketRef.current?.emit('notifications:markRead', ids);
  }, []);

  const markAllRead = useCallback(() => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length) markAsRead(unreadIds);
  }, [notifications, markAsRead]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, markAsRead, markAllRead };
}
