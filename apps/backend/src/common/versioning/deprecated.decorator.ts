import { SetMetadata } from '@nestjs/common';

export const DEPRECATED_KEY = 'deprecated';

export interface DeprecationInfo {
  /** ISO date when the endpoint was deprecated (e.g., '2025-01-01') */
  since: string;
  /** ISO date when the endpoint will be removed (90 days after since) */
  sunset: string;
  /** URL to migration docs or the replacement endpoint */
  migrationUrl?: string;
  /** Human-readable reason for the deprecation */
  reason?: string;
}

export const Deprecated = (info: DeprecationInfo) =>
  SetMetadata(DEPRECATED_KEY, info);
