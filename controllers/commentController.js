const Post = require('../models/Post');
const Comment = require('../models/Comment');

const findAccessiblePost = async (postId, user) =>
  Post.findOne({ _id: postId, university: user.university });

// @route POST /api/comments/:postId
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const post = await findAccessiblePost(req.params.postId, req.user);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = await Comment.create({
      userId: req.user._id,
      postId: post._id,
      text: text.trim(),
    });

    const populated = await Comment.findById(comment._id).populate('userId', 'fullName profilePic');
    const commentCount = await Comment.countDocuments({ postId: post._id });

    res.status(201).json({
      success: true,
      message: 'lore posted',
      comment: populated,
      commentCount,
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
};

// @route GET /api/comments/:postId
const getComments = async (req, res) => {
  try {
    const post = await findAccessiblePost(req.params.postId, req.user);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comments = await Comment.find({ postId: post._id })
      .populate('userId', 'fullName profilePic')
      .sort({ createdAt: 1 });

    res.json({ success: true, comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to load comments.' });
  }
};

module.exports = { addComment, getComments };
