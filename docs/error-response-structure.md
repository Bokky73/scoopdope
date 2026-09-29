# API Error Response Structure

All error responses from the scoopdope API share **one consistent JSON shape**,
regardless of which endpoint is called or what kind of error occurred.

---

## Standard Error Response

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Course not found",
  "details": null,
  "timestamp": "2025-01-01T12:00:00.000Z",
  "correlationId": "c1d2e3f4-aaaa-bbbb-cccc-000000000000",
  "path": "/api/v1/courses/999"
}
```

| Field           | Type                   | Description |
|-----------------|------------------------|-------------|
| `statusCode`    | `number`               | HTTP status code. |
| `error`         | `string`               | Standard HTTP reason phrase (e.g. `"Not Found"`). |
| `message`       | `string`               | Human-readable explanation of the error. |
| `details`       | `string[] \| null`     | Field-level validation messages; `null` when not applicable. |
| `timestamp`     | `string` (ISO 8601)    | UTC time the error occurred. |
| `correlationId` | `string \| undefined`  | Trace ID from the `X-Correlation-Id` request header. |
| `path`          | `string`               | Request path that triggered the error. |

---

## Validation Error (400)

When the global `ValidationPipe` rejects a request body, field-level constraint
messages are returned in `details`:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "timestamp": "2025-01-01T12:00:00.000Z",
  "correlationId": "c1d2e3f4-aaaa-bbbb-cccc-000000000000",
  "path": "/api/v1/auth/register"
}
```

---

## Internal Server Error (500)

Unexpected errors never leak stack traces or internal details to clients:

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Internal server error",
  "details": null,
  "timestamp": "2025-01-01T12:00:00.000Z",
  "correlationId": "c1d2e3f4-aaaa-bbbb-cccc-000000000000",
  "path": "/api/v1/courses"
}
```

---

## Implementation

| File | Role |
|------|------|
| `src/common/dto/error-response.dto.ts` | `ErrorResponseDto` interface + `getHttpStatusPhrase()` helper |
| `src/common/filters/http-exception.filter.ts` | Handles all `HttpException` subclasses and unknown errors |
| `src/common/filters/validation-exception.filter.ts` | Handles `BadRequestException` from `ValidationPipe` |

Both filters are registered globally in `src/main.ts`:

```ts
app.useGlobalFilters(
  new HttpExceptionFilter(),
  new ValidationExceptionFilter(),
);
```

NestJS applies filters from **last to first**, so `ValidationExceptionFilter`
(registered second) takes priority for `BadRequestException`, while
`HttpExceptionFilter` handles everything else.
