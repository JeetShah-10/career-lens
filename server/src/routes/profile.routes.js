const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { profileUpdateSchema } = require('../validators/profile.validator');

const router = express.Router();

// All profile routes require authentication
router.use(auth);

router.get('/', getProfile);
router.put('/', validate(profileUpdateSchema), updateProfile);

module.exports = router;
