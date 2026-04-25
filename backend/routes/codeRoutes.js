const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  runCode,
  getLanguages,
  getSubmissionStatus,
  healthCheck
} = require('../controllers/codeController');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Run code via Judge0 API
// @route   POST /api/code/run
// @access  Private
router.post('/run', runCode);

// @desc    Get supported languages
// @route   GET /api/code/languages
// @access  Private
router.get('/languages', getLanguages);

// @desc    Get submission status
// @route   GET /api/code/submissions/:token
// @access  Private
router.get('/submissions/:token', getSubmissionStatus);

// @desc    Health check for code execution service
// @route   GET /api/code/health
// @access  Private
router.get('/health', healthCheck);

module.exports = router;
