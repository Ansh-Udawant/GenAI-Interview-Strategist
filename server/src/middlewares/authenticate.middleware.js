import { verifyAccessToken } from "../utils/jwt.js";
import { userModel } from "../models/user.model.js";
import { refreshSessionModel } from "../models/refreshSession.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Authentication Middleware
 * Validates JWT access token from HttpOnly cookies (or Authorization header fallback)
 * and verifies active refresh session exists (for multi-device revocation).
 */
export async function authenticate(req, res, next) {
  
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Authentication token missing or invalid");
    }

    const decoded = verifyAccessToken(token);

    const user = await userModel.findById(decoded.userId).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found or account disabled");
    }

    // Check if active (non-revoked) refresh sessions exist for this user (in case Logout All was performed on another device)
    const activeSessionExists = await refreshSessionModel.exists({ userId: user._id, revokedAt: null });
    if (!activeSessionExists) {
      throw new ApiError(401, "Session has been revoked or logged out from all devices");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid access token"));
    }
    next(error);
  }
}
