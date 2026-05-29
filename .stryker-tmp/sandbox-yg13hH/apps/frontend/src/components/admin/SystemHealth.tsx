'use client';
import { useEffect, useState } from 'react';
import { adminApi, HealthStatus } from '@/lib/adminApi';

type ServiceStatus = 'ok' | 'degraded' | 'down';

const STATUS_STYLES: Record<ServiceStatus, string> = {
  ok: 'bg-green-100 text-green-700',
  degraded: 'bg-yellow-100 text-yellow-700',
  down: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function SystemHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  function load() {
    adminApi.getHealth().then(setHealth).catch(() => {});
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return <div className="animate-pulse h-20 bg-gray-100 rounded-lg" />;

  const services: { label: string; key: keyof HealthStatus }[] = [
    { label: 'API', key: 'api' },
    { label: 'Database', key: 'database' },
    { label: 'Stellar Network', key: 'stellar' },
  ];

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm">System Health</h3>
      {services.map(({ label, key }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{label}</span>
          <StatusBadge status={health[key]} />
        </div>
      ))}
    </div>
  );
}
