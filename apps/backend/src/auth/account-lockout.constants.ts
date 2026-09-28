/**
 * #960 – Account lockout after failed login attempts
 *
 * Throttling a single IP address is not enough to stop credential stuffing:
 * an attacker simply rotates source addresses. These settings back the
 * per-account lockout enforced by `AuthService.login`, which is persistent
 * (stored on the `users` row) so it survives restarts and Redis eviction.
 */

/** Consecutive failed password attempts tolerated before the account is locked. */
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;

/** How long the account stays locked once the threshold is reached. */
export const ACCOUNT_LOCKOUT_COOLDOWN_MS = 15 * 60 * 1000;

/**
 * The counter is cleared once it has been idle for this long, so that a user
 * who mistypes their password a few times per week is never locked out.
 */
export const FAILED_LOGIN_ATTEMPT_WINDOW_MS = 60 * 60 * 1000;
