const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    toggleActivateQuestion,
    getQuestionsByCategory,
    getQuestionsByType,
} = require('../controllers/questionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Routes accessible by teachers and admins
router.post('/', authorizeRoles('teacher', 'admin'), createQuestion);
router.get('/', getQuestions);
router.get('/category/:category', getQuestionsByCategory);
router.get('/type/:type', getQuestionsByType);
router.get('/:id', getQuestion);
router.put('/:id', authorizeRoles('teacher', 'admin'), updateQuestion);
router.delete('/:id', authorizeRoles('teacher', 'admin'), deleteQuestion);

// Toggle question status route
router.patch('/:id/activate', authorizeRoles('teacher', 'admin'), toggleActivateQuestion);

module.exports = router;