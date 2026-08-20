
export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new ApiError(message, 400);
  }

  static unauthorized(message) {
    return new ApiError(message, 401);
  }

  static forbidden(message) {
    return new ApiError(message, 403);
  }

  static notFound(message) {
    return new ApiError(message, 404);
  }

  static validation(messages) {
    return new ApiError(JSON.stringify(messages), 400);
  }

  static serviceUnavailable(message) {
    return new ApiError(message, 503);
  }
}