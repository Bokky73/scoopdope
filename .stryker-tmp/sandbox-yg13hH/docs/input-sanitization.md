# Input Sanitization Guide

## Overview

All API endpoints implement comprehensive input validation and sanitization to prevent:
- XSS (Cross-Site Scripting) attacks
- SQL injection
- HTML injection
- Control character injection
- Invalid data formats

## Global Sanitization

All requests are automatically sanitized through:

1. **SanitizationPipe**: Removes HTML tags, null bytes, and control characters
2. **ValidationPipe**: Validates against DTO schemas with `whitelist: true`
3. **ValidationExceptionFilter**: Formats validation errors consistently

## Using Sanitization Decorators

### In DTOs

```typescript
import { SanitizeHtml, TrimString, RemoveControlChars, SanitizeUrl, SanitizeEmail } from '@common/decorators/sanitize.decorator';
import { IsString, IsEmail, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @TrimString()
  @SanitizeHtml()
  title: string;

  @IsString()
  @SanitizeHtml()
  content: string;

  @IsEmail()
  @SanitizeEmail()
  authorEmail: string;

  @IsUrl()
  @SanitizeUrl()
  sourceUrl?: string;
}
```

## Sanitization Methods

### SanitizeHtml()
Removes all HTML tags and attributes:
```
Input:  "<script>alert('xss')</script>Hello"
Output: "Hello"
```

### TrimString()
Removes leading/trailing whitespace:
```
Input:  "  hello world  "
Output: "hello world"
```

### RemoveControlChars()
Removes null bytes and control characters:
```
Input:  "hello\x00world"
Output: "helloworld"
```

### SanitizeUrl()
Validates URL protocol (only http/https allowed):
```
Input:  "javascript:alert('xss')"
Output: Error - Invalid protocol
```

### SanitizeEmail()
Normalizes email (lowercase, trim):
```
Input:  "  USER@EXAMPLE.COM  "
Output: "user@example.com"
```

## Validation Error Response

When validation fails, the API returns:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": "email: must be an email; password: must be longer than or equal to 8 characters",
  "timestamp": "2026-04-27T16:00:00Z"
}
```

## Best Practices

1. **Always use DTOs**: Define DTOs for all request bodies
2. **Add Validators**: Use `class-validator` decorators
3. **Sanitize User Input**: Apply sanitization decorators to text fields
4. **Whitelist Properties**: Use `whitelist: true` in ValidationPipe
5. **Test Edge Cases**: Test with special characters, HTML, and null bytes

## SQL Injection Prevention

TypeORM with parameterized queries prevents SQL injection:

```typescript
// ✅ Safe - parameterized query
const user = await this.userRepository.findOne({
  where: { email: userInput },
});

// ❌ Unsafe - string concatenation
const user = await this.userRepository.query(
  `SELECT * FROM users WHERE email = '${userInput}'`
);
```

## Testing Sanitization

Test with OWASP ZAP or similar tools:

```bash
# Example payloads to test
<script>alert('xss')</script>
<img src=x onerror=alert('xss')>
'; DROP TABLE users; --
\x00\x01\x02
```

## Configuration

Sanitization is configured in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({ whitelist: true }),
  new SanitizationPipe()
);
app.useGlobalFilters(
  new HttpExceptionFilter(),
  new ValidationExceptionFilter()
);
```

## Monitoring

Monitor sanitization events:
- Track validation failures
- Alert on repeated invalid inputs
- Log suspicious patterns
