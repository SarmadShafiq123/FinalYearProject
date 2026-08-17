import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import File from "../models/File.model.js";
import Folder from "../models/Folder.model.js";
import User from "../models/User.model.js";
import {
  encrypt,
  decrypt,
  generateFileHash,
} from "../services/encryption.service.js";
import {
  uploadEncryptedBuffer,
  deleteFile as cloudinaryDelete,
} from "../services/cloudinary.service.js";
import getFileCategory from "../utils/fileCategory.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No file provided.", 400);
    }

    const user = await User.findById(req.user._id);

    if (user.planStatus === "locked" || user.planStatus === "expired") {
      return errorResponse(
        res,
        "Your storage is locked due to non-payment. Please renew your plan to upload files.",
        403,
      );
    }

    const folderValue = req.body.folder;
    let folder = null;

    if (
      folderValue !== undefined &&
      folderValue !== null &&
      folderValue !== "" &&
      folderValue !== "null"
    ) {
      if (!mongoose.Types.ObjectId.isValid(folderValue)) {
        return errorResponse(res, "Selected folder is invalid.", 400);
      }

      const targetFolder = await Folder.findOne({
        _id: folderValue,
        owner: req.user._id,
      });

      if (!targetFolder) {
        return errorResponse(
          res,
          "Selected folder was not found or is inaccessible.",
          400,
        );
      }

      folder = folderValue;
    }

    if (user.storageUsed + req.file.size > user.storageLimit) {
      return errorResponse(
        res,
        "Storage quota exceeded. Please upgrade your plan.",
        400,
      );
    }

    const fileHash = generateFileHash(req.file.buffer);
    const encryptedBuffer = encrypt(req.file.buffer, req.user._id.toString());
    const encryptedName = crypto.randomBytes(16).toString("hex");

    const cloudinaryResult = await uploadEncryptedBuffer(
      encryptedBuffer,
      encryptedName,
    );

    const category = getFileCategory(req.file.mimetype);

    const file = await File.create({
      owner: req.user._id,
      originalName: req.file.originalname,
      encryptedName,
      cloudinaryPublicId: cloudinaryResult.public_id,
      cloudinaryUrl: cloudinaryResult.secure_url,
      mimeType: req.file.mimetype,
      size: req.file.size,
      folder,
      category,
      isEncrypted: true,
      fileHash,
      algorithm: "AES-256-CBC",
    });

    user.storageUsed += req.file.size;
    await user.save();

    return successResponse(res, { file }, "File uploaded successfully.", 201);
  } catch (err) {
    const message =
      process.env.NODE_ENV === "production" ? "Upload failed." : err.message;
    return errorResponse(res, message, 500);
  }
};

const getFiles = async (req, res) => {
  try {
    const { folder, category } = req.query;
    const query = { owner: req.user._id, isDeleted: false };

    if (folder !== undefined) {
      query.folder = folder === "null" ? null : folder;
    }
    if (category) query.category = category;

    const files = await File.find(query).sort({ createdAt: -1 }).lean();

    return successResponse(res, { files });
  } catch (err) {
    return errorResponse(res, "Failed to fetch files.", 500);
  }
};

const downloadFile = async (req, res) => {
  try {
    const freshUser = await User.findById(req.user._id);
    if (
      freshUser.planStatus === "locked" ||
      freshUser.planStatus === "expired"
    ) {
      return errorResponse(
        res,
        "Your storage is locked. Renew your plan to access your files.",
        403,
      );
    }

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    }).lean();

    if (!file) {
      return errorResponse(res, "File not found.", 404);
    }

    let response;
    try {
      response = await axios.get(file.cloudinaryUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
      });
    } catch (axiosErr) {
      return errorResponse(res, "Failed to retrieve file from storage.", 500);
    }

    try {
      const encryptedBuffer = Buffer.from(response.data);
      const decryptedBuffer = decrypt(encryptedBuffer, req.user._id.toString());

      const hash = generateFileHash(decryptedBuffer);
      if (hash !== file.fileHash) {
        return errorResponse(res, "File integrity check failed.", 400);
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`,
      );
      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Content-Length", decryptedBuffer.length);

      return res.send(decryptedBuffer);
    } catch (processErr) {
      return errorResponse(res, "Error processing file.", 500);
    }
  } catch (err) {
    return errorResponse(res, "Download failed.", 500);
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!file) {
      return errorResponse(res, "File not found.", 404);
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Forbidden. You do not own this file.", 403);
    }

    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    return successResponse(res, null, "File moved to trash.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const moveFile = async (req, res) => {
  try {
    const { folderId } = req.body;

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    });

    if (!file) {
      return errorResponse(res, "File not found.", 404);
    }

    file.folder = folderId || null;
    await file.save();

    return successResponse(res, { file }, "File moved successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export { uploadFile, getFiles, downloadFile, deleteFile, moveFile };
