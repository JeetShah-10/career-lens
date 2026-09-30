class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(message, 401, code);
    this.isAuthError = true;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
    this.isNotFound = true;
  }
}

class AiError extends AppError {
  constructor(message = 'Analysis service is temporarily unavailable, please try again', code = 'AI_SERVICE_UNAVAILABLE') {
    super(message, 502, code);
    this.isAiError = true;
  }
}

/**
 * Async controller wrapper to catch promise rejections and forward to next(err).
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  AuthError,
  NotFoundError,
  AiError,
  asyncHandler,
};
