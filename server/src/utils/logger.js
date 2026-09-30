const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'authorization',
  'cookie',
  'apikey',
  'gemini_api_key',
  'jwt_secret',
  'resumetext',
  'jobdescription',
  'secret',
]);

/**
 * Recursively redacts sensitive fields from metadata objects.
 */
function sanitize(obj, depth = 0) {
  if (depth > 5 || obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, depth + 1));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      clean[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      clean[key] = sanitize(value, depth + 1);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function outputLog(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitize(meta),
  };
  // Output single structured JSON line to stdout
  process.stdout.write(JSON.stringify(logEntry) + '\n');
}

const logger = {
  info(message, meta) {
    outputLog('info', message, meta);
  },
  warn(message, meta) {
    outputLog('warn', message, meta);
  },
  error(message, meta) {
    outputLog('error', message, meta);
  },
  security(eventType, meta) {
    outputLog('security', `Security event: ${eventType}`, {
      eventType,
      ...meta,
    });
  },
};

module.exports = logger;
