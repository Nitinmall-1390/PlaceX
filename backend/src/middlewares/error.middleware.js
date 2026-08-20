import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${req.id} - ${err.name}: ${err.message}`);
  logger.error(err.stack);

  // Determine the error status code
  const status = err.statusCode || 500;

  // Handle specific error types
  if (err instanceof ApiError) {
    ApiResponse.error(res, err.message, status);
  } else {
    ApiResponse.error(res, 'Internal Server Error', status);
  }
};

export default errorHandler;