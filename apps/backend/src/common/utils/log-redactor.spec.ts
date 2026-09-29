import {
  MAX_LOGGED_ERROR_LENGTH,
  REDACTED,
  redactErrorMessage,
  redactForLog,
  redactSecrets,
  redactStackTrace,
} from './log-redactor';

// A 56-character Stellar secret seed: `S` + 55 base32 characters.
const SECRET_SEED = 'S' + 'BQY3AOAB4T3HY4KOWJQVUXBMJ5P2MOOQAPO33PTMYTHFRQFAAMPA'.repeat(3).slice(0, 55);
const SEED_PHRASE =
  'abandon ability able about above absent absorb abstract absurd abuse access accident';

describe('log-redactor', () => {
  describe('redactSecrets', () => {
    it('redacts a Stellar secret seed embedded in a message', () => {
      const result = redactSecrets(`invalid secret: ${SECRET_SEED}`);
      expect(result).not.toContain(SECRET_SEED);
      expect(result).toContain(REDACTED);
    });

    it('redacts a BIP-39 seed phrase', () => {
      const result = redactSecrets(`failed for seed ${SEED_PHRASE}`);
      expect(result).not.toContain('abandon');
      expect(result).toContain(REDACTED);
    });

    it('redacts secret assignments in quoted and unquoted form', () => {
      expect(redactSecrets(`secret=${SECRET_SEED}`)).toBe(`secret=${REDACTED}`);
      expect(redactSecrets('{"mnemonic": "test test test", "id": 1}')).toBe(
        `{"mnemonic": "${REDACTED}", "id": 1}`,
      );
      expect(redactSecrets('password: "hunter2" rejected')).toBe(
        `password: "${REDACTED}" rejected`,
      );
    });

    it('redacts a bearer token and a bare JWT', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1LTEifQ.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      expect(redactSecrets(`Authorization: Bearer ${jwt}`)).toBe(
        `Authorization: Bearer ${REDACTED}`,
      );
      expect(redactSecrets(`token ${jwt}`)).toBe(`token ${REDACTED}`);
    });

    it('does not mangle ordinary error text', () => {
      const message =
        'Failed to record progress on Soroban: tx_bad_seq, falling back to Horizon';
      expect(redactSecrets(message)).toBe(message);
    });

    it('does not treat uppercase words as a secret key', () => {
      const message = 'SOMETHING went WRONG while processing the request';
      expect(redactSecrets(message)).toBe(message);
    });

    it('leaves a Stellar public account id alone', () => {
      const account = 'GAAAAAAAAAAAAAAAAB7BQURZIOFNAAAAAB';
      expect(redactSecrets(`no account ${account} found`)).toContain(account);
    });
  });

  describe('redactForLog', () => {
    it('replaces values of sensitive keys regardless of casing or separators', () => {
      const result = redactForLog({
        secretKey: SECRET_SEED,
        Mnemonic: SEED_PHRASE,
        'private-key': 'abc',
        stellarPublicKey: 'GAAAA',
        nested: { password: 'hunter2' },
      }) as Record<string, any>;

      expect(result.secretKey).toBe(REDACTED);
      expect(result.Mnemonic).toBe(REDACTED);
      expect(result['private-key']).toBe(REDACTED);
      expect(result.nested.password).toBe(REDACTED);
      expect(result.stellarPublicKey).toBe('GAAAA');
    });

    it('scrubs strings inside arrays', () => {
      const result = redactForLog([`seed=${SECRET_SEED}`, 'harmless']) as string[];
      expect(result[0]).toBe(`seed=${REDACTED}`);
      expect(result[1]).toBe('harmless');
    });

    it('handles circular references', () => {
      const node: Record<string, unknown> = { name: 'a' };
      node.self = node;
      expect(redactForLog(node)).toEqual({ name: 'a', self: '[Circular]' });
    });
  });

  describe('redactErrorMessage', () => {
    it('returns a redacted single-line message', () => {
      const error = new Error(`cannot decode ${SECRET_SEED}`);
      const result = redactErrorMessage(error);
      expect(result).not.toContain(SECRET_SEED);
      expect(result).toContain(REDACTED);
      expect(result).not.toContain('\n');
    });

    it('never includes the stack trace', () => {
      const error = new Error('boom');
      expect(redactErrorMessage(error)).toBe('boom');
    });

    it('keeps the individual attempt messages of an AggregateError', () => {
      const aggregate = new AggregateError(
        [new Error('tx_bad_seq'), new Error(`signing failed for ${SECRET_SEED}`)],
        'All attempts failed',
      );
      const result = redactErrorMessage(aggregate);
      expect(result).toContain('tx_bad_seq');
      expect(result).toContain('attempts:');
      expect(result).not.toContain(SECRET_SEED);
    });

    it('truncates very long messages', () => {
      const result = redactErrorMessage(new Error('x'.repeat(MAX_LOGGED_ERROR_LENGTH * 2)));
      expect(result).toContain('[truncated]');
      expect(result.length).toBeLessThanOrEqual(MAX_LOGGED_ERROR_LENGTH + 40);
    });

    it('handles non-Error throwables', () => {
      expect(redactErrorMessage(`secret=${SECRET_SEED}`)).toBe(`secret=${REDACTED}`);
      expect(redactErrorMessage(null)).toBe('null');
      expect(redactErrorMessage(undefined)).toBe('undefined');
    });
  });

  describe('redactStackTrace', () => {
    it('redacts a stack trace and scrubs secrets out of it', () => {
      const error = new Error('boom');
      error.stack = `Error: boom\n    at sign (${SECRET_SEED}:1:1)`;
      const result = redactStackTrace(error);
      expect(result).not.toContain(SECRET_SEED);
    });

    it('returns undefined when there is no stack', () => {
      const error = new Error('boom');
      error.stack = undefined;
      expect(redactStackTrace('not an error')).toBeUndefined();
      expect(redactStackTrace(error)).toBeUndefined();
    });
  });
});
