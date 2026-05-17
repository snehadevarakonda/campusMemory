const mongoose = require('mongoose');

// Mini stories — expire after 24 hours
const storySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    university: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Story', storySchema);
