const env = require('../config/env');

const AUTH_COOKIE_NAME = 'token';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns security attributes for the auth HttpOnly cookie based on environment.
 * - HttpOnly: true (always, prevents XSS token theft)
 * - Secure: true in production HTTPS (or when overridden by COOKIE_SECURE)
 * - SameSite: 'none' in production cross-site (Render + Vercel) or 'lax' in dev/same-site
 * - Path: '/' (available across entire API)
 * - MaxAge: 1 day in milliseconds (matches JWT expiration)
 */
function getAuthCookieOptions() {
  const isProd = env.NODE_ENV === 'production';
  let secure = env.COOKIE_SECURE !== undefined ? env.COOKIE_SECURE : isProd;
  let sameSite = env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax');

  // Security Invariants:
  // 1. Production must never permit Secure=false
  if (isProd) {
    secure = true;
  }
  // 2. SameSite=none must always require Secure=true
  if (sameSite === 'none') {
    secure = true;
  }

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: ONE_DAY_MS,
  };
}

/**
 * Returns matching options for clearing the auth cookie on logout.
 * Same name, path, secure, and sameSite are required by browsers to clear the cookie.
 */
function getClearCookieOptions() {
  const { maxAge, ...clearOptions } = getAuthCookieOptions();
  return clearOptions;
}

module.exports = {
  AUTH_COOKIE_NAME,
  ONE_DAY_MS,
  getAuthCookieOptions,
  getClearCookieOptions,
};
