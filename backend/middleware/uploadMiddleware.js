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

// File filter validation (Images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

/**
 * Upload buffer to Cloudinary or return Base64 Data URI fallback
 */
const uploadToCloudinary = (fileBuffer, folder = 'shesphere_marketplace') => {
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
      // Fallback: Convert to base64 Data URI if Cloudinary keys are missing in local dev
      const base64Image = fileBuffer.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64Image}`;
      resolve(dataUri);
    }
  });
};

module.exports = {
  upload,
  uploadToCloudinary
};
