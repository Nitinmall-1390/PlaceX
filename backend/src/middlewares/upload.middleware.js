import multer, { memoryStorage } from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';
import { isCloudinaryReady } from '../config/cloudinary.js';

// Memory storage - files are processed in memory
const storage = memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = '.' + file.originalname.split('.').pop().toLowerCase();
  const isAllowedExt = (config.upload.allowedExtensions || ['.pdf', '.docx', '.doc', '.txt']).includes(ext);
  const isAllowedMime =
    (config.upload.allowedMimeTypes || []).includes(file.mimetype) ||
    file.mimetype.includes('pdf') ||
    file.mimetype.includes('word') ||
    file.mimetype.includes('document') ||
    file.mimetype.includes('text') ||
    file.mimetype.includes('octet-stream');

  if (!isAllowedExt && !isAllowedMime) {
    return cb(
      ApiError.badRequest(
        `Invalid file type (${file.originalname}). Allowed extensions: ${(config.upload.allowedExtensions || ['.pdf', '.docx']).join(', ')}`
      )
    );
  }

  cb(null, true);
};

const limits = {
  fileSize: (config.upload.maxFileSizeMb || 10) * 1024 * 1024,
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits,
});

export const upload = uploadMiddleware;

export const uploadResume = uploadMiddleware.single('resume');

export const requireCloudinary = (req, res, next) => {
  if (!isCloudinaryReady()) {
    throw ApiError.serviceUnavailable('File upload service is not configured');
  }
  next();
};