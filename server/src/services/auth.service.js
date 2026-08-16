import bcrypt from "bcryptjs";
import { userModel } from "../models/user.model.js";
import { pendingUserModel } from "../models/pendingUser.model.js";
import { otpRequestModel } from "../models/otpRequest.model.js";
import { refreshSessionModel } from "../models/refreshSession.model.js";
import { generateOTP } from "../utils/generateOTP.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
  verifyResetToken,
  hashToken
} from "../utils/jwt.js";
import {
  sendVerificationEmail,
  sendLoginOTPEmail,
  sendResetPasswordEmail
} from "./email.service.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

const COOLDOWN_SECONDS = 45;

/**
 * Creates user refresh session record in database and returns signed Access & Refresh JWTs.
 *
 * @param {Object} user - User document instance.
 * @param {Object} [reqInfo] - Client request info (deviceName, ipAddress).
 * @returns {Promise<{ accessToken: string, refreshToken: string }>} Signed JWT pair.
 */
async function createAuthTokensAndSession(user, reqInfo = {}) {
  const accessToken = generateAccessToken(user._id.toString());
  
  // Create temporary RefreshSession record to obtain session _id
  const refreshSession = await refreshSessionModel.create({
    userId: user._id,
    tokenHash: "temp_hash_" + Math.random().toString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceName: reqInfo.deviceName || "Web Browser",
    ipAddress: reqInfo.ipAddress || ""
  });

  const refreshToken = generateRefreshToken(user._id.toString(), refreshSession._id.toString());
  const tokenHash = hashToken(refreshToken);

  // Update session with actual SHA-256 token hash
  refreshSession.tokenHash = tokenHash;
  await refreshSession.save();

  return { accessToken, refreshToken };
}

/**
 * Registers a new user and sends email verification OTP.
 *
 * @param {Object} params
 * @param {string} params.username
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{ message: string }>} Success message.
 * @throws {ApiError} When account already exists.
 */
export async function register({ username, email, password }) {

  const existingUser = await userModel.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    throw new ApiError(400, "Account already exists with this email or username");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const rawOTP = generateOTP();
  const hashedOTP = await bcrypt.hash(rawOTP, 10);

  const now = new Date();
  const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

  await pendingUserModel.findOneAndDelete({ email });

  await pendingUserModel.create({
    username,
    email,
    password: hashedPassword,
    emailVerificationOTP: hashedOTP,
    emailVerificationOTPExpiry: otpExpiry,
    expiresAt: otpExpiry,
    lastSentAt: now
  });

  await sendVerificationEmail(email, username, rawOTP);

  return { message: "Verification OTP sent to your email address." };
}

/**
 * Resends email verification OTP to a pending user.
 *
 * @param {Object} params
 * @param {string} params.email
 * @returns {Promise<{ message: string }>} Success message.
 * @throws {ApiError} When session is missing or cooldown is active.
 */
export async function resendVerificationOTP({ email }) {
  const pendingUser = await pendingUserModel.findOne({ email });

  if (!pendingUser) {
    throw new ApiError(404, "No pending registration found for this email address");
  }

  const now = new Date();
  const secondsSinceLastSent = (now.getTime() - new Date(pendingUser.lastSentAt).getTime()) / 1000;

  if (secondsSinceLastSent < COOLDOWN_SECONDS) {
    const remaining = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastSent);
    throw new ApiError(429, `Please wait ${remaining} seconds before requesting a new OTP.`);
  }

  const rawOTP = generateOTP();
  const hashedOTP = await bcrypt.hash(rawOTP, 10);
  const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000);

  pendingUser.emailVerificationOTP = hashedOTP;
  pendingUser.emailVerificationOTPExpiry = otpExpiry;
  pendingUser.expiresAt = otpExpiry;
  pendingUser.lastSentAt = now;
  await pendingUser.save();

  await sendVerificationEmail(email, pendingUser.username, rawOTP);

  return { message: "New verification OTP sent to your email." };
}

/**
 * Verifies email OTP, persists User record, and returns authentication tokens.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.otp
 * @param {Object} reqInfo
 * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
 * @throws {ApiError} When OTP is invalid or expired.
 */
