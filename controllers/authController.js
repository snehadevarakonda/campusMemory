const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadImage } = require('../middleware/upload');
const { normalizeUsername, isValidUsername, usernameFromEmail } = require('../utils/username');
const { normalizeUniversity } = require('../utils/university');

const ensureUsername = async (user) => {
  if (user.username) return user.username;

  let base = usernameFromEmail(user.email);
  let candidate = base;
  let n = 1;
  while (await User.findOne({ username: candidate, _id: { $ne: user._id } })) {
    candidate = `${base}${n}`.slice(0, 20);
    n += 1;
  }
  user.username = candidate;
  await user.save();
  return candidate;
};

// Create JWT token for authenticated user
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register new student
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, university, department, year, section } = req.body;

    if (!fullName || !username || !email || !password || !university || !department || !year || !section) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    const cleanUsername = normalizeUsername(username);
    if (!isValidUsername(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3–20 characters (letters, numbers, underscore only).',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const usernameTaken = await User.findOne({ username: cleanUsername });
    if (usernameTaken) {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePic = '';
    if (req.file) {
      profilePic = await uploadImage(req.file, 'profiles');
    }

    const user = await User.create({
      fullName,
      username: cleanUsername,
      email,
      password: hashedPassword,
      university: normalizeUniversity(university),
      department: department?.trim(),
      year: year?.trim(),
      section: section?.trim(),
      profilePic,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'welcome to the batch ✨',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        university: user.university,
        department: user.department,
        year: user.year,
        section: user.section,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
};

// @desc    Login student
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await ensureUsername(user);

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'you’re back',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        university: user.university,
        department: user.department,
        year: user.year,
        section: user.section,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      username: user.username || (await ensureUsername(user)),
      email: user.email,
      university: user.university,
      department: user.department,
      year: user.year,
      section: user.section,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    },
  });
};

module.exports = { signup, login, getMe };
