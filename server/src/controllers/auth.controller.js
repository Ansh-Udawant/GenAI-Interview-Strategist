
import * as authService from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { env } from "../config/env.js";

const COOKIE_OPTIONS_ACCESS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000 // 15 minutes
};

const COOKIE_OPTIONS_REFRESH = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Sets secure HttpOnly authentication cookies on response object.
 *
 * @param {import("express").Response} res
 * @param {string} [accessToken]
 * @param {string} [refreshToken]
 */
function setAuthCookies(res, accessToken, refreshToken) {
  if (accessToken) {
    res.cookie("accessToken", accessToken, COOKIE_OPTIONS_ACCESS);
  }
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS_REFRESH);
  }
}

/**
 * Clears HttpOnly authentication cookies from response object.
 *
 * @param {import("express").Response} res
 */
function clearAuthCookies(res) {
  res.clearCookie("accessToken", COOKIE_OPTIONS_ACCESS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS_REFRESH);
}

/**
 * Extracts request metadata (user-agent device name and client IP) for session tracking.
 *
 * @param {import("express").Request} req
 * @returns {{ deviceName: string, ipAddress: string }}
 */
function getReqInfo(req) {
  return {
    deviceName: req.headers["user-agent"] || "Web Browser",
    ipAddress: req.ip || req.socket?.remoteAddress || ""
  };
}

/**
 * Handles user registration and sends initial email verification OTP.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(new ApiResponse(201, result, "Registration initialised. Verification OTP sent."));
  } catch (err) {
    next(err);
  }
}

/**
 * Resends email verification OTP to pending user.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function resendVerificationOTP(req, res, next) {
  try {
    const result = await authService.resendVerificationOTP(req.body);
    res.status(200).json(new ApiResponse(200, result, "Verification OTP resent."));
  } catch (err) {
    next(err);
  }
}

/**
 * Verifies email OTP, creates user record, and logs in user with auth cookies.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function verifyEmail(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.verifyEmail(req.body, getReqInfo(req));
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json(new ApiResponse(200, { user }, "Email verified successfully. User authenticated."));
  } catch (err) {
    next(err);
  }
}

/**
 * Validates login credentials and sends 2FA login OTP to email.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(new ApiResponse(200, result, "Credentials valid. Login OTP sent to email."));
  } catch (err) {
    next(err);
  }
}

/**
 * Resends 2FA login OTP to user.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function resendLoginOTP(req, res, next) {
  try {
    const result = await authService.resendLoginOTP(req.body);
    res.status(200).json(new ApiResponse(200, result, "Login OTP resent."));
  } catch (err) {
    next(err);
  }
}

/**
 * Verifies 2FA login OTP and sets auth cookies upon success.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function verifyLoginOTP(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.verifyLoginOTP(req.body, getReqInfo(req));
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json(new ApiResponse(200, { user }, "Login OTP verified. User authenticated."));
  } catch (err) {
    next(err);
  }
}

/**
 * Refreshes access token and rotates refresh token using HttpOnly cookies.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function refresh(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    const { user, accessToken, refreshToken } = await authService.refreshTokens(rawRefreshToken, getReqInfo(req));
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json(new ApiResponse(200, { user }, "Token refreshed successfully."));
  } catch (err) {
    clearAuthCookies(res);
    next(err);
  }
}

/**
 * Logs out user from current session and clears auth cookies.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function logout(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    const result = await authService.logout(rawRefreshToken);
    clearAuthCookies(res);
    res.status(200).json(new ApiResponse(200, result, "Logged out successfully."));
  } catch (err) {
    clearAuthCookies(res);
    next(err);
  }
}

/**
 * Revokes all active refresh sessions across all devices for logged in user.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function logoutAll(req, res, next) {
  try {
    const result = await authService.logoutAll(req.user._id);
    clearAuthCookies(res);
    res.status(200).json(new ApiResponse(200, result, "Logged out all devices successfully."));
  } catch (err) {
    clearAuthCookies(res);
    next(err);
  }
}

/**
 * Initiates password reset flow and emails reset OTP.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json(new ApiResponse(200, result, "Password reset OTP processed."));
  } catch (err) {
    next(err);
  }
}

/**
 * Resends password reset OTP.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function resendResetOTP(req, res, next) {
  try {
    const result = await authService.resendResetOTP(req.body);
    res.status(200).json(new ApiResponse(200, result, "Reset OTP resent."));
  } catch (err) {
    next(err);
  }
}

/**
 * Verifies password reset OTP and returns temporary reset token.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function verifyResetOTP(req, res, next) {
  try {
    const result = await authService.verifyResetOTP(req.body);
    res.status(200).json(new ApiResponse(200, result, "Reset OTP verified successfully."));
  } catch (err) {
    next(err);
  }
}

/**
 * Resets user password using reset token and revokes all active sessions.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    clearAuthCookies(res);
    res.status(200).json(new ApiResponse(200, result, "Password reset successfully. Please log in."));
  } catch (err) {
    next(err);
  }
}

/**
 * Returns authenticated user profile data.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function getMe(req, res, next) {
  try {
    const user = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      provider: req.user.provider
    };
    res.status(200).json(new ApiResponse(200, { user }, "Authenticated user profile fetched."));
  } catch (err) {
    next(err);
  }
}

