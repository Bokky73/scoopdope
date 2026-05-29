// @ts-nocheck
export interface NetworkStatus {
  horizon: ServiceStatus;
  soroban: ServiceStatus;
  timestamp: string;
  network: string;
}
export interface ServiceStatus {
  status: 'healthy' | 'unstable' | 'down';
  url: string;
  latencyMs: number;
  lastChecked: string;
  error?: string;
}