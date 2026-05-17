const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/signup', upload.single('profilePic'), signup);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
