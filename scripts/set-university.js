// Set a user's university — run:
// node scripts/set-university.js your@email.com "Peter University"

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { normalizeUniversity } = require('../utils/university');

const [email, university] = process.argv.slice(2);

if (!email || !university) {
  console.log('Usage: node scripts/set-university.js <email> <university>');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus-memories')
  .then(async () => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      process.exit(1);
    }
    user.university = normalizeUniversity(university);
    await user.save();
    console.log(`Updated ${user.fullName} → university: ${user.university}`);
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
