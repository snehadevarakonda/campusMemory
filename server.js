require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const storyRoutes = require('./routes/storyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes (must be before static files)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Campus Memories API is running' });
});
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);

// Static assets (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML pages
const viewsPath = path.join(__dirname, 'views');
app.get('/', (req, res) => res.sendFile(path.join(viewsPath, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(viewsPath, 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(viewsPath, 'signup.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(viewsPath, 'dashboard.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(viewsPath, 'profile.html')));
app.get('/recent', (req, res) => res.sendFile(path.join(viewsPath, 'recent.html')));
app.get('/following-feed', (req, res) => res.sendFile(path.join(viewsPath, 'following-feed.html')));

// JSON 404 for unknown API routes (avoids HTML parse errors in the browser)
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.path}` });
});

// Global error handler for multer and other errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong.',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Campus Memories server running on port ${PORT}`);
});
