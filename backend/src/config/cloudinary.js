import { v2 as cloudinaryV2 } from 'cloudinary';
import { config } from './env.js';
import { logger } from './logger.js';

let initialized = false;

export function initCloudinary() {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    logger.warn('[Cloudinary] Credentials not configured. File upload features unavailable.');
    return false;
  }

  cloudinaryV2.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });

  initialized = true;
  logger.info(`[Cloudinary] Initialized for cloud: ${config.cloudinary.cloudName}`);
  return true;
}

export function isCloudinaryReady() {
  return initialized;
}

export { cloudinaryV2 as cloudinary };
