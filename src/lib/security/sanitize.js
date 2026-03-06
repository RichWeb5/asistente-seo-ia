/**
 * Input sanitization and validation utilities.
 * Prevents XSS, injection, and malformed data.
 */

/**
 * Strips HTML tags and dangerous characters from a string.
 */
export function sanitizeString(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>"'`;(){}]/g, '') // Remove dangerous chars
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes a domain name input.
 * Only allows valid domain characters.
 */
export function sanitizeDomain(input) {
  if (typeof input !== 'string') return '';
  // Remove protocol, paths, whitespace
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\s/g, '');

  // Validate domain format
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/;
  if (!domainRegex.test(cleaned)) return '';
  return cleaned;
}

/**
 * Validates and sanitizes a Search Console siteUrl.
 * Accepts formats: sc-domain:example.com or https://example.com/
 */
export function sanitizeSiteUrl(input) {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();

  // sc-domain:example.com format
  if (trimmed.startsWith('sc-domain:')) {
    const domain = trimmed.slice(10);
    if (sanitizeDomain(domain)) return trimmed;
    return '';
  }

  // https://example.com/ format
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return trimmed;
  } catch {
    return '';
  }
}

/**
 * Sanitizes chat input specifically.
 * Defends against prompt injection by stripping control patterns.
 */
export function sanitizeChatInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';

  let cleaned = input.trim().slice(0, maxLength);

  // Strip common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /ignore\s+(all\s+)?above/gi,
    /you\s+are\s+now/gi,
    /new\s+instructions?:/gi,
    /system\s*prompt/gi,
    /\[\s*INST\s*\]/gi,
    /<<\s*SYS\s*>>/gi,
    /<\|im_start\|>/gi,
    /ASSISTANT:/gi,
    /HUMAN:/gi,
    /USER:/gi,
  ];

  injectionPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '[filtered]');
  });

  // Strip HTML
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  return cleaned;
}

/**
 * Validates a keyword input.
 */
export function sanitizeKeyword(input, maxLength = 200) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`;(){}]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates that a value is a safe integer within bounds.
 */
export function sanitizeInt(input, min = 0, max = 100000, defaultValue = 0) {
  const num = parseInt(input, 10);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validates a language code.
 */
export function sanitizeLanguageCode(input) {
  const ALLOWED_LANGUAGES = ['es', 'en', 'pt', 'fr', 'de', 'it', 'nl', 'pl', 'ja', 'ko', 'zh'];
  if (typeof input !== 'string') return 'es';
  const cleaned = input.trim().toLowerCase().slice(0, 5);
  return ALLOWED_LANGUAGES.includes(cleaned) ? cleaned : 'es';
}
