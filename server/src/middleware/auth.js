const { verifyToken } = require('../utils/token');
const { AuthError } = require('../utils/errors');
const logger = require('../utils/logger');
const { AUTH_COOKIE_NAME } = require('../utils/cookies');

/**
 * Authentication Middleware for HttpOnly Cookie Authentication.
 * Reads and verifies the JWT exclusively from the protected HttpOnly cookie.
 */
function auth(req, res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token || typeof token !== 'string') {
      throw new AuthError('Authentication required');
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      throw new AuthError('Authentication required');
    }

    // Set verified user ownership strictly on request
    req.user = { id: decoded.id };
    req.userId = decoded.id;

    next();
  } catch (err) {
    logger.security('AUTH_VERIFICATION_FAILED', {
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
      reason: err.message,
    });
    next(new AuthError('Authentication required'));
  }
}

module.exports = auth;