export async function verifyEmail({ email, otp }, reqInfo) {
  const pendingUser = await pendingUserModel.findOne({ email });

  if (!pendingUser) {
    throw new ApiError(400, "Invalid or expired registration session");
  }

  if (new Date() > new Date(pendingUser.emailVerificationOTPExpiry)) {
    throw new ApiError(400, "Verification OTP has expired. Please request a new code.");
  }

  const isOTPValid = await bcrypt.compare(otp, pendingUser.emailVerificationOTP);

  if (!isOTPValid) {
    throw new ApiError(400, "Invalid verification code");
  }

  const user = await userModel.create({
    username: pendingUser.username,
    email: pendingUser.email,
    password: pendingUser.password,
    isVerified: true,
    provider: "credential"
  });

  await pendingUserModel.deleteOne({ _id: pendingUser._id });

  const { accessToken, refreshToken } = await createAuthTokensAndSession(user, reqInfo);

  return {
    user: { id: user._id, username: user.username, email: user.email },
    accessToken,
    refreshToken
  };
}

/**
 * Validates login credentials and sends 2FA login OTP to user email.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{ message: string }>} Success message.
 * @throws {ApiError} When credentials are invalid or cooldown active.
 */
export async function login({ email, password }) {
  const user = await userModel.findOne({ email });

  if (!user || user.provider !== "credential") {
    throw new ApiError(400, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid email or password");
  }

  const existingRequest = await otpRequestModel.findOne({ userId: user._id, type: "LOGIN" });

  const now = new Date();
  if (existingRequest) {
    const secondsSinceLastSent = (now.getTime() - new Date(existingRequest.lastSentAt).getTime()) / 1000;
    if (secondsSinceLastSent < COOLDOWN_SECONDS) {
      const remaining = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastSent);
      throw new ApiError(429, `Please wait ${remaining} seconds before requesting a new login code.`);
    }
  }

  const rawOTP = generateOTP();
  const hashedOTP = await bcrypt.hash(rawOTP, 10);
  const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000);

  await otpRequestModel.findOneAndUpdate(
    { userId: user._id, type: "LOGIN" },
    {
      userId: user._id,
      email: user.email,
      type: "LOGIN",
      otpHash: hashedOTP,
      otpExpiry,
      attempts: 0,
      lastSentAt: now,
      expiresAt: otpExpiry
    },
    { upsert: true, new: true }
  );

  await sendLoginOTPEmail(user.email, user.username, rawOTP);

  return { message: "Login verification OTP sent to your email." };
}

/**
 * Resends 2FA login OTP to user.
 *
 * @param {Object} params
 * @param {string} params.email
 * @returns {Promise<{ message: string }>}
 * @throws {ApiError} When login session is missing or cooldown active.
 */
export async function resendLoginOTP({ email }) {
  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otpReq = await otpRequestModel.findOne({ userId: user._id, type: "LOGIN" });
  if (!otpReq) throw new ApiError(400, "No active login session found");

  const now = new Date();
  const secondsSinceLastSent = (now.getTime() - new Date(otpReq.lastSentAt).getTime()) / 1000;

  if (secondsSinceLastSent < COOLDOWN_SECONDS) {
    const remaining = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastSent);
    throw new ApiError(429, `Please wait ${remaining} seconds before requesting a new login code.`);
  }

  const rawOTP = generateOTP();
  const hashedOTP = await bcrypt.hash(rawOTP, 10);
  const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000);

  otpReq.otpHash = hashedOTP;
  otpReq.otpExpiry = otpExpiry;
  otpReq.expiresAt = otpExpiry;
  otpReq.attempts = 0;
  otpReq.lastSentAt = now;
  await otpReq.save();

  await sendLoginOTPEmail(user.email, user.username, rawOTP);

  return { message: "New login OTP sent to your email." };
}

/**
 * Verifies 2FA login OTP and issues authentication tokens.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.otp
 * @param {Object} reqInfo
 * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
 * @throws {ApiError} When OTP is invalid, expired, or max attempts exceeded.
 */
