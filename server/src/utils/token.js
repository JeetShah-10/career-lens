const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Signs a JWT with HS256 containing only the user ID.
 * @param {string} userId
 * @returns {string}
 */
function signToken(userId) {
  return jwt.sign({ id: userId.toString() }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verifies a JWT with algorithm pinned strictly to HS256.
 * @param {string} token
 * @returns {{ id: string }}
 */
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
  });
}

module.exports = {
  signToken,
  verifyToken,
};
