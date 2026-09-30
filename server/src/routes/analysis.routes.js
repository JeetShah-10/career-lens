const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
} = require('../controllers/analysis.controller');
const {
  createAnalysisSchema,
  queryAnalysesSchema,
} = require('../validators/analysis.validator');
const logger = require('../utils/logger');
const env = require('../config/env');

const router = express.Router();

// Strict rate limit on analysis creation: 5 requests per minute per user/IP
const analysisCreateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.NODE_ENV === 'test' ? 1000 : 5,
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('ANALYSIS_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userId: req.user?.id,
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

// All analysis routes require authentication
router.use(auth);

// POST /api/analyses - create a new resume analysis
router.post('/', analysisCreateLimiter, validate(createAnalysisSchema), createAnalysis);

// GET /api/analyses - list analyses with pagination and filters
router.get('/', validate({ query: queryAnalysesSchema }), getAnalyses);

// GET /api/analyses/:id - get single analysis
router.get('/:id', getAnalysisById);

// DELETE /api/analyses/:id - delete single analysis
router.delete('/:id', deleteAnalysis);

module.exports = router;
