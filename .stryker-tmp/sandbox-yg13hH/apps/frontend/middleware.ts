import { NextRequest, NextResponse } from 'next/server';
import { generateNonce, buildCSPHeader, CSP_CONFIG } from '@/lib/csp';

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const env = process.env.NODE_ENV || 'development';
  const config = env === 'production' ? CSP_CONFIG.production : CSP_CONFIG.development;

  // Build CSP header with nonce
  const cspHeader = buildCSPHeader(config, nonce);

  // Clone response headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Create response with CSP headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
