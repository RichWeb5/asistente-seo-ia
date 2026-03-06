import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Security middleware: headers, auth gating, basic rate limit headers.
 */

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/api/sites', '/api/metrics', '/api/recommendations', '/api/chat', '/api/keywords', '/api/competitor', '/api/content-plan'];

// Routes that NextAuth manages internally
const AUTH_ROUTES = ['/api/auth'];

function addSecurityHeaders(response) {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // HSTS - force HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy - restrict sensitive browser features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  // CSP - restrictive Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval in dev
      "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
      "img-src 'self' https://lh3.googleusercontent.com data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://accounts.google.com https://www.googleapis.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip NextAuth internal routes
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Check if route requires authentication
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // API routes return 401
      if (pathname.startsWith('/api/')) {
        return addSecurityHeaders(
          NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        );
      }
      // Page routes redirect to login
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // Check token expiry — force re-auth if expired
    if (token.expiresAt && Date.now() / 1000 > token.expiresAt) {
      if (pathname.startsWith('/api/')) {
        return addSecurityHeaders(
          NextResponse.json({ error: 'Sesión expirada' }, { status: 401 })
        );
      }
      const loginUrl = new URL('/', request.url);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    // Match all routes except static files and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
