import { RequestValidationMiddleware } from './request-validation.middleware';
import { BadRequestException } from '@nestjs/common';

describe('RequestValidationMiddleware', () => {
  const mw = new RequestValidationMiddleware();

  it('passes through safe (GET) requests without validation', () => {
    const req: any = { method: 'GET', headers: {} };
    const res: any = {};
    const next = jest.fn();

    mw.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('throws 400 when a state-changing request is not JSON', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: { a: 1 },
    };
    const res: any = {};
    const next = jest.fn();

    expect(() => mw.use(req, res, next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });

  it('throws 400 when a state-changing request has an empty body', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {},
    };
    const res: any = {};
    const next = jest.fn();

    expect(() => mw.use(req, res, next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes a valid JSON body for a state-changing request', () => {
    const req: any = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { a: 1 },
    };
    const res: any = {};
    const next = jest.fn();

    mw.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
