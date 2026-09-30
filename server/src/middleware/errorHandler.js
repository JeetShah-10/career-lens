const { ZodError } = require('zod');
const logger = require('../utils/logger');
const env = require('../config/env');

// Central error-handling middleware (must be 4 arguments)
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isProduction = env.NODE_ENV === 'production';

  // 0a. Malformed JSON Body -> 400
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err)) {
    return res.status(400).json({
      error: 'Invalid JSON body',
    });
  }

  // 0b. Body Too Large -> 413
  if (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413) {
    return res.status(413).json({
      error: 'Request body too large',
    });
  }

  // 1. Zod Validation Error -> 400 with details
  if (err instanceof ZodError || err.name === 'ZodError') {
    const details = (err.issues || []).map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    logger.warn('Validation error', {
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
      details,
    });
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  // 2. Mongoose CastError or invalid ID -> 400
  if (err.name === 'CastError' || err.code === 'INVALID_OBJECT_ID') {
    return res.status(400).json({
      error: 'Invalid identifier format',
    });
  }

  // 3. Mongo Duplicate Key Error (Code 11000) -> 409
  if (err.code === 11000) {
    logger.warn('Duplicate key error', {
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
    });
    return res.status(409).json({
      error: 'Email already registered',
    });
  }

  // 4. Missing or invalid token -> 401
  if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError' ||
    err.isAuthError ||
    err.statusCode === 401
  ) {
    logger.security('UNAUTHORIZED_ACCESS_ATTEMPT', {
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
    });
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  // 5. Not found or not owned -> 404
  if (err.isNotFound || err.statusCode === 404) {
    logger.security('RESOURCE_NOT_FOUND', {
      ip: req.ip,
      userId: req.user?.id || req.userId,
      route: req.originalUrl,
      method: req.method,
    });
    return res.status(404).json({
      error: 'Resource not found',
    });
  }

  // 6. AI Service Failure -> 502
  if (err.isAiError || err.statusCode === 502) {
    logger.error('AI provider failure', {
      ip: req.ip,
      userId: req.user?.id || req.userId,
      route: req.originalUrl,
      message: err.message,
    });
    return res.status(502).json({
      error: 'Analysis service is temporarily unavailable, please try again',
    });
  }

  // 7. Handled AppError with explicit status code
  if (err.statusCode && err.statusCode !== 500) {
    const response = { error: err.message };
    if (err.details) response.details = err.details;
    return res.status(err.statusCode).json(response);
  }

  // 8. Unhandled or internal errors -> 500
  logger.error('Unhandled internal server error', {
    ip: req.ip,
    route: req.originalUrl,
    method: req.method,
    error: isProduction ? 'InternalError' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });

  return res.status(500).json({
    error: 'Something went wrong',
  });
}

module.exports = errorHandler;
