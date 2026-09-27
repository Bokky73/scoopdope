import { ValidationExceptionFilter } from './validation-exception.filter';
import { BadRequestException } from '@nestjs/common';

describe('ValidationExceptionFilter', () => {
  const buildHost = (req: any, res: any) => ({
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => req,
    }),
  });

  it('formats field-level validation errors with correlationId', () => {
    const filter = new ValidationExceptionFilter();
    const req: any = { url: '/v1/users', correlationId: 'val-1' };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const host: any = buildHost(req, res);

    const exception = new BadRequestException({
      statusCode: 400,
      message: 'Validation failed',
      errors: ['email: must be an email'],
    });

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Validation failed',
        errors: ['email: must be an email'],
        timestamp: expect.any(String),
        correlationId: 'val-1',
      }),
    );
  });
});
