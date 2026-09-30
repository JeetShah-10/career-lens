const Profile = require('../models/Profile');
const { asyncHandler } = require('../utils/errors');
const logger = require('../utils/logger');

const DEFAULT_EMPTY_PROFILE = {
  headline: '',
  targetRole: '',
  skills: [],
  education: [],
  experience: [],
};

/**
 * Get current user's profile
 * GET /api/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  // Enforce data ownership: always query by req.user.id
  const profile = await Profile.findOne({ userId: req.user.id });

  return res.status(200).json({
    profile: profile || DEFAULT_EMPTY_PROFILE,
  });
});

/**
 * Upsert current user's profile
 * PUT /api/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updateData = req.validated.body;

  // Enforce ownership: userId strictly from verified token, never from client body
  const profile = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    {
      ...updateData,
      userId: req.user.id,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  logger.info('Profile updated successfully', {
    userId: req.user.id,
  });

  return res.status(200).json({
    profile,
  });
});

module.exports = {
  getProfile,
  updateProfile,
};
