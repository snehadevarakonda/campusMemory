const express = require('express');
const router = express.Router();
const { searchUsers, followUser, unfollowUser, getUserProfile } = require('../controllers/followController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);

module.exports = router;
