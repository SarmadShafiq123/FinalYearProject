import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    encryptedName: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    category: {
      type: String,
      enum: ["document", "image", "video", "audio", "archive", "other"],
      default: "other",
    },
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedByExpiry: {
      type: Boolean,
      default: false,
    },
    fileHash: {
      type: String,
    },
    algorithm: {
      type: String,
      default: "AES-256-CBC",
    },
  },
  { timestamps: true },
);

fileSchema.index({ owner: 1, isDeleted: 1 });
fileSchema.index({ owner: 1, folder: 1, isDeleted: 1 });
fileSchema.index({ owner: 1, category: 1, isDeleted: 1 });
fileSchema.index({ isDeleted: 1, deletedAt: 1 });

const File = mongoose.model("File", fileSchema);

export default File;
