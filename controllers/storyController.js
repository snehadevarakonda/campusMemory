const Story = require('../models/Story');
const { getUniversityFilter } = require('../utils/feedFilters');

// @route GET /api/stories
const getStories = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const scope = req.query.scope === 'year' ? 'year' : 'university';
    const filter = { ...getUniversityFilter(req.user, scope), createdAt: { $gte: since } };

    const stories = await Story.find(filter)
      .populate('userId', 'fullName profilePic')
      .sort({ createdAt: -1 });

    // One ring per user (latest story)
    const byUser = new Map();
    stories.forEach((s) => {
      const uid = s.userId._id.toString();
      if (!byUser.has(uid)) byUser.set(uid, s);
    });

    res.json({ success: true, stories: Array.from(byUser.values()) });
  } catch (error) {
    console.error('Stories error:', error);
    res.status(500).json({ success: false, message: 'Failed to load stories.' });
  }
};

module.exports = { getStories };
