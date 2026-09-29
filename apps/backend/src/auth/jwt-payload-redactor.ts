/**
 * #959 – Sensitive data logged in auth middleware
 *
 * The JWT strategy turns a signed token into the session object that becomes
 * `req.user`, and that object carries the user's email address. Any middleware
 * that outputs it — a debug line, an error tracker, a structured log field —
 * therefore publishes PII that has no place in a log: log indexes, shippers and
 * crash reporters all retain it well past the lifetime of the request.
 *
 * These helpers produce a log-safe view of a token payload or session object.
 * The strategy deliberately uses an *allowlist* rather than a denylist: a new
 * claim added to `token.service.ts` is redacted by default, instead of leaking
 * until someone remembers to add it to a blocklist.
 */

/** Placeholder written in place of a withheld claim. */
export const REDACTED_CLAIM = '[REDACTED]';

/**
 * Claims that may appear in a log verbatim. Everything else is withheld, and
 * the withheld claim *names* are still reported so a missing value can be
 * diagnosed without reading the value.
 */
export const LOGGABLE_JWT_CLAIMS: ReadonlySet<string> = new Set([
  'sub',
  'id',
  'role',
  'iss',
  'aud',
  'iat',
  'exp',
  'jti',
]);

/** Key under which the names of the withheld claims are reported. */
export const REDACTED_CLAIMS_KEY = 'redacted';

/** Guards against a pathological or hostile token nesting objects forever. */
const MAX_DEPTH = 3;

/**
 * Produce a log-safe copy of a decoded JWT payload or session object.
 *
 * Allowlisted claims are copied through; every other claim is replaced by
 * {@link REDACTED_CLAIM} and its name is collected under
 * {@link REDACTED_CLAIMS_KEY}. Non-object input returns an empty object rather
 * than throwing, because this runs on the request path.
 */
export function redactJwtPayload(payload: unknown, depth = 0): Record<string, unknown> {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return {};

  const safe: Record<string, unknown> = {};
  const withheld: string[] = [];

  for (const [claim, value] of Object.entries(payload as Record<string, unknown>)) {
    if (!LOGGABLE_JWT_CLAIMS.has(claim)) {
      withheld.push(claim);
      continue;
    }

    if (Array.isArray(value)) {
      safe[claim] = value.map((item) => redactClaimValue(item, depth + 1));
      continue;
    }

    if (value !== null && typeof value === 'object') {
      // Past the depth limit the value is withheld wholesale rather than
      // copied through, so a deeply nested claim cannot smuggle a field past
      // the allowlist.
      safe[claim] = depth < MAX_DEPTH ? redactJwtPayload(value, depth + 1) : REDACTED_CLAIM;
      continue;
    }

    safe[claim] = value;
  }

  if (withheld.length > 0) safe[REDACTED_CLAIMS_KEY] = withheld.sort();

  return safe;
}

/** Redact one entry of an allowlisted array claim, keeping its position. */
function redactClaimValue(value: unknown, depth: number): unknown {
  if (Array.isArray(value)) return value.map((item) => redactClaimValue(item, depth));
  if (value === null || typeof value !== 'object') return value;
  if (depth >= MAX_DEPTH) return REDACTED_CLAIM;
  return redactJwtPayload(value, depth);
}

/**
 * Format a token payload for a single-line log message, e.g.
 * `{sub=9f1c-…, role=student, redacted=email}`.
 *
 * A payload that yields nothing loggable renders as `{redacted=email}`, so a
 * fully-withheld token is visibly different from an empty one. The result never
 * contains a line break, so one request stays one log line.
 */
export function formatJwtPayloadForLog(payload: unknown): string {
  const safe = redactJwtPayload(payload);
  const entries = Object.entries(safe).map(
    ([claim, value]) => `${claim}=${Array.isArray(value) ? value.join(',') : String(value)}`,
  );
  return `{${entries.join(', ')}}`;
}
