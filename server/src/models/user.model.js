import mongoose from "mongoose";

/**
 * User Mongoose Schema representing registered user accounts.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "credential";
      }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ["credential", "google"],
      default: "credential"
    },
    googleId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export const userModel = mongoose.models.User || mongoose.model("User", userSchema);

