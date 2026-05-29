'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface ServiceStatus {
  status: 'healthy' | 'unstable' | 'down';
  url: string;
  latencyMs: number;
  lastChecked: string;
  error?: string;
}

interface NetworkStatusData {
  horizon: ServiceStatus;
  soroban: ServiceStatus;
  timestamp: string;
  network: string;
}

const NetworkStatus: React.FC = () => {
  const [data, setData] = useState<NetworkStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/stellar/network-status');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch network status', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'unstable':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-xs font-medium text-white flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="opacity-80 uppercase tracking-wider">Stellar {data.network}</span>
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(data.horizon.status)}`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-8">
          <span className="opacity-60">Horizon</span>
          <span>{data.horizon.latencyMs}ms</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="opacity-60">Soroban</span>
          <span>{data.soroban.latencyMs}ms</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
