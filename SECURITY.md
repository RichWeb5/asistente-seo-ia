# Security Architecture - AnalySEO

## 1. Architecture Overview

```
                    [Browser / Client]
                          |
                    [Cloudflare Edge]
                          |
                   [middleware.js]          <-- Security headers, auth gate, token check
                          |
                   [API Routes]            <-- protectApiRoute() + rate limiting
                          |
              +-----------+-----------+
              |                       |
     [Google SC API]          [DataForSEO API]
     (user's token)           (server credentials)
```

### Security Layers

| Layer | Component | Purpose |
|-------|-----------|---------|
| 1 | `middleware.js` | Security headers, route protection, token expiry check |
| 2 | `api-guard.js` | Auth verification, rate limiting, domain validation |
| 3 | `sanitize.js` | Input sanitization, XSS/injection prevention |
| 4 | `rate-limiter.js` | Per-user/IP request throttling |
| 5 | `auth.js` | Token refresh, secure session config, httpOnly cookies |
| 6 | `env-bridge.js` | Cloudflare Workers secret management |

---

## 2. File Structure

```
src/
  middleware.js                    # Global security middleware
  lib/
    security/
      api-guard.js                 # Route protection + domain validation
      rate-limiter.js              # In-memory rate limiting
      sanitize.js                  # Input sanitization utilities
      env-bridge.js                # Cloudflare env bridge for secrets
  config/
    auth.js                        # NextAuth config with token refresh
  app/
    api/
      auth/[...nextauth]/route.js  # Auth handler
      sites/route.js               # Protected: list user's sites
      metrics/route.js             # Protected: site metrics + ownership check
      recommendations/route.js     # Protected: SEO recommendations + ownership
      chat/route.js                # Protected: chat + prompt injection defense
      keywords/route.js            # Protected: DataForSEO rate-limited
      keywords/cluster/route.js    # Protected: keyword clustering
      competitor/route.js          # Protected: DataForSEO rate-limited
      content-plan/route.js        # Protected: content planning
```

---

## 3. Authentication Security

### NextAuth Configuration
- **Strategy**: JWT (stateless, no database needed)
- **Session max age**: 24 hours
- **Session refresh**: Every 15 minutes
- **Cookies**: httpOnly, secure (production), sameSite=lax
- **Token refresh**: Automatic refresh via Google's OAuth2 token endpoint
- **Error handling**: `session.error = "RefreshTokenError"` signals client to re-auth

### Token Flow
1. User signs in via Google OAuth
2. `access_token` + `refresh_token` stored in JWT
3. Before expiry (60s buffer), token auto-refreshes
4. If refresh fails, session marked with error
5. Middleware detects expired tokens and forces re-auth

---

## 4. Secret Management

### Strategy: Split between wrangler.toml and wrangler secret

| Variable | Storage | Rationale |
|----------|---------|-----------|
| `NEXTAUTH_URL` | wrangler.toml `[vars]` | Not secret, just config |
| `GOOGLE_CLIENT_ID` | wrangler.toml `[vars]` | Public value (in OAuth redirect) |
| `GOOGLE_CLIENT_SECRET` | `wrangler secret put` | Secret credential |
| `NEXTAUTH_SECRET` | `wrangler secret put` | JWT signing key |
| `DATAFORSEO_LOGIN` | `wrangler secret put` | API credential |
| `DATAFORSEO_PASSWORD` | `wrangler secret put` | API credential |
| `NODE_ENV` | wrangler.toml `[vars]` | Config flag |

### How it works on Cloudflare Workers
- `[vars]` in wrangler.toml are injected into `process.env` (with `compatibility_date >= 2025-04-01`)
- `wrangler secret` values are on the handler `env` object, NOT in `process.env`
- `env-bridge.js` copies secrets from `env` → `process.env` at startup
- NextAuth reads all variables from `process.env` — no code changes needed

### Setup Commands
```bash
# Set secrets (run once, or when rotating)
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put NEXTAUTH_SECRET
wrangler secret put DATAFORSEO_LOGIN
wrangler secret put DATAFORSEO_PASSWORD
```

---

## 5. API Protection

### Every API route uses `protectApiRoute()`:
1. Verifies active NextAuth session
2. Checks `accessToken` exists
3. Applies rate limiting (configurable per endpoint type)
4. Returns `{ session }` or a `Response` (401/429)

