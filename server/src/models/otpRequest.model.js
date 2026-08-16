import mongoose from "mongoose";

/**
 * OTPRequest Mongoose Schema for managing 2FA Login and Password Reset OTP attempts and expirations.
 */
const otpRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    type: {
      type: String,
      enum: ["LOGIN", "RESET_PASSWORD"],
      required: true
    },
    otpHash: {
      type: String,
      required: true
    },
    otpExpiry: {
      type: Date,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
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

// Ensure single active OTP request per user and type
otpRequestSchema.index({ userId: 1, type: 1 }, { unique: true });

export const otpRequestModel = mongoose.models.OTPRequest || mongoose.model("OTPRequest", otpRequestSchema);

