'use client';

/**
 * ConnectionStatus — issue #858
 *
 * Monitors API connectivity with periodic health checks and provides visual
 * feedback about the current connection state.
 *
 * Features:
 *  • Green dot when online, red dot when offline
 *  • Health check every 30 seconds (configurable via HEALTH_CHECK_INTERVAL_MS)
 *  • Immediate re-check when the browser fires an online/offline event
 *  • Toast notification when the connection is restored
 *  • Hover tooltip showing last successful sync time
 *  • Reconnection attempt counter shown while offline
 *
 * Usage (add to Navbar or footer):
 *   <ConnectionStatus />
 *
 * The component is self-contained — it creates its own interval and cleans
 * up on unmount, so it can be placed anywhere in the component tree.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/toast';

const HEALTH_CHECK_INTERVAL_MS = 30_000; // 30 seconds (spec requirement)
const HEALTH_ENDPOINT =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000') + '/health';

type ConnectionState = 'online' | 'offline' | 'checking';

function formatLastSync(date: Date | null): string {
  if (!date) return 'Never';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString();
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionState>('checking');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const prevStatus = useRef<ConnectionState>('checking');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Ping the backend health endpoint and update state */
  const checkConnection = useCallback(async () => {
    setStatus('checking');
    try {
      const res = await fetch(HEALTH_ENDPOINT, {
        method: 'GET',
        cache: 'no-store',
        // Short timeout — if the API is down we want to know quickly
        signal: AbortSignal.timeout(5_000),
      });

      if (res.ok) {
        setStatus('online');
        setLastSync(new Date());
        setReconnectAttempts(0);

        // Fire a toast only when recovering from an offline state
        if (prevStatus.current === 'offline') {
          toast.success('Connection restored');
        }
        prevStatus.current = 'online';
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setStatus('offline');
      setReconnectAttempts((n) => n + 1);
      prevStatus.current = 'offline';
    }
  }, []);

  // Run health check on mount, then every HEALTH_CHECK_INTERVAL_MS
  useEffect(() => {
    checkConnection();
    intervalRef.current = setInterval(checkConnection, HEALTH_CHECK_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkConnection]);

  // React immediately to browser online/offline events
  useEffect(() => {
    const handleOnline = () => checkConnection();
    const handleOffline = () => {
      setStatus('offline');
      prevStatus.current = 'offline';
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Visual configuration per state
  const config: Record<
    ConnectionState,
    { icon: React.ReactNode; label: string; dot: string; text: string }
  > = {
    online: {
      icon: <Wifi className="h-3.5 w-3.5" aria-hidden="true" />,
      label: 'Connected',
      dot: 'bg-green-500',
      text: 'text-green-700 dark:text-green-400',
    },
    offline: {
      icon: <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />,
      label: 'Offline',
      dot: 'bg-red-500',
      text: 'text-red-700 dark:text-red-400',
    },
    checking: {
      icon: (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ),
      label: 'Checking…',
      dot: 'bg-yellow-400',
      text: 'text-yellow-700 dark:text-yellow-400',
    },
  };

  const { icon, label, dot, text } = config[status];

  return (
    <div className="relative inline-flex items-center">
      {/* Main indicator pill */}
      <button
        type="button"
        aria-label={`Connection status: ${label}. Last sync: ${formatLastSync(lastSync)}`}
        className={`
          inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
          text-xs font-medium
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          shadow-sm hover:shadow transition-shadow
          select-none cursor-default
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400
          ${text}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onClick={checkConnection}
        title={`Last sync: ${formatLastSync(lastSync)}`}
      >
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2" aria-hidden="true">
          {status === 'online' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dot}`}
          />
        </span>

        {icon}
        <span>{label}</span>

        {/* Reconnection attempt count while offline */}
        {status === 'offline' && reconnectAttempts > 0 && (
          <span className="ml-0.5 text-red-500 dark:text-red-400 font-semibold">
            ({reconnectAttempts})
          </span>
        )}
      </button>

      {/* Tooltip — last sync time on hover/focus */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-md bg-gray-900 dark:bg-gray-700 px-3 py-1.5 text-xs text-white shadow-lg pointer-events-none"
        >
          <p className="font-medium">
            {status === 'offline'
              ? `Reconnecting… (attempt ${reconnectAttempts})`
              : 'Connected to server'}
          </p>
          <p className="text-gray-300 mt-0.5">
            Last sync: {formatLastSync(lastSync)}
          </p>
          {/* Tooltip arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
}
