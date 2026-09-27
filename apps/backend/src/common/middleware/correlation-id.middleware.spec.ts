import { CorrelationIdMiddleware, CORRELATION_ID_HEADER } from './correlation-id.middleware';
import { randomUUID } from 'crypto';

describe('CorrelationIdMiddleware', () => {
  it('generates an id when none is provided and exposes it as a response header', () => {
    const mw = new CorrelationIdMiddleware();
    const req: any = { headers: {} };
    const res: any = { setHeader: jest.fn() };
    const next = jest.fn();

    mw.use(req, res, next);

    expect(req.correlationId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, req.correlationId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('reuses an incoming correlation id instead of generating a new one', () => {
    const mw = new CorrelationIdMiddleware();
    const id = randomUUID();
    const req: any = { headers: { [CORRELATION_ID_HEADER]: id } };
    const res: any = { setHeader: jest.fn() };
    const next = jest.fn();

    mw.use(req, res, next);

    expect(req.correlationId).toBe(id);
    expect(res.setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, id);
  });
});
