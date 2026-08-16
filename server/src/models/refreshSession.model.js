import mongoose from "mongoose";

/**
 * RefreshSession Mongoose Schema for multi-device refresh token rotation and revocation tracking.
 */
const refreshSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0 // MongoDB TTL index
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    },
    revokedAt: {
      type: Date,
      default: null
    },
    deviceName: {
      type: String,
      default: "Unknown Device"
    },
    ipAddress: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const refreshSessionModel = mongoose.models.RefreshSession || mongoose.model("RefreshSession", refreshSessionSchema);

