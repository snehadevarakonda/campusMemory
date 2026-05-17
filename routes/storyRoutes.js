const express = require('express');
const router = express.Router();
const { getStories } = require('../controllers/storyController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getStories);

module.exports = router;
