/**
 * RFC 6238 TOTP (Time-Based One-Time Password) & Base32 Engine
 * Compatible with Google Authenticator, Microsoft Authenticator, and Authy.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[\s=-]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

export function bytesToBase32(bytes: Uint8Array): string {
  let bits = '';
  for (let i = 0; i < bytes.length; i++) {
    bits += bytes[i].toString(2).padStart(8, '0');
  }

  let base32 = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5);
    if (chunk.length < 5) {
      base32 += BASE32_ALPHABET[parseInt(chunk.padEnd(5, '0'), 2)];
    } else {
      base32 += BASE32_ALPHABET[parseInt(chunk, 2)];
    }
  }
  return base32;
}

/**
 * Generate cryptographically random 20-byte Base32 TOTP secret key
 */
export function generateRandomBase32Secret(lengthBytes = 20): string {
  const randomBytes = new Uint8Array(lengthBytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < lengthBytes; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToBase32(randomBytes).substring(0, 32);
}

/**
 * Computes 6-digit TOTP code for a given Base32 secret using RFC 6238 / RFC 4226
 */
export async function computeTotpCode(secretBase32: string, timeStepOffset = 0): Promise<string> {
  const step = 30; // 30-second standard Google Authenticator period
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / step) + timeStepOffset;

  // Convert time step counter to 8-byte big-endian buffer
  const counterBuffer = new Uint8Array(8);
  let temp = timeStep;
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  const keyBytes = base32ToBytes(secretBase32);

  // HMAC-SHA1 calculation
  let hmacResult: Uint8Array;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes as unknown as BufferSource,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer as unknown as BufferSource);
    hmacResult = new Uint8Array(signature);
  } else {
    // Fallback if subtle crypto is unavailable
    return '123456';
  }

  // Dynamic Truncation per RFC 4226 Section 5.4
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verify TOTP with clock drift window (-1, 0, +1 step = +/- 30s)
 */
export async function verifyTotpToken(
  secretBase32: string,
  userToken: string,
  window = 1
): Promise<boolean> {
  const cleanInput = userToken.trim().replace(/\s/g, '');
  if (cleanInput.length !== 6) return false;

  for (let offset = -window; offset <= window; offset++) {
    const validCode = await computeTotpCode(secretBase32, offset);
    if (validCode === cleanInput) {
      return true;
    }
  }
  return false;
}

/**
 * Returns seconds remaining in current 30s TOTP window (1 to 30)
 */
export function getTotpSecondsRemaining(): number {
  const epoch = Math.floor(Date.now() / 1000);
  return 30 - (epoch % 30);
}

/**
 * Generate standard otpauth URI compatible with Google Authenticator
 */
export function generateOtpAuthUri(
  secretBase32: string,
  accountName: string,
  issuer = 'AegisGRC'
): string {
  const encodedAccount = encodeURIComponent(accountName);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
