/**
 * Validation helpers for Stellar/Soroban configuration values.
 */

/**
 * A Stellar contract ID is the strkey-encoded (base32) form of a 32-byte
 * contract hash, prefixed with "C". The encoded string is 56 characters long
 * and uses the RFC 4648 base32 alphabet (A-Z, 2-7).
 */
const CONTRACT_ID_REGEX = /^C[A-Z2-7]{55}$/;

/**
 * Returns true when the given value is a syntactically valid Stellar
 * Soroban contract ID (strkey "C..." form).
 */
export function isValidContractId(value: unknown): value is string {
  return typeof value === "string" && CONTRACT_ID_REGEX.test(value);
}

/**
 * Validates a configured Soroban contract address, throwing a clear error
 * when it is missing or malformed. Returns the validated address so it can be
 * used directly at the call site.
 */
export function assertValidContractId(value: unknown, label = "contract address"): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${label}: a Soroban contract ID is required.`);
  }

  const contractId = value.trim();

  if (!isValidContractId(contractId)) {
    throw new Error(
      `Invalid ${label}: "${contractId}" is not a valid Stellar contract ID. ` +
        "Expected a 56-character strkey starting with \"C\".",
    );
  }

  return contractId;
}
