import { RequestValidationMiddleware } from './request-validation.middleware';
import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

describe('RequestValidationMiddleware', () => {
  const mw = new RequestValidationMiddleware();

  // ── Read-only methods pass through without any body checks ────────────────

  it.each(['GET', 'DELETE', 'HEAD', 'OPTIONS'])(
    'passes %s requests through without body validation',
    (method) => {
      const req: any = { method, headers: {} };
      const next = jest.fn();
      mw.use(req, {} as any, next);
      expect(next).toHaveBeenCalledTimes(1);
    },
  );

  // ── Content-Type enforcement ──────────────────────────────────────────────

  it('throws 415 when Content-Type is missing on POST', () => {
    const req: any = {
      method: 'POST',
      headers: {},
      body: { a: 1 },
    };
    expect(() => mw.use(req, {} as any, jest.fn())).toThrow(
      UnsupportedMediaTypeException,
    );
  });

  it('throws 415 when Content-Type is text/plain on POST', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: { a: 1 },
    };
    expect(() => mw.use(req, {} as any, jest.fn())).toThrow(
      UnsupportedMediaTypeException,
    );
  });

  it('throws 415 when Content-Type is text/plain on PUT', () => {
    const req: any = {
      method: 'PUT',
      headers: { 'content-type': 'text/plain' },
      body: { a: 1 },
    };
    expect(() => mw.use(req, {} as any, jest.fn())).toThrow(
      UnsupportedMediaTypeException,
    );
  });

  it('throws 415 when Content-Type is text/plain on PATCH', () => {
    const req: any = {
      method: 'PATCH',
      headers: { 'content-type': 'text/plain' },
      body: { a: 1 },
    };
    expect(() => mw.use(req, {} as any, jest.fn())).toThrow(
      UnsupportedMediaTypeException,
    );
  });

  // ── Empty body enforcement ────────────────────────────────────────────────

  it('throws 400 when body is an empty object {}', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {},
    };
    expect(() => mw.use(req, {} as any, jest.fn())).toThrow(BadRequestException);
  });

  it('throws 400 when body is null', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: null,
    };
    expect(() => mw.use(req, {} as any, jest.fn())).toThrow(BadRequestException);
  });

  it('throws 400 when body is undefined', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: undefined,
    };
    expect(() => mw.use(req, {} as any, jest.fn())).toThrow(BadRequestException);
  });

  // ── Valid requests pass through ───────────────────────────────────────────

  it('passes a valid JSON body on POST', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { email: 'user@example.com' },
    };
    const next = jest.fn();
    mw.use(req, {} as any, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('passes a valid JSON body on PATCH', () => {
    const req: any = {
      method: 'PATCH',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: { name: 'updated' },
    };
    const next = jest.fn();
    mw.use(req, {} as any, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('passes an array body on POST', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: [{ id: 1 }],
    };
    const next = jest.fn();
    mw.use(req, {} as any, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
