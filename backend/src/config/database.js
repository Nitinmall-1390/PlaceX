import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('[Database] FATAL: MONGODB_URI is not configured.');
    process.exit(1);
  }

  try {
    logger.info('[Database] Connecting to MongoDB...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info('[Database] Connected to MongoDB successfully.');
  } catch (error) {
    logger.error('[Database] Failed to connect to MongoDB:', { error: error.message });
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('[Database] MongoDB connection closed.');
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export default { connectDatabase, disconnectDatabase, isDatabaseConnected };
