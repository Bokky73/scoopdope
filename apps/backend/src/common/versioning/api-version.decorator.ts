import { SetMetadata } from '@nestjs/common';
import { LATEST_API_VERSION } from './api-version.constants';
import type { ApiVersion as ApiVersionValue } from './api-version.constants';

export const API_VERSION_METADATA = 'api:version';

export const ApiVersion = (version: ApiVersionValue = LATEST_API_VERSION) =>
  SetMetadata(API_VERSION_METADATA, version);
