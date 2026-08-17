import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "masterAdmin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    setupToken: {
      type: String,
      default: null,
    },
    setupTokenExpiry: {
      type: Date,
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
    storageLimit: {
      type: Number,
      default: 1073741824,
    },
    plan: {
      type: String,
      enum: ["free", "starter", "pro", "business"],
      default: "free",
    },
    planStatus: {
      type: String,
      enum: ["inactive", "active", "locked", "expired", "free"],
      default: "inactive",
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    gracePeriodStart: {
      type: Date,
      default: null,
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index({ googleId: 1 });

const User = mongoose.model("User", userSchema);

export default User;
