const mongoose = require('mongoose');
const Analysis = require('../models/Analysis');
const aiService = require('../services/ai.service');
const { asyncHandler, AppError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Escapes regex special characters to prevent ReDoS / NoSQL regex injection.
 */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create and persist a new resume analysis.
 * POST /api/analyses
 */
const createAnalysis = asyncHandler(async (req, res) => {
  const { resumeText, targetRole, jobDescription } = req.validated.body;

  // Run AI analysis through isolated service
  const result = await aiService.analyzeResume({
    resumeText,
    targetRole,
    jobDescription,
  });

  // Persist analysis strictly bound to verified user
  const analysis = await Analysis.create({
    userId: req.user.id,
    resumeText,
    resumeSource: 'paste',
    targetRole,
    jobDescription: jobDescription || '',
    overallScore: result.overallScore,
    result,
  });

  logger.info('Analysis created successfully', {
    userId: req.user.id,
    analysisId: analysis.id,
    targetRole,
    overallScore: result.overallScore,
  });

  return res.status(201).json({
    analysis,
  });
});

/**
 * Get paginated list of analyses with role, score, and date filters.
 * GET /api/analyses
 */
const getAnalyses = asyncHandler(async (req, res) => {
  const query = req.validated.query || {};
  const { role, minScore, maxScore, from, to, sort = 'newest', page = 1, limit = 10 } = query;

  // Build query filter strictly scoped to req.user.id
  const filter = { userId: req.user.id };

  if (role) {
    filter.targetRole = { $regex: escapeRegex(role), $options: 'i' };
  }

  if (minScore !== undefined || maxScore !== undefined) {
    filter.overallScore = {};
    if (minScore !== undefined) filter.overallScore.$gte = minScore;
    if (maxScore !== undefined) filter.overallScore.$lte = maxScore;
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }

  // Determine sort order
  let sortObj = { createdAt: -1 };
  if (sort === 'oldest') {
    sortObj = { createdAt: 1 };
  } else if (sort === 'score_desc') {
    sortObj = { overallScore: -1, createdAt: -1 };
  } else if (sort === 'score_asc') {
    sortObj = { overallScore: 1, createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    Analysis.countDocuments(filter),
    Analysis.find(filter)
      .select('-result -resumeText -jobDescription')
      .sort(sortObj)
      .skip(skip)
      .limit(limit),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  return res.status(200).json({
    items,
    total,
    page,
    pages,
  });
});

/**
 * Get single analysis by ID with strict ownership scoping.
 * GET /api/analyses/:id
 */
const getAnalysisById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid identifier format', 400, 'INVALID_ID');
  }

  // Strictly filter by both _id and userId to prevent IDOR probing
  const analysis = await Analysis.findOne({
    _id: id,
    userId: req.user.id,
  });

  if (!analysis) {
    throw new NotFoundError('Resource not found');
  }

  return res.status(200).json({
    analysis,
  });
});

/**
 * Delete single analysis by ID with strict ownership scoping.
 * DELETE /api/analyses/:id
 */
const deleteAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid identifier format', 400, 'INVALID_ID');
  }

  // Strictly scoped delete to ensure user can only delete own records
  const analysis = await Analysis.findOneAndDelete({
    _id: id,
    userId: req.user.id,
  });

  if (!analysis) {
    throw new NotFoundError('Resource not found');
  }

  logger.info('Analysis deleted successfully', {
    userId: req.user.id,
    analysisId: id,
  });

  return res.status(204).send();
});

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
};
