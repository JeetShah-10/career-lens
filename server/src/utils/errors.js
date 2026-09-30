class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.isAuthError = true;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.isNotFound = true;
  }
}

class AiError extends AppError {
  constructor(message = 'Analysis service is temporarily unavailable, please try again') {
    super(message, 502);
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
