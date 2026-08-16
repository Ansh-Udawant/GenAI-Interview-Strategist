import mongoose from "mongoose";

/**
 * PendingUser Mongoose Schema for unverified registration sessions with auto-expiring TTL index.
 */
const pendingUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    emailVerificationOTP: {
      type: String,
      required: true
    },
    emailVerificationOTPExpiry: {
      type: Date,
      required: true
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0 // MongoDB TTL index
    }
  },
  { timestamps: true }
);

export const pendingUserModel = mongoose.models.PendingUser || mongoose.model("PendingUser", pendingUserSchema);

