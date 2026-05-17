const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:postId', getComments);
router.post('/:postId', addComment);

module.exports = router;
