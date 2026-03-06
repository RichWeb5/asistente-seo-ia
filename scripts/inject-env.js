/**
 * Injects environment variables into wrangler.toml [vars] before deploy.
 *
 * Reads secrets from process.env (set as Cloudflare Build Variables)
 * and appends them to the [vars] section of wrangler.toml.
 *
 * This allows secrets to reach process.env at runtime in CF Workers
 * without committing them to git.
 */

const fs = require('fs');
const path = require('path');

const WRANGLER_PATH = path.join(__dirname, '..', 'wrangler.toml');

// Secrets to inject from build environment into wrangler.toml [vars]
const SECRETS_TO_INJECT = [
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'DATAFORSEO_LOGIN',
  'DATAFORSEO_PASSWORD',
];

let toml = fs.readFileSync(WRANGLER_PATH, 'utf-8');

let injected = 0;

for (const key of SECRETS_TO_INJECT) {
  const value = process.env[key];
  if (value) {
    // Escape any quotes in the value
    const escaped = value.replace(/"/g, '\\"');
    toml += `${key} = "${escaped}"\n`;
    injected++;
    console.log(`[inject-env] Injected ${key}`);
  } else {
    console.warn(`[inject-env] WARNING: ${key} not found in environment`);
  }
}

fs.writeFileSync(WRANGLER_PATH, toml, 'utf-8');
console.log(`[inject-env] Done. Injected ${injected}/${SECRETS_TO_INJECT.length} secrets.`);
