/**
 * #970 – Wallet seed phrase exposed in error logs
 *
 * Wallet signing errors carry far more than a message. `Keypair.fromSecret()`
 * and the surrounding `strkey`/XDR decoders attach the offending secret, the
 * operation arguments and the full call stack to the thrown object, and
 * `p-retry` wraps every attempt in an `AggregateError`. Interpolating
 * `error.message` or passing `error.stack` straight to a logger therefore
 * publishes the issuer seed phrase to stdout, where it is picked up by log
 * shippers, container runtimes and Sentry.
 *
 * These helpers scrub an arbitrary value on its way to a log sink. They are
 * deliberately fail-safe: when in doubt a value is redacted, because an
 * over-redacted log line costs debug time while an under-redacted one costs
 * the whole issuer's funds.
 */

export const REDACTED = '[REDACTED]';

/** Longest error text written to a log before truncation. */
export const MAX_LOGGED_ERROR_LENGTH = 500;

/**
 * Property names whose values are never safe to log. Matched
 * case-insensitively against the key, ignoring `-` and `_`.
 */
export const SENSITIVE_KEYS: ReadonlySet<string> = new Set([
  'accesstoken',
  'apitoken',
  'authorization',
  'clientsecret',
  'cookie',
  'cookieheader',
  'jwt',
  'mnemonic',
  'passphrase',
  'password',
  'passwordhash',
  'privatekey',
  'refreshtoken',
  'secret',
  'secretkey',
  'seed',
  'seedphrase',
  'sessiontoken',
  'signingkey',
  'stellarprivatekey',
  'stellersecret',
  'stellersecretkey',
  'token',
  'totpsecret',
]);

/** Normalise `secret_key` / `SecretKey` / `secret-key` to a lookup key. */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_\s]/g, '');
}

/**
 * Stellar strkey secret: a 56-character `S…` string, plus the `T…`/`A…`
 * preauth and auth transaction keys. Anchored to the exact length so that
 * ordinary uppercase words in an error message are not mistaken for a key —
 * a broad `\bS[A-Z2-7]+\b` would redact words such as "SOMETHING".
 */
const STELLAR_SECRET_KEY = /\b[STA][A-Z2-7]{55}\b/g;

/** Compact-serialisation JWT, e.g. the value of an `Authorization` header. */
const JWT = /\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}/g;

/** `Authorization: Bearer …` / `Basic …` with the credential attached. */
const AUTH_SCHEME = /\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/g;

/**
 * `secret: hunter2`, `{"mnemonic": "…"}`, `private_key=0x…`,
 * `Authorization: Bearer <jwt>`. Handles quoted and unquoted values and an
 * optional auth scheme so the credential is consumed in one pass.
 */
const SENSITIVE_ASSIGNMENT =
  /((?:secret|seed|mnemonic|passphrase|password|private[_-]?key|secret[_-]?key|signing[_-]?key|api[_-]?key|auth(?:orization)?|token)["']?\s*[:=]\s*)(?:(bearer|basic|token)\s+)?(?:"([^"]*)"|'([^']*)'|([^\s"',;)}\]]*))/gi;

/**
 * Twelve or more consecutive lowercase words separated by single spaces. A
 * BIP-39 seed phrase always matches this; ordinary prose in an error message
 * only matches when it is unusually long, and over-matching is the safe side.
 */
const MNEMONIC_PHRASE = /\b(?:[a-z]{3,8} ){11,23}[a-z]{3,8}\b/g;

/**
 * Remove seed phrases, secret keys and bearer tokens from a string.
 *
 * Safe to call on any text; returns the input unchanged when nothing matches.
 */
export function redactSecrets(value: string): string {
  return value
    .replace(SENSITIVE_ASSIGNMENT, (_match, prefix: string, scheme: string, dq: string, sq: string) =>
      `${prefix}${scheme ? `${scheme} ` : ''}${
        dq !== undefined ? `"${REDACTED}"` : sq !== undefined ? `'${REDACTED}'` : REDACTED
      }`,
    )
    .replace(AUTH_SCHEME, (match) => `${match.slice(0, match.indexOf(' ') + 1)}${REDACTED}`)
    .replace(JWT, REDACTED)
    .replace(STELLAR_SECRET_KEY, REDACTED)
    .replace(MNEMONIC_PHRASE, REDACTED);
}

/**
 * Recursively redact an arbitrary value for logging. Keys listed in
 * `SENSITIVE_KEYS` lose their value entirely; every remaining string is passed
 * through `redactSecrets`.
 *
 * Cycles are tolerated — a repeated object is replaced with `'[Circular]'`
 * rather than recursing forever.
 */
export function redactForLog(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
  if (typeof value === 'string') return redactSecrets(value);
  if (value === null || typeof value !== 'object') return value;

  if (seen.has(value as object)) return '[Circular]';
  seen.add(value as object);

  if (Array.isArray(value)) return value.map((item) => redactForLog(item, seen));
  if (value instanceof Error) return redactForLog(errorToPlainObject(value), seen);

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    output[key] = SENSITIVE_KEYS.has(normalizeKey(key)) ? REDACTED : redactForLog(entry, seen);
  }
  return output;
}

/**
 * Reduce an `Error` to its own enumerable properties (skipping `message` and
 * `stack`, which are handled separately) so custom fields such as
 * `AggregateError.errors` are still redacted rather than silently dropped.
 */
function errorToPlainObject(error: Error): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const key of Object.keys(error)) {
    if (key === 'message' || key === 'stack') continue;
    output[key] = (error as unknown as Record<string, unknown>)[key];
  }
  return output;
}

function truncate(value: string): string {
  return value.length > MAX_LOGGED_ERROR_LENGTH
    ? `${value.slice(0, MAX_LOGGED_ERROR_LENGTH)}… [truncated]`
    : value;
}

/**
 * Build a single-line, redacted, length-capped description of a thrown value.
 *
 * Unlike `String(error)` or `error.stack` this never includes the stack trace,
 * and unlike `error.message` alone it still surfaces the individual attempt
 * messages of a `p-retry` `AggregateError` — which is what makes retry
 * failures debuggable once the trace is gone.
 */
export function redactErrorMessage(error: unknown): string {
  if (error === null || error === undefined) return String(error);

  if (typeof error === 'string') return truncate(redactSecrets(error));

  if (!(error instanceof Error)) {
    return truncate(redactSecrets(safeStringify(error)));
  }

  const parts = [redactSecrets(error.message || error.name)];

  const nested = (error as unknown as { errors?: unknown }).errors;
  if (Array.isArray(nested) && nested.length > 0) {
    const inner = nested
      .map((attempt) => redactErrorMessage(attempt))
      .filter((message) => message && message !== error.name);
    if (inner.length > 0) parts.push(`attempts: [${inner.join(' | ')}]`);
  }

  if (!error.message) {
    const extra = redactForLog(errorToPlainObject(error));
    if (Object.keys(extra as object).length > 0) parts.push(`context: ${safeStringify(extra)}`);
  }

  return truncate(parts.filter(Boolean).join(' — '));
}

/**
 * A redacted single-line stack trace, for the rare case where the call site is
 * genuinely needed. Returns `undefined` for a value that has no stack, so it
 * can be passed straight to `logger.error(message, trace)`.
 */
export function redactStackTrace(error: unknown): string | undefined {
  if (!(error instanceof Error) || !error.stack) return undefined;
  return truncate(redactSecrets(error.stack));
}

function safeStringify(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
