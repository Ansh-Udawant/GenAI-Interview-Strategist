import { z } from "zod";

const otpRegex = /^\d{6}$/;

/**
 * Registration request body validation schema.
 */
export const registerSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters long"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

/**
 * Email verification OTP validation schema.
 */
export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z.string().regex(otpRegex, "OTP must be exactly 6 numeric digits")
});

/**
 * Resend verification OTP validation schema.
 */
export const resendVerificationOTPSchema = z.object({
  email: z.string().trim().email("Invalid email address")
});

/**
 * User login request body validation schema.
 */
export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

/**
 * Verify login OTP request body validation schema.
 */
export const verifyLoginOTPSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z.string().regex(otpRegex, "OTP must be exactly 6 numeric digits")
});

/**
 * Resend login OTP request body validation schema.
 */
export const resendLoginOTPSchema = z.object({
  email: z.string().trim().email("Invalid email address")
});

/**
 * Forgot password request body validation schema.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address")
});

/**
 * Verify password reset OTP validation schema.
 */
export const verifyResetOTPSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z.string().regex(otpRegex, "OTP must be exactly 6 numeric digits")
});

/**
 * Resend password reset OTP validation schema.
 */
export const resendResetOTPSchema = z.object({
  email: z.string().trim().email("Invalid email address")
});

/**
 * Password reset final submission schema.
 */
export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long")
});

