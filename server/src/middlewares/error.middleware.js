import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

/**
 * Global Express Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(env.NODE_ENV === "development" && { stack: error.stack })
  };

  return res.status(error.statusCode).json(response);
}
