import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  const buildHost = (req: any, res: any) => ({
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => req,
    }),
  });

  it('returns a standardized envelope with correlationId, timestamp and path', () => {
    const filter = new HttpExceptionFilter();
    const req: any = { url: '/v1/widgets', correlationId: 'abc-123' };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const host: any = buildHost(req, res);

    filter.catch(new HttpException('boom', 400), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'boom',
        timestamp: expect.any(String),
        correlationId: 'abc-123',
        path: '/v1/widgets',
      }),
    );
  });

  it('returns 500 for unhandled errors without leaking the message', () => {
    const filter = new HttpExceptionFilter();
    const req: any = { url: '/v1/x', correlationId: 'err-1' };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const host: any = buildHost(req, res);

    filter.catch(new Error('secret-db-password'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        correlationId: 'err-1',
      }),
    );
  });
});
