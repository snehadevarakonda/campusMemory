const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const uploadsRoot = path.join(__dirname, '..', 'public', 'uploads');

// Store files in memory before uploading
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// True when real Cloudinary keys are set in .env
const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  const placeholders = ['your_cloud_name', 'your_api_key', 'your_api_secret', ''];

  return (
    name &&
    key &&
    secret &&
    !placeholders.includes(name) &&
    !placeholders.includes(key) &&
    !placeholders.includes(secret)
  );
};

// Save image to public/uploads (works without Cloudinary account)
const saveLocally = (buffer, subfolder, mimetype) => {
  const dir = path.join(uploadsRoot, subfolder);
  fs.mkdirSync(dir, { recursive: true });

  const ext = mimetype?.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, buffer);
  return `/uploads/${subfolder}/${filename}`;
};

// Upload buffer to Cloudinary and return secure URL
const uploadToCloudinary = (buffer, folder = 'campus-memories') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Upload an image — uses Cloudinary if configured, otherwise saves locally.
 * @param {Object} file - multer file { buffer, mimetype }
 * @param {'posts'|'profiles'} subfolder
 */
const uploadImage = async (file, subfolder = 'posts') => {
  if (!file?.buffer) {
    throw new Error('No image file received.');
  }

  if (isCloudinaryConfigured()) {
    const cloudFolder =
      subfolder === 'profiles' ? 'campus-memories/profiles' : 'campus-memories/posts';
    return uploadToCloudinary(file.buffer, cloudFolder);
  }

  console.log(`Cloudinary not configured — saving ${subfolder} image locally.`);
  return saveLocally(file.buffer, subfolder, file.mimetype);
};

module.exports = {
  upload,
  uploadImage,
  uploadToCloudinary,
  isCloudinaryConfigured,
};
