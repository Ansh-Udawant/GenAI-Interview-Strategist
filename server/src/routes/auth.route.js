import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authRateLimiter, otpResendRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  registerSchema,
  verifyEmailSchema,
  resendVerificationOTPSchema,
  loginSchema,
  verifyLoginOTPSchema,
  resendLoginOTPSchema,
  forgotPasswordSchema,
  verifyResetOTPSchema,
  resendResetOTPSchema,
  resetPasswordSchema
} from "../validators/auth.validator.js";

/**
 * Router handling authentication, OTP verification, session management, and password recovery.
 */
export const authRouter = Router();

// Registration & Email Verification
authRouter.post("/register", authRateLimiter, validate(registerSchema), authController.register);
authRouter.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
authRouter.post("/resend-verification-otp", otpResendRateLimiter, validate(resendVerificationOTPSchema), authController.resendVerificationOTP);

// Login & 2FA Login OTP
authRouter.post("/login", authRateLimiter, validate(loginSchema), authController.login);
authRouter.post("/verify-login-otp", validate(verifyLoginOTPSchema), authController.verifyLoginOTP);
authRouter.post("/resend-login-otp", otpResendRateLimiter, validate(resendLoginOTPSchema), authController.resendLoginOTP);

// Refresh Tokens & Rotation
authRouter.post("/refresh", authController.refresh);

// Logout & Session Revocation
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authenticate, authController.logoutAll);

// Forgot & Reset Password
authRouter.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/verify-reset-otp", validate(verifyResetOTPSchema), authController.verifyResetOTP);
authRouter.post("/resend-reset-otp", otpResendRateLimiter, validate(resendResetOTPSchema), authController.resendResetOTP);
authRouter.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

// User Profile
authRouter.get("/me", authenticate, authController.getMe);
authRouter.get("/get-me", authenticate, authController.getMe); // Compatibility alias

