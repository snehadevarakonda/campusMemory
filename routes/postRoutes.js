const express = require('express');
const router = express.Router();
const {
  getFeed,
  getRecentPosts,
  getFollowingFeed,
  createPost,
  toggleLike,
  getMyPosts,
  getUserPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

router.get('/feed', getFeed);
router.get('/recent', getRecentPosts);
router.get('/following-feed', getFollowingFeed);
router.get('/my', getMyPosts);
router.get('/user/:userId', getUserPosts);
router.post('/', upload.single('image'), createPost);
router.put('/:id/like', toggleLike);

module.exports = router;
