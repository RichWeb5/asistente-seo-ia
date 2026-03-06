/**
 * API route protection utilities.
 * Combines auth check, rate limiting, and domain validation.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { apiLimiter, dataForSeoLimiter, chatLimiter } from './rate-limiter';

/**
 * Extracts a stable identifier for rate limiting.
 * Uses the user email from session, falls back to IP.
 */
function getRateLimitKey(request, session) {
  if (session?.user?.email) return `user:${session.user.email}`;
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('cf-connecting-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Creates a rate-limited 429 response with proper headers.
 */
function rateLimitResponse(result) {
  return Response.json(
    { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    }
  );
}

/**
 * Protects an API route with authentication and rate limiting.
 *
 * @param {Request} request
 * @param {object} options
 * @param {'general'|'dataforseo'|'chat'} options.limiterType - Which rate limiter to use
 * @returns {Promise<{ session: object } | Response>} Session object or error Response
 */
export async function protectApiRoute(request, options = {}) {
  const { limiterType = 'general' } = options;

  // 1. Auth check
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  // 2. Rate limiting
  const key = getRateLimitKey(request, session);
  const limiter =
    limiterType === 'dataforseo'
      ? dataForSeoLimiter
      : limiterType === 'chat'
        ? chatLimiter
        : apiLimiter;

  const result = limiter.check(key);

  if (!result.allowed) {
    return rateLimitResponse(result);
  }

  return { session };
}

/**
 * Validates that a user owns a specific Search Console site.
 * Checks against the user's verified sites list.
 *
 * @param {string} accessToken - Google OAuth access token
 * @param {string} siteUrl - The site URL to validate
 * @returns {Promise<boolean>}
 */
export async function validateSiteOwnership(accessToken, siteUrl) {
  try {
    const { getSites } = await import('@/utils/google/gsc');
    const sites = await getSites(accessToken);
    return sites.some((site) => site.siteUrl === siteUrl);
  } catch {
    return false;
  }
}
