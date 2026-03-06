/**
 * In-memory rate limiter for Cloudflare Workers / Edge Runtime.
 * Uses a sliding window counter pattern.
 *
 * NOTE: In-memory state is per-isolate in CF Workers. For production
 * with multiple isolates, migrate to Cloudflare KV or Durable Objects.
 */

const stores = new Map();

function getStore(namespace) {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  return stores.get(namespace);
}

/**
 * Creates a rate limiter instance.
 * @param {object} options
 * @param {string} options.namespace - Unique name for this limiter
 * @param {number} options.maxRequests - Max requests per window
 * @param {number} options.windowMs - Window duration in milliseconds
 */
export function createRateLimiter({ namespace, maxRequests, windowMs }) {
  const store = getStore(namespace);

  // Periodic cleanup of expired entries
  const CLEANUP_INTERVAL = windowMs * 2;
  let lastCleanup = Date.now();

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    const cutoff = now - windowMs;
    for (const [key, entry] of store) {
      if (entry.windowStart < cutoff) {
        store.delete(key);
      }
    }
  }

  return {
    /**
     * Check and consume a rate limit token.
     * @param {string} key - Identifier (userId, IP, etc.)
     * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
     */
    check(key) {
      cleanup();
      const now = Date.now();
      let entry = store.get(key);

      if (!entry || now - entry.windowStart >= windowMs) {
        entry = { count: 0, windowStart: now };
        store.set(key, entry);
      }

      entry.count++;

      const remaining = Math.max(0, maxRequests - entry.count);
      const resetAt = entry.windowStart + windowMs;

      return {
        allowed: entry.count <= maxRequests,
        remaining,
        resetAt,
      };
    },

    /**
     * Get current usage without consuming a token.
     */
    peek(key) {
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || now - entry.windowStart >= windowMs) {
        return { count: 0, remaining: maxRequests, resetAt: now + windowMs };
      }
      return {
        count: entry.count,
        remaining: Math.max(0, maxRequests - entry.count),
        resetAt: entry.windowStart + windowMs,
      };
    },
  };
}

// --- Pre-configured limiters ---

// General API: 60 requests per minute per user
export const apiLimiter = createRateLimiter({
  namespace: 'api-general',
  maxRequests: 60,
  windowMs: 60 * 1000,
});

// DataForSEO endpoints: 10 requests per minute per user (expensive API)
export const dataForSeoLimiter = createRateLimiter({
  namespace: 'dataforseo',
  maxRequests: 10,
  windowMs: 60 * 1000,
});

// Chat endpoint: 20 requests per minute per user
export const chatLimiter = createRateLimiter({
  namespace: 'chat',
  maxRequests: 20,
  windowMs: 60 * 1000,
});

// Auth attempts: 5 per minute per IP (brute-force protection)
export const authLimiter = createRateLimiter({
  namespace: 'auth',
  maxRequests: 5,
  windowMs: 60 * 1000,
});