export async function verifyLoginOTP({ email, otp }, reqInfo) {
  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid login attempt");

  const otpReq = await otpRequestModel.findOne({ userId: user._id, type: "LOGIN" });

  if (!otpReq) {
    throw new ApiError(400, "Login session expired. Please log in again.");
  }

  if (new Date() > new Date(otpReq.otpExpiry)) {
    await otpRequestModel.deleteOne({ _id: otpReq._id });
    throw new ApiError(400, "Login OTP has expired. Please log in again.");
  }

  if (otpReq.attempts >= 3) {
    await otpRequestModel.deleteOne({ _id: otpReq._id });
    throw new ApiError(400, "Too many failed attempts. Please log in again.");
  }

  const isOTPValid = await bcrypt.compare(otp, otpReq.otpHash);

  if (!isOTPValid) {
    otpReq.attempts += 1;
    await otpReq.save();
    throw new ApiError(400, `Invalid OTP code. ${3 - otpReq.attempts} attempts remaining.`);
  }

  await otpRequestModel.deleteOne({ _id: otpReq._id });

  const { accessToken, refreshToken } = await createAuthTokensAndSession(user, reqInfo);

  return {
    user: { id: user._id, username: user.username, email: user.email },
    accessToken,
    refreshToken
  };
}

/**
 * Refreshes access token and rotates refresh token with reuse detection.
 *
 * @param {string} rawRefreshToken
 * @param {Object} reqInfo
 * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
 * @throws {ApiError} When token is invalid, expired, or token reuse is detected.
 */
export async function refreshTokens(rawRefreshToken, reqInfo) {
  if (!rawRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const tokenHash = hashToken(rawRefreshToken);
  const session = await refreshSessionModel.findOne({ tokenHash });

  // REUSE DETECTION: If token was already revoked or not found
  if (!session || session.revokedAt) {
    console.warn(`🚨 Reuse detection triggered for user ${decoded.userId}! Revoking all sessions.`);
    await refreshSessionModel.updateMany({ userId: decoded.userId }, { revokedAt: new Date() });
    throw new ApiError(401, "Security Warning: Refresh token reuse detected. All sessions revoked.");
  }

  if (new Date() > new Date(session.expiresAt)) {
    session.revokedAt = new Date();
    await session.save();
    throw new ApiError(401, "Refresh token expired. Please log in again.");
  }

  const user = await userModel.findById(decoded.userId);
  if (!user) throw new ApiError(401, "User not found");

  // Revoke old session
  session.revokedAt = new Date();
  await session.save();

  // Create new session & tokens
  const { accessToken, refreshToken } = await createAuthTokensAndSession(user, reqInfo);

  return {
    user: { id: user._id, username: user.username, email: user.email },
    accessToken,
    refreshToken
  };
}

/**
 * Revokes refresh session associated with raw refresh token.
 *
 * @param {string} rawRefreshToken
 * @returns {Promise<{ message: string }>}
 */
export async function logout(rawRefreshToken) {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await refreshSessionModel.findOneAndUpdate(
      { tokenHash },
      { revokedAt: new Date() }
    );
  }
  return { message: "Logged out successfully" };
}

/**
 * Revokes all active refresh sessions for a specific user ID.
 *
 * @param {string} userId
 * @returns {Promise<{ message: string }>}
 */
export async function logoutAll(userId) {
  await refreshSessionModel.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
  return { message: "Logged out from all devices successfully" };
}

