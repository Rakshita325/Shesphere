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

/**
 * Upload buffer to Cloudinary or return Base64 Data URI fallback
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
      // Fallback: Convert to base64 Data URI if Cloudinary keys are missing in local dev
      const base64Media = fileBuffer.toString('base64');
      const dataUri = `data:${mimetype};base64,${base64Media}`;
      resolve(dataUri);
    }
  });
};

module.exports = {
  upload,
  uploadToCloudinary
};
