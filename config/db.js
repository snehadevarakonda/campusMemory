const mongoose = require('mongoose');

// Connect to MongoDB using the URI from environment variables
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Tip: Start MongoDB or use MongoDB Atlas and update MONGODB_URI in .env');
    console.error('The website will still open, but signup/login will not work until MongoDB is connected.');
  }
};

module.exports = connectDB;