### Domain Ownership Validation
- `validateSiteOwnership()` checks user's Search Console sites list
- Applied on: `/api/metrics`, `/api/recommendations`, `/api/chat`
- Prevents IDOR — users can only access their own sites

---

## 6. Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 60 req | 1 min |
| DataForSEO | 10 req | 1 min |
| Chat | 20 req | 1 min |
| Auth | 5 req | 1 min |

### Response on limit exceeded:
- HTTP 429 with `Retry-After` header
- `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers

### Production note:
Current rate limiter is in-memory (per-isolate). For multi-isolate production:
- Migrate to **Cloudflare KV** or **Durable Objects** for shared state

---

## 7. Input Sanitization

### `sanitize.js` provides:
| Function | Purpose |
|----------|---------|
| `sanitizeString()` | Strip HTML, dangerous chars, enforce max length |
| `sanitizeDomain()` | Validate domain format, strip protocol/paths |
| `sanitizeSiteUrl()` | Validate SC URL format (sc-domain: or https://) |
| `sanitizeChatInput()` | Strip prompt injection patterns + HTML |
| `sanitizeKeyword()` | Clean keyword input |
| `sanitizeInt()` | Validate integer within bounds |
| `sanitizeLanguageCode()` | Whitelist of allowed language codes |

### Prompt Injection Defense
The chat endpoint filters:
- "ignore previous instructions" patterns
- System prompt injection markers ([INST], <<SYS>>, etc.)
- Role-switching attempts (ASSISTANT:, HUMAN:, etc.)

---

## 8. Security Headers

Applied globally via `middleware.js`:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | DENY | Prevent clickjacking |
| `X-Content-Type-Options` | nosniff | Prevent MIME sniffing |
| `X-XSS-Protection` | 1; mode=block | Legacy XSS protection |
| `Strict-Transport-Security` | max-age=31536000 | Force HTTPS |
| `Referrer-Policy` | strict-origin-when-cross-origin | Limit referrer leaks |
| `Permissions-Policy` | camera=(), mic=()... | Restrict browser APIs |
| `Content-Security-Policy` | Restrictive policy | Prevent XSS, data exfil |

### Additional next.config.js hardening:
- `poweredByHeader: false` — removes `X-Powered-By: Next.js`
- `productionBrowserSourceMaps: false` — no source maps in production
- API routes: `Cache-Control: no-store`

---

## 9. Deployment Checklist

### Before first deploy:
- [ ] Rotate ALL secrets (they were in git history)
- [ ] Run `wrangler secret put` for each secret
- [ ] Verify `.gitignore` includes `wrangler.toml` and `.env*`
- [ ] Generate new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Regenerate `GOOGLE_CLIENT_SECRET` in Google Cloud Console
- [ ] Update Google OAuth redirect URIs for production domain

### Per deploy:
- [ ] Never commit `.env.*` or `wrangler.toml`
- [ ] Verify security headers with securityheaders.com
- [ ] Test rate limiting
- [ ] Verify auth flow end-to-end

---

## 10. CRITICAL: Immediate Actions Required

### Secret Rotation (PRIORITY 1)
Your `GOOGLE_CLIENT_SECRET` and `NEXTAUTH_SECRET` were committed to git history.
Even though wrangler.toml is now in .gitignore, the values are in the git log.

**You MUST:**
1. Go to Google Cloud Console → Credentials → Regenerate the OAuth client secret
2. Generate a new NEXTAUTH_SECRET: `openssl rand -base64 32`
3. Update wrangler.toml with the new values
4. Run `wrangler secret put GOOGLE_CLIENT_SECRET` and `wrangler secret put NEXTAUTH_SECRET`
5. Consider using `git filter-branch` or BFG Repo Cleaner to purge secrets from git history

---

## 11. Future Improvements

- [ ] Migrate rate limiter to Cloudflare KV / Durable Objects for multi-isolate
- [ ] Add Sentry integration for error monitoring
- [ ] Implement credit system for DataForSEO usage per user
- [ ] Add Cloudflare WAF rules for additional protection
- [ ] Add audit logging for sensitive operations
- [ ] Implement RBAC when adding team features
