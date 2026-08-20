import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Determine status code and message
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error
  logger.error(`${req.id || 'app'} - ${err.name || 'Error'}: ${message}`);
  if (status >= 500 && err.stack) {
    logger.error(err.stack);
  }

  // Return formatted API error response
  return ApiResponse.error(res, message, status, err.errors);
};

export default errorHandler;