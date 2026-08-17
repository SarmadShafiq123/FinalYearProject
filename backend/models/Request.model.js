import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    organization: {
      type: String,
      default: null,
      trim: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["free", "starter", "pro", "business"],
    },
    storageBytes: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;
