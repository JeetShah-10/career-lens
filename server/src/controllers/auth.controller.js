const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/token');
const {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearCookieOptions,
} = require('../utils/cookies');
const logger = require('../utils/logger');
const { asyncHandler } = require('../utils/errors');

/**
 * Register a new user
 * POST /api/auth/register
 * Issues signed JWT in HttpOnly cookie; returns safe user object without token in JSON.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.validated.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.security('REGISTRATION_DUPLICATE_EMAIL', {
      ip: req.ip,
      email,
    });
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_EMAIL',
        message: 'Email already registered',
      },
    });
  }

  // Hash password with bcrypt cost 12
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = signToken(user._id);

  // Set HttpOnly cookie with matching expiration and security attributes
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  logger.info('User registered successfully', {
    userId: user._id.toString(),
  });

  // Never return token in JSON response
  return res.status(201).json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  });
});

// Precomputed dummy bcrypt hash (cost 12) for constant-time comparison when user is not found
const DUMMY_HASH = bcrypt.hashSync('timing_protection_dummy_hash_placeholder', 12);

/**
 * Log in an existing user
 * POST /api/auth/login
 * Issues signed JWT in HttpOnly cookie; returns safe user object without token in JSON.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  // Retrieve user with passwordHash
  const user = await User.findOne({ email }).select('+passwordHash');

  // Always run bcrypt.compare to maintain constant response timing
  const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !isMatch) {
    logger.security('LOGIN_FAILED', {
      ip: req.ip,
      email,
    });
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  }

  const token = signToken(user._id);

  // Set HttpOnly cookie with matching expiration and security attributes
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  logger.info('User logged in successfully', {
    userId: user._id.toString(),
  });

  // Never return token in JSON response
  return res.status(200).json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  });
});

/**
 * Log out user by clearing the HttpOnly cookie
 * POST /api/auth/logout
 * Clears the cookie using matching name, path, secure, and sameSite options.
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());

  logger.info('User logged out successfully', {
    ip: req.ip,
    userId: req.user?.id,
  });

  return res.status(200).json({
    message: 'Logged out successfully',
  });
});

/**
 * Get current authenticated user
 * GET /api/auth/me
 * Authenticates from HttpOnly cookie and returns safe user profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
  }

  return res.status(200).json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
};
