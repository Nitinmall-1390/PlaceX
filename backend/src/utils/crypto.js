import crypto from 'crypto';

/**
 * Hash a token using SHA-256 for secure database storage.
 * Refresh tokens are never stored raw — always hashed.
 *
 * @param {string} token - Raw token string
 * @returns {string} Hex-encoded SHA-256 hash
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically secure random token.
 *
 * @param {number} byteLength - Number of random bytes (default 32)
 * @returns {string} URL-safe base64 token string
 */
export function generateSecureToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString('base64url');
}

/**
 * Generate a 6-digit OTP for email verification / password reset.
 *
 * @returns {string} 6-digit string OTP
 */
export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Constant-time comparison to prevent timing attacks.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
