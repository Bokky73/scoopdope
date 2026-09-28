import {
  LOGGABLE_JWT_CLAIMS,
  REDACTED_CLAIM,
  REDACTED_CLAIMS_KEY,
  formatJwtPayloadForLog,
  redactJwtPayload,
} from './jwt-payload-redactor';

describe('jwt-payload-redactor', () => {
  describe('redactJwtPayload', () => {
    it('keeps allowlisted claims', () => {
      const result = redactJwtPayload({
        sub: 'uuid-1',
        role: 'admin',
        iss: 'scoopdope',
        iat: 1700000000,
        exp: 1700000900,
      });

      expect(result).toEqual({
        sub: 'uuid-1',
        role: 'admin',
        iss: 'scoopdope',
        iat: 1700000000,
        exp: 1700000900,
      });
    });

    it('withholds the email claim but reports that it was present', () => {
      const result = redactJwtPayload({ sub: 'uuid-1', email: 'user@example.com', role: 'student' });

      expect(result).toEqual({
        sub: 'uuid-1',
        role: 'student',
        [REDACTED_CLAIMS_KEY]: ['email'],
      });
      expect(JSON.stringify(result)).not.toContain('user@example.com');
    });

    it('withholds every claim it does not recognise', () => {
      const result = redactJwtPayload({
        sub: 'uuid-1',
        email: 'user@example.com',
        phone: '+15555555555',
        stellarPublicKey: 'GAAA',
        passwordHash: 'bcrypt-hash',
      });

      expect(result[REDACTED_CLAIMS_KEY]).toEqual([
        'email',
        'passwordHash',
        'phone',
        'stellarPublicKey',
      ]);
      expect(Object.values(result)).not.toContain('user@example.com');
    });

    it('redacts a session object shaped like id/email/role', () => {
      const result = redactJwtPayload({ id: 'uuid-1', email: 'user@example.com', role: 'student' });

      expect(result).toEqual({ id: 'uuid-1', role: 'student', [REDACTED_CLAIMS_KEY]: ['email'] });
    });

    it('redacts nested objects instead of recursing into them', () => {
      const result = redactJwtPayload({
        sub: 'uuid-1',
        aud: { email: 'user@example.com', sub: 'nested' },
      });

      expect(result.aud).toEqual({ sub: 'nested', [REDACTED_CLAIMS_KEY]: ['email'] });
    });

    it('stops recursing at the maximum depth', () => {
      const result = redactJwtPayload({ sub: 'uuid-1', aud: { aud: { aud: { aud: { email: 'deep@example.com' } } } } });

      expect(JSON.stringify(result)).not.toContain('deep@example.com');
    });

    it('redacts objects inside an allowlisted array claim', () => {
      const result = redactJwtPayload({
        sub: 'uuid-1',
        aud: ['a', { email: 'user@example.com', sub: 'nested' }],
      });

      expect(result.aud).toEqual(['a', { sub: 'nested', [REDACTED_CLAIMS_KEY]: ['email'] }]);
    });

    it('returns an empty object for non-object input', () => {
      expect(redactJwtPayload(null)).toEqual({});
      expect(redactJwtPayload(undefined)).toEqual({});
      expect(redactJwtPayload('a.b.c')).toEqual({});
      expect(redactJwtPayload(['sub'])).toEqual({});
      expect(redactJwtPayload(42)).toEqual({});
    });

    it('does not list a claim that is already allowlisted', () => {
      const result = redactJwtPayload({ sub: 'uuid-1' });
      expect(result[REDACTED_CLAIMS_KEY]).toBeUndefined();
    });
  });

  describe('formatJwtPayloadForLog', () => {
    it('renders allowlisted claims and the withheld names on one line', () => {
      expect(formatJwtPayloadForLog({ sub: 'uuid-1', email: 'user@example.com', role: 'admin' })).toBe(
        `{sub=uuid-1, role=admin, ${REDACTED_CLAIMS_KEY}=email}`,
      );
    });

    it('never emits a line break, so one request stays one log line', () => {
      const formatted = formatJwtPayloadForLog({ sub: 'uuid-1', email: 'a@b.com' });
      expect(formatted).not.toContain('\n');
    });

    it('renders a fully withheld token visibly differently from an empty one', () => {
      expect(formatJwtPayloadForLog({ email: 'a@b.com' })).toBe(`{${REDACTED_CLAIMS_KEY}=email}`);
      expect(formatJwtPayloadForLog({})).toBe('{}');
    });
  });

  it('exposes the allowlist so a new claim has to be opted into', () => {
    expect(LOGGABLE_JWT_CLAIMS.has('sub')).toBe(true);
    expect(LOGGABLE_JWT_CLAIMS.has('email')).toBe(false);
    expect(REDACTED_CLAIM).toBe('[REDACTED]');
  });
});
