import crypto from "crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";


/**
 * Generates a short-lived access token (15m).
 * @param {string} userId
 * @returns {string} Signed JWT
 */
export function generateAccessToken(userId) {
  return jwt.sign({ userId }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY
  });
}

/**
 * Generates a refresh token (7d).
 * @param {string} userId
 * @param {string} sessionId
 * @returns {string} Signed JWT
 */
export function generateRefreshToken(userId, sessionId) {
  return jwt.sign({ userId, sessionId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY
  });
}

/**
 * Generates a short-lived authorization token for password resets (15m).
 * @param {string} userId
 * @returns {string} Signed JWT
 */
export function generateResetToken(userId) {
  return jwt.sign({ userId, purpose: "password_reset" }, env.RESET_PASSWORD_SECRET, {
    expiresIn: env.RESET_PASSWORD_EXPIRY
  });
}

/**
 * Verifies an access token.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
}

/**
 * Verifies a refresh token.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
}

/**
 * Verifies a reset token.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export function verifyResetToken(token) {
  return jwt.verify(token, env.RESET_PASSWORD_SECRET);
}

/**
 * Hashes a token using SHA-256 for secure database storage.
 * @param {string} token
 * @returns {string} Hexadecimal hash digest
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
