# Content Security Policy (CSP) Implementation

## Overview

Content Security Policy (CSP) is a security standard that helps prevent XSS (Cross-Site Scripting) attacks by controlling which resources can be loaded and executed.

## Implementation

### Middleware-Based CSP with Nonce Support

CSP is implemented via Next.js middleware (`middleware.ts`) which:
- Generates a unique nonce for each request
- Injects nonce into response headers
- Supports different policies for development and production

### CSP Directives

#### Development Environment
```
default-src 'self'
script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://*.stellar.org https://*.sentry.io
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
connect-src 'self' https://*.stellar.org https://*.sentry.io ws://localhost:*
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
upgrade-insecure-requests
```

#### Production Environment
```
default-src 'self'
script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://*.stellar.org https://*.sentry.io
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
connect-src 'self' https://*.stellar.org https://*.sentry.io
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
upgrade-insecure-requests
```

## Using Nonce in Components

### For Inline Scripts

```typescript
import { useCSPNonce } from '@/hooks/useCSPNonce';

export function MyComponent() {
  const nonce = useCSPNonce();

  return (
    <script nonce={nonce}>
      {`console.log('This is safe with nonce')`}
    </script>
  );
}
```

### For Inline Styles

```typescript
export function StyledComponent() {
  const nonce = useCSPNonce();

  return (
    <style nonce={nonce}>
      {`body { color: red; }`}
    </style>
  );
}
```

### Using the Hook

```typescript
import { useInlineScript } from '@/hooks/useCSPNonce';

export function DynamicScript() {
  const nonce = useCSPNonce();

  useInlineScript('console.log("Hello")', nonce);

  return <div>Script loaded</div>;
}
```

## Testing CSP

### Check CSP Headers

```bash
curl -I https://scoopdope.example.com
# Look for Content-Security-Policy header
```

### Browser DevTools

1. Open DevTools → Network tab
2. Click any request
3. Check Response Headers for `Content-Security-Policy`

### CSP Violations

CSP violations are logged to browser console:
```
Refused to load the script 'https://example.com/script.js' because it violates the following Content Security Policy directive: "script-src 'self'"
```

### CSP Evaluator

Use [CSP Evaluator](https://csp-evaluator.withgoogle.com/) to test your policy:
1. Paste your CSP header
2. Get recommendations for improvements

## Common Issues

### Issue: Inline Styles Not Working

**Problem**: Styles with `style=` attribute are blocked

**Solution**: Use CSS classes or styled-components with nonce:
```typescript
// ❌ Blocked
<div style={{ color: 'red' }}>Text</div>

// ✅ Allowed
<div className="text-red">Text</div>
```

### Issue: Third-Party Scripts Blocked

**Problem**: External scripts fail to load

**Solution**: Add domain to `script-src` in CSP config:
```typescript
'script-src': [
  "'self'",
  'https://example.com', // Add here
]
```

### Issue: Nonce Not Available

**Problem**: `useCSPNonce()` returns undefined

**Solution**: Ensure middleware is running and nonce is being set

## Monitoring CSP Violations

### Report-Only Mode

CSP is sent in both modes:
- `Content-Security-Policy`: Enforced
- `Content-Security-Policy-Report-Only`: Logged but not enforced

### Collecting Reports

Configure a report endpoint:
```typescript
'report-uri': ['https://your-domain.com/csp-report']
```

## Best Practices

1. **Use Nonce for Inline Scripts**: Always use nonce for inline scripts
2. **Avoid `unsafe-inline`**: Remove in production
3. **Avoid `unsafe-eval`**: Never use in production
4. **Test Thoroughly**: Test CSP in staging before production
5. **Monitor Violations**: Set up CSP violation reporting
6. **Update Regularly**: Review and update CSP as dependencies change

## Configuration Files

- **CSP Utilities**: `src/lib/csp.ts`
- **Middleware**: `middleware.ts`
- **Hooks**: `src/hooks/useCSPNonce.ts`
- **Next.js Config**: `next.config.js`

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: Content Security Policy](https://owasp.org/www-community/attacks/xss/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
