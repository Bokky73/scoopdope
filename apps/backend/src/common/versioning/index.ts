export {
  API_VERSIONS,
  DEFAULT_API_VERSION,
  LATEST_API_VERSION,
  API_VERSION_HEADER,
  X_API_VERSION,
  X_API_DEPRECATED,
  X_API_SUNSET,
  VERSION_MANIFEST,
  isApiVersion,
  getVersionInfo,
} from './api-version.constants';
export type { ApiVersion, VersionInfo } from './api-version.constants';
export { API_VERSION_METADATA, ApiVersion as ApiVersionDecorator } from './api-version.decorator';
export { ApiVersionMiddleware } from './api-version.middleware';
export { ApiVersionInterceptor, RESOLVED_VERSION_KEY } from './api-version.interceptor';
export { ApiVersionModule } from './api-version.module';
export { DEPRECATED_KEY, Deprecated } from './deprecated.decorator';
export type { DeprecationInfo } from './deprecated.decorator';
export { DeprecationInterceptor } from './deprecation.interceptor';
