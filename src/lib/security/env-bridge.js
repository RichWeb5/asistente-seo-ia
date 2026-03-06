/**
 * Cloudflare Workers Environment Bridge.
 *
 * In Cloudflare Workers, secrets set via `wrangler secret put` are available
 * on the `env` object passed to the worker handler, NOT in process.env.
 *
 * Variables defined in wrangler.toml [vars] ARE injected into process.env
 * when using compatibility_date >= "2025-04-01".
 *
 * This bridge ensures secrets from `wrangler secret` are also available
 * in process.env so that NextAuth and other libraries can read them.
 *
 * STRATEGY:
 * - Non-secret config (NEXTAUTH_URL) → wrangler.toml [vars]
 * - Secrets (GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET) → wrangler secret put
 * - This bridge copies wrangler secrets from env → process.env at startup
 */

const SECRET_KEYS = [
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'DATAFORSEO_LOGIN',
  'DATAFORSEO_PASSWORD',
];

/**
 * Copies Cloudflare Worker secrets from the handler env object to process.env.
 * Call this once at the start of your worker handler.
 *
 * @param {object} env - The Cloudflare Worker env object
 */
export function bridgeEnvSecrets(env) {
  if (!env) return;

  for (const key of SECRET_KEYS) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }
}

/**
 * Validates that all required environment variables are set.
 * Logs warnings for missing variables (never logs values).
 *
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateEnv() {
  const REQUIRED = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const OPTIONAL = [
    'DATAFORSEO_LOGIN',
    'DATAFORSEO_PASSWORD',
  ];

  const missing = REQUIRED.filter((key) => !process.env[key]);
  const missingOptional = OPTIONAL.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`[SECURITY] Missing required env vars: ${missing.join(', ')}`);
  }
  if (missingOptional.length > 0) {
    console.warn(`[CONFIG] Missing optional env vars: ${missingOptional.join(', ')}`);
  }

  return { valid: missing.length === 0, missing };
}
