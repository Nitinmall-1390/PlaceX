export class ApiResponse {
  static success(res, message, data = null) {
    res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, message, data = null) {
    res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static ok(res, message, data = null) {
    res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static notFound(res, message) {
    res.status(404).json({
      success: false,
      message,
    });
  }

  static error(res, message, statusCode = 500) {
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export default ApiResponse;