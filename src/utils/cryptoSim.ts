import { SanitizationResult } from '../types/security';

/**
 * Deterministic hash generator for deduplication & correlation:
 * Key: Hash(Asset, CWE, Sink/Endpoint)
 */
export function generateDedupHash(asset: string, cwe: string, sinkOrEndpoint: string): string {
  const normalized = `${asset.trim().toLowerCase()}::${cwe.trim().toUpperCase()}::${sinkOrEndpoint.trim().toLowerCase()}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hexPart1 = (hash >>> 0).toString(16).padStart(8, '0');
  
  // Secondary pass for 64-char sha256-like hex representation
  let hash2 = 0x5a1796c3;
  for (let i = normalized.length - 1; i >= 0; i--) {
    hash2 ^= normalized.charCodeAt(i);
    hash2 += (hash2 << 2) + (hash2 << 5) + (hash2 << 11);
  }
  const hexPart2 = (hash2 >>> 0).toString(16).padStart(8, '0');

  // Produce 64-char pseudo-deterministic SHA-256 hex string
  const base = `${hexPart1}${hexPart2}${hexPart1.split('').reverse().join('')}${hexPart2.split('').reverse().join('')}`;
  return `${base}${base}`.slice(0, 64);
}

/**
 * Simulates AES-256-GCM field-level encryption for storage at rest
 */
export function simulateAes256Encryption(rawPayload: string): string {
  const iv = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const tag = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  
  // Convert payload snippet to hex
  let cipherHex = '';
  for (let i = 0; i < Math.min(rawPayload.length, 32); i++) {
    const code = rawPayload.charCodeAt(i) ^ 0x5c;
    cipherHex += code.toString(16).padStart(2, '0');
  }
  return `enc:aes-256-gcm$iv=${iv}$tag=${tag}$data=${cipherHex}...`;
}

/**
 * Token-Inspection Sanitizer Boundary:
 * Redacts internal IP addresses, API secrets, passwords, bearer tokens,
 * and internal hostnames before dispatching to LLM.
 */
export function sanitizePromptTokens(text: string): SanitizationResult {
  const redactions: SanitizationResult['redactions'] = [];
  let sanitized = text;

  // 1. IP Addresses (Private and internal IPv4)
  const ipRegex = /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|127\.0\.0\.1)\b/g;
  sanitized = sanitized.replace(ipRegex, (match) => {
    const placeholder = '[REDACTED_INTERNAL_IP]';
    redactions.push({
      type: 'IP_ADDRESS',
      originalValue: match,
      redactedPlaceholder: placeholder,
    });
    return placeholder;
  });

  // 2. Bearer tokens & JWTs
  const bearerRegex = /Bearer\s+([A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*)/gi;
  sanitized = sanitized.replace(bearerRegex, (match, token) => {
    const placeholder = 'Bearer [REDACTED_AUTH_TOKEN]';
    redactions.push({
      type: 'BEARER_TOKEN',
      originalValue: token,
      redactedPlaceholder: '[REDACTED_AUTH_TOKEN]',
    });
    return placeholder;
  });

  // 3. API Keys (common patterns like AIza..., sk-..., ghp_..., etc.)
  const apiKeyRegex = /\b(?:sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36})\b/g;
  sanitized = sanitized.replace(apiKeyRegex, (match) => {
    const placeholder = '[REDACTED_API_KEY]';
    redactions.push({
      type: 'API_KEY',
      originalValue: match,
      redactedPlaceholder: placeholder,
    });
    return placeholder;
  });

  // 4. Passwords / Secrets in URL or key=value formats
  const pwdRegex = /(?:password|passwd|secret|token|api_key|access_key)\s*[:=]\s*["']?([^\s"';]+)["']?/gi;
  sanitized = sanitized.replace(pwdRegex, (match, val) => {
    const placeholder = '[REDACTED_SECRET]';
    redactions.push({
      type: 'PASSWORD',
      originalValue: val,
      redactedPlaceholder: placeholder,
    });
    return match.replace(val, placeholder);
  });

  // 5. Internal domain hostnames (e.g. *.internal, *.corp, *.local)
  const internalHostRegex = /\b[a-zA-Z0-9_-]+\.(?:internal|corp|local|lan|vpc)\b/gi;
  sanitized = sanitized.replace(internalHostRegex, (match) => {
    const placeholder = '[REDACTED_INTERNAL_HOST]';
    redactions.push({
      type: 'INTERNAL_HOST',
      originalValue: match,
      redactedPlaceholder: placeholder,
    });
    return placeholder;
  });

  return {
    originalText: text,
    sanitizedText: sanitized,
    redactions,
  };
}
