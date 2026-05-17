require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus-memories')
  .then(async () => {
    const users = await User.find({
      $or: [{ username: /kavya/i }, { fullName: /kavya/i }],
    }).select('fullName username email university');
    console.log('Kavya matches:', JSON.stringify(users, null, 2));
    console.log('Total users:', await User.countDocuments());
    await mongoose.disconnect();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
