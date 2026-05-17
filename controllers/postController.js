const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Story = require('../models/Story');
const { uploadImage } = require('../middleware/upload');
const { getClassFilter, getUniversityFilter } = require('../utils/feedFilters');

const enrichPosts = async (posts, currentUser) => {
  const followingSet = new Set((currentUser.following || []).map((id) => id.toString()));
  const myId = currentUser._id.toString();

  return Promise.all(
    posts.map(async (post) => {
      const comments = await Comment.find({ postId: post._id })
        .populate('userId', 'fullName profilePic')
        .sort({ createdAt: 1 });

      const commentCount = await Comment.countDocuments({ postId: post._id });
      const obj = post.toObject ? post.toObject() : post;
      const authorId = obj.userId?._id?.toString() || obj.userId?.toString();

      return {
        ...obj,
        comments,
        commentCount,
        likeCount: (obj.likes || []).length,
        isLiked: (obj.likes || []).some((id) => id.toString() === myId),
        isFollowing: authorId ? followingSet.has(authorId) : false,
        isSelf: authorId === myId,
      };
    })
  );
};

// @route GET /api/posts/feed — class section feed
const getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const posts = await Post.find(getClassFilter(req.user))
      .populate('userId', 'fullName profilePic university year section')
      .sort({ createdAt: -1 });

    const feed = await enrichPosts(posts, me);
    res.json({ success: true, posts: feed });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to load feed.' });
  }
};

// @route GET /api/posts/recent?page=1&limit=12&scope=university|year
const getRecentPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(24, parseInt(req.query.limit, 10) || 12);
    const scope = req.query.scope === 'year' ? 'year' : 'university';
    const me = await User.findById(req.user._id);
    const filter = getUniversityFilter(me, scope);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('userId', 'fullName profilePic university year section')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    const enriched = await enrichPosts(posts, me);

    res.json({
      success: true,
      posts: enriched,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      scope,
    });
  } catch (error) {
    console.error('Recent posts error:', error);
    res.status(500).json({ success: false, message: 'Failed to load recent memories.' });
  }
};

// @route GET /api/posts/following-feed
const getFollowingFeed = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(24, parseInt(req.query.limit, 10) || 12);
    const skip = (page - 1) * limit;

    const me = await User.findById(req.user._id);
    const followingIds = me?.following || [];
    if (followingIds.length === 0) {
      return res.json({
        success: true,
        posts: [],
        page,
        totalPages: 0,
        hasMore: false,
      });
    }

    const filter = {
      userId: { $in: followingIds },
      university: req.user.university,
    };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('userId', 'fullName profilePic university year section')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    const enriched = await enrichPosts(posts, me);

    res.json({
      success: true,
      posts: enriched,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error('Following feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to load following feed.' });
  }
};

const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption || !req.file) {
      return res.status(400).json({ success: false, message: 'Image and caption are required.' });
    }

    const imageUrl = await uploadImage(req.file, 'posts');

    const post = await Post.create({
      userId: req.user._id,
      image: imageUrl,
      caption,
      university: req.user.university,
      year: req.user.year,
      section: req.user.section,
      likes: [],
    });

    // Mini story from latest post (24h ring)
    await Story.create({
      userId: req.user._id,
      image: imageUrl,
      university: req.user.university,
    });

    const populated = await Post.findById(post._id).populate('userId', 'fullName profilePic');

    res.status(201).json({
      success: true,
      message: 'memory dropped ✨',
      post: { ...populated.toObject(), comments: [], commentCount: 0, likeCount: 0, isLiked: false },
    });
  } catch (error) {
    console.error('Create post error:', error);
    const message =
      error.message?.includes('cloudinary') || error.message?.includes('Invalid')
        ? 'Image upload failed. Add Cloudinary keys to .env or restart the server.'
        : error.message || 'Failed to create post.';
    res.status(500).json({ success: false, message });
  }
};

// Like within same university (explore + class)
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      university: req.user.university,
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      likeCount: post.likes.length,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ success: false, message: 'Failed to update like.' });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const target = await User.findById(req.params.userId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'fullName profilePic')
      .sort({ createdAt: -1 });

    const postsWithComments = await enrichPosts(posts, req.user);

    res.json({
      success: true,
      posts: postsWithComments,
      totalPosts: posts.length,
    });
  } catch (error) {
    console.error('User posts error:', error);
    res.status(500).json({ success: false, message: 'Failed to load user posts.' });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id })
      .populate('userId', 'fullName profilePic')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
      totalPosts: posts.length,
    });
  } catch (error) {
    console.error('My posts error:', error);
    res.status(500).json({ success: false, message: 'Failed to load your posts.' });
  }
};

module.exports = {
  getFeed,
  getRecentPosts,
  getFollowingFeed,
  createPost,
  toggleLike,
  getUserPosts,
  getMyPosts,
};
