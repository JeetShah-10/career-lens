const { verifyToken } = require('../utils/token');
const { AuthError } = require('../utils/errors');
const logger = require('../utils/logger');

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new AuthError('Authentication required');
    }

    // Must be exactly "Bearer <token>" (strictly two parts separated by a single space)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      throw new AuthError('Authentication required');
    }

    const token = parts[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      throw new AuthError('Authentication required');
    }

    // Set user ownership on request
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
