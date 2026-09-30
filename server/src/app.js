const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const logger = require('./utils/logger');
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middleware/csrf');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

const app = express();

// Trust reverse proxy in production (Render, Vercel, Fly.io, etc.)
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 1. Security HTTP headers
app.use(helmet());

// 2. Strict CORS policy limited to CLIENT_ORIGIN with credentials
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// 3. Request body parsing with strict size limits
app.use(express.json({ limit: '100kb' }));

// 4. Cookie parser for HttpOnly authentication cookies
app.use(cookieParser());

// 5. CSRF protection: Origin/Referer check on state-changing requests
app.use(csrfProtection);

// 4. Global Rate Limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
    });
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    });
  },
});

app.use(globalLimiter);

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');

// 5. Health check endpoint (public, unauthenticated)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 6. Authentication routes
app.use('/api/auth', authRoutes);

// 7. Profile routes
app.use('/api/profile', profileRoutes);

// 8. Analysis routes
const analysisRoutes = require('./routes/analysis.routes');
app.use('/api/analyses', analysisRoutes);

// 8. Unknown routes fall through to NotFoundError (404)
app.use((req, res, next) => {
  next(new NotFoundError('Resource not found'));
});

// 9. Central error handler (must be the very last middleware)
app.use(errorHandler);

module.exports = app;
