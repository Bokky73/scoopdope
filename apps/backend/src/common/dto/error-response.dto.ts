/**
 * Standard error response shape returned by all exception filters.
 *
 * Every error response across the API has exactly this structure:
 *
 * ```json
 * {
 *   "statusCode": 400,
 *   "error": "Bad Request",
 *   "message": "Validation failed",
 *   "details": ["email must be an email", "password is too short"],
 *   "timestamp": "2025-01-01T00:00:00.000Z",
 *   "correlationId": "abc-123",
 *   "path": "/api/v1/auth/register"
 * }
 * ```
 *
 * - `statusCode`    — HTTP status code (number).
 * - `error`         — Short HTTP status phrase (e.g. "Bad Request", "Not Found").
 * - `message`       — Human-readable description of the error.
 * - `details`       — Optional array of field-level validation messages (present on 400).
 * - `timestamp`     — ISO 8601 UTC timestamp of when the error occurred.
 * - `correlationId` — Request trace ID propagated from `X-Correlation-Id` header.
 * - `path`          — Request path that triggered the error.
 */
export interface ErrorResponseDto {
  statusCode: number;
  error: string;
  message: string;
  details?: string[] | null;
  timestamp: string;
  correlationId: string | undefined;
  path: string;
}

/**
 * Maps an HTTP status code to its standard reason phrase.
 */
export function getHttpStatusPhrase(status: number): string {
  const phrases: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    413: 'Payload Too Large',
    415: 'Unsupported Media Type',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };
  return phrases[status] ?? 'Error';
}
