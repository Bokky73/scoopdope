'use client';

import { AuthProvider } from '@/lib/auth-context';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <PushNotificationManager />
      <OfflineIndicator />
    </AuthProvider>
  );
}
