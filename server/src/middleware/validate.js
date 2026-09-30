const logger = require('../utils/logger');

function checkForSuspiciousOperators(obj) {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      return true;
    }
    if (typeof obj[key] === 'object' && checkForSuspiciousOperators(obj[key])) {
      return true;
    }
  }
  return false;
}

/**
 * Validates request body, query, and params using zod schemas.
 * @param {Object} schemas - { body?, query?, params? } or a Zod schema for body
 */
function validate(schemas) {
  const schemaMap = schemas && (schemas.body || schemas.query || schemas.params)
    ? schemas
    : { body: schemas };

  return (req, res, next) => {
    try {
      // Check for suspicious NoSQL injection operator keys in body or query
      if (checkForSuspiciousOperators(req.body) || checkForSuspiciousOperators(req.query)) {
        logger.security('SUSPICIOUS_OPERATORS_DETECTED', {
          ip: req.ip,
          route: req.originalUrl,
          method: req.method,
        });
      }

      req.validated = req.validated || {};

      if (schemaMap.params && req.params) {
        req.validated.params = schemaMap.params.parse(req.params);
      }

      if (schemaMap.query && req.query) {
        req.validated.query = schemaMap.query.parse(req.query);
      }

      if (schemaMap.body && req.body !== undefined) {
        const parsedBody = schemaMap.body.parse(req.body);
        req.validated.body = parsedBody;
        req.body = parsedBody;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = validate;
