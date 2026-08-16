import rateLimit from "express-rate-limit";

/**
 * Rate limiter middleware for sensitive authentication endpoints.
 * Limits each IP to 30 requests per 15-minute window.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});

/**
 * Rate limiter middleware for OTP resend requests.
 * Limits each IP to 3 resend attempts per 1-minute window.
 */
export const otpResendRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many OTP resend attempts. Please wait a minute."
  }
});

