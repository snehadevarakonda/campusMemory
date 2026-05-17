const User = require('../models/User');
const { sameUniversity } = require('../utils/university');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route GET /api/users/search?q=username
const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim().replace(/^@/, '');

    if (q.length < 1) {
      return res.json({ success: true, users: [] });
    }

    const escaped = escapeRegex(q);
    const regex = new RegExp(escaped, 'i');

    const me = await User.findById(req.user._id);
    const followingSet = new Set(me.following.map((id) => id.toString()));

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ fullName: regex }, { email: regex }, { username: regex }],
    })
      .select('fullName username profilePic university year section followers following')
      .limit(15)
      .sort({ username: 1 });

    res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        fullName: u.fullName,
        username: u.username || '',
        profilePic: u.profilePic,
        university: u.university,
        year: u.year,
        section: u.section,
        followersCount: u.followers.length,
        isFollowing: followingSet.has(u._id.toString()),
        canFollow: sameUniversity(req.user, u),
      })),
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Search failed.' });
  }
};

// @route POST /api/users/:id/follow
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't follow yourself." });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (!sameUniversity(req.user, target)) {
      return res.status(403).json({ success: false, message: 'You can only follow students at your university.' });
    }

    const me = await User.findById(req.user._id);
    const already = me.following.some((id) => id.toString() === targetId);
    if (already) {
      return res.json({ success: true, message: 'Already vibing.', isFollowing: true });
    }

    me.following.push(target._id);
    target.followers.push(me._id);
    await me.save();
    await target.save();

    res.json({
      success: true,
      message: 'Follow the chaos — you’re in!',
      isFollowing: true,
      followersCount: target.followers.length,
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: 'Could not follow user.' });
  }
};

// @route DELETE /api/users/:id/follow
const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const me = await User.findById(req.user._id);
    me.following = me.following.filter((id) => id.toString() !== targetId);
    target.followers = target.followers.filter((id) => id.toString() !== me._id.toString());
    await me.save();
    await target.save();

    res.json({
      success: true,
      message: 'left the vibe circle',
      isFollowing: false,
      followersCount: target.followers.length,
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ success: false, message: 'Could not unfollow user.' });
  }
};

// @route GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const me = await User.findById(req.user._id);
    const isFollowing = me.following.some((id) => id.toString() === user._id.toString());
    const isSelf = user._id.toString() === req.user._id.toString();
    const canFollow = sameUniversity(req.user, user);

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username || '',
        university: user.university,
        department: user.department,
        year: user.year,
        section: user.section,
        profilePic: user.profilePic,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing,
        isSelf,
        canFollow,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
};

module.exports = { searchUsers, followUser, unfollowUser, getUserProfile };
