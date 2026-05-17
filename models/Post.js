const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    caption: { type: String, required: true, trim: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Class identifiers copied from author for strict feed filtering
    university: { type: String, required: true },
    year: { type: String, required: true },
    section: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
