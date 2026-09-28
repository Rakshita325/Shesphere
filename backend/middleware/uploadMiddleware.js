const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if environment variables are provided
if (
  process.env.CLOUDINARY_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_SECRET_KEY
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  });
}

// Memory storage for multer file processing
const storage = multer.memoryStorage();

// File filter validation (Images & Videos allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for video/image
  fileFilter
});

const fs = require('fs');
const path = require('path');

/**
 * Upload buffer to Cloudinary or save locally as fallback
 */
const uploadToCloudinary = (fileBuffer, folder = 'shesphere_uploads', mimetype = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are set, stream to Cloudinary
    if (
      process.env.CLOUDINARY_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_SECRET_KEY
    ) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(fileBuffer);
    } else {
      // Fallback for local development: save file to backend/uploads directory
      try {
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const ext = mimetype.split('/')[1] || 'jpg';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, fileBuffer);
        resolve(`/uploads/${filename}`);
      } catch (err) {
        console.error('Error saving local file:', err);
        reject(err);
      }
    }
  });
};

module.exports = {
  upload,
  uploadToCloudinary
};