/**
 * Sends password reset OTP to email.
 *
 * @param {Object} params
 * @param {string} params.email
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPassword({ email }) {
  const user = await userModel.findOne({ email });

  // Generic response to prevent email enumeration
  if (!user || user.provider !== "credential") {
    return { message: "If an account exists with this email, a password reset OTP has been sent." };
  }

  const existingRequest = await otpRequestModel.findOne({ userId: user._id, type: "RESET_PASSWORD" });
  const now = new Date();

  if (existingRequest) {
    const secondsSinceLastSent = (now.getTime() - new Date(existingRequest.lastSentAt).getTime()) / 1000;
    if (secondsSinceLastSent < COOLDOWN_SECONDS) {
      const remaining = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastSent);
      throw new ApiError(429, `Please wait ${remaining} seconds before requesting another code.`);
    }
  }

  const rawOTP = generateOTP();
  const hashedOTP = await bcrypt.hash(rawOTP, 10);
  const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000);

  await otpRequestModel.findOneAndUpdate(
    { userId: user._id, type: "RESET_PASSWORD" },
    {
      userId: user._id,
      email: user.email,
      type: "RESET_PASSWORD",
      otpHash: hashedOTP,
      otpExpiry,
      attempts: 0,
      lastSentAt: now,
      expiresAt: otpExpiry
    },
    { upsert: true, new: true }
  );

  await sendResetPasswordEmail(user.email, user.username, rawOTP);

  return { message: "If an account exists with this email, a password reset OTP has been sent." };
}

/**
 * Resends password reset OTP.
 *
 * @param {Object} params
 * @param {string} params.email
 * @returns {Promise<{ message: string }>}
 */
export async function resendResetOTP({ email }) {
  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otpReq = await otpRequestModel.findOne({ userId: user._id, type: "RESET_PASSWORD" });
  if (!otpReq) throw new ApiError(400, "No active reset password session found");

  const now = new Date();
  const secondsSinceLastSent = (now.getTime() - new Date(otpReq.lastSentAt).getTime()) / 1000;

  if (secondsSinceLastSent < COOLDOWN_SECONDS) {
    const remaining = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastSent);
    throw new ApiError(429, `Please wait ${remaining} seconds before requesting a new code.`);
  }

  const rawOTP = generateOTP();
  const hashedOTP = await bcrypt.hash(rawOTP, 10);
  const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000);

  otpReq.otpHash = hashedOTP;
  otpReq.otpExpiry = otpExpiry;
  otpReq.expiresAt = otpExpiry;
  otpReq.attempts = 0;
  otpReq.lastSentAt = now;
  await otpReq.save();

  await sendResetPasswordEmail(user.email, user.username, rawOTP);

  return { message: "New password reset OTP sent to your email." };
}

/**
 * Verifies password reset OTP and generates single-use reset authorization token.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.otp
 * @returns {Promise<{ resetToken: string }>}
 */
export async function verifyResetOTP({ email, otp }) {
  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid reset attempt");

  const otpReq = await otpRequestModel.findOne({ userId: user._id, type: "RESET_PASSWORD" });

  if (!otpReq) {
    throw new ApiError(400, "Reset session expired. Please request password reset again.");
  }

  if (new Date() > new Date(otpReq.otpExpiry)) {
    await otpRequestModel.deleteOne({ _id: otpReq._id });
    throw new ApiError(400, "Reset OTP has expired. Please try again.");
  }

  if (otpReq.attempts >= 3) {
    await otpRequestModel.deleteOne({ _id: otpReq._id });
    throw new ApiError(400, "Too many failed attempts. Please request password reset again.");
  }

  const isOTPValid = await bcrypt.compare(otp, otpReq.otpHash);

  if (!isOTPValid) {
    otpReq.attempts += 1;
    await otpReq.save();
    throw new ApiError(400, `Invalid OTP code. ${3 - otpReq.attempts} attempts remaining.`);
  }

  await otpRequestModel.deleteOne({ _id: otpReq._id });

  const resetToken = generateResetToken(user._id.toString());
  return { resetToken };
}

/**
 * Resets user password using reset token and revokes all active sessions.
 *
 * @param {Object} params
 * @param {string} params.resetToken
 * @param {string} params.newPassword
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword({ resetToken, newPassword }) {
  let decoded;
  try {
    decoded = verifyResetToken(resetToken);
  } catch (err) {
    throw new ApiError(400, "Invalid or expired reset authorization. Please try again.");
  }

  const user = await userModel.findById(decoded.userId);
  if (!user) throw new ApiError(404, "User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  // Revoke all refresh sessions on password change
  await refreshSessionModel.updateMany({ userId: user._id }, { revokedAt: new Date() });

  return { message: "Password updated successfully. Please log in with your new password." };
}


