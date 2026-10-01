const env = require('../config/env');
const logger = require('../utils/logger');
const { AUTH_COOKIE_NAME } = require('../utils/cookies');

/**
 * CSRF Protection Middleware for Cookie-based Authentication.
 * Validates Origin and Referer headers against CLIENT_ORIGIN on state-changing requests.
 * Modern browsers automatically attach Origin/Referer and guarantee they cannot be spoofed.
 */
function csrfProtection(req, res, next) {
  // Safe read-only methods do not modify server state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // In development, allow localhost and 127.0.0.1 seamlessly
  if (env.NODE_ENV === 'development') {
    const isDevLocal = (url) => url && (url.includes('localhost') || url.includes('127.0.0.1'));
    if (isDevLocal(req.headers.origin) || isDevLocal(req.headers.referer)) {
      return next();
    }
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const hasAuthCookie = Boolean(
    req.cookies && (req.cookies.token || req.cookies[AUTH_COOKIE_NAME])
  );

  // If both Origin and Referer are absent:
  // For state-changing cookie-authenticated requests, reject with 403 FORBIDDEN
  if (!origin && !referer) {
    if (hasAuthCookie) {
      logger.security('CSRF_MISSING_ORIGIN_AND_REFERER', {
        ip: req.ip,
        route: req.originalUrl,
        method: req.method,
      });
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cross-site request forgery protection: missing origin and referer',
        },
      });
    }
    // Unauthenticated requests without Origin/Referer (e.g. non-browser API clients)
    return next();
  }

  let expectedOrigin;
  try {
    expectedOrigin = new URL(env.CLIENT_ORIGIN).origin;
  } catch {
    expectedOrigin = env.CLIENT_ORIGIN.replace(/\/$/, '');
  }

  if (origin) {
    let parsedOrigin;
    try {
      parsedOrigin = new URL(origin).origin;
    } catch {
      logger.security('CSRF_INVALID_ORIGIN', {
        ip: req.ip,
        route: req.originalUrl,
        method: req.method,
        origin,
      });
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cross-site request forgery protection: invalid origin',
        },
      });
    }

    // Exact origin equality check (prevents prefix/suffix/wildcard spoofing)
    if (parsedOrigin !== expectedOrigin) {
      logger.security('CSRF_ORIGIN_MISMATCH', {
        ip: req.ip,
        route: req.originalUrl,
        method: req.method,
        origin,
        expectedOrigin,
      });
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cross-site request forgery protection: origin mismatch',
        },
      });
    }
  } else if (referer) {
    let refererOrigin;
    try {
      refererOrigin = new URL(referer).origin;
    } catch {
      logger.security('CSRF_INVALID_REFERER', {
        ip: req.ip,
        route: req.originalUrl,
        method: req.method,
        referer,
      });
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cross-site request forgery protection: invalid referer',
        },
      });
    }

    // Exact referer origin equality check
    if (refererOrigin !== expectedOrigin) {
      logger.security('CSRF_REFERER_MISMATCH', {
        ip: req.ip,
        route: req.originalUrl,
        method: req.method,
        referer,
        expectedOrigin,
      });
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cross-site request forgery protection: referer mismatch',
        },
      });
    }
  }

  next();
}

module.exports = csrfProtection;
