import File from "../models/File.model.js";
import User from "../models/User.model.js";
import { deleteFile as cloudinaryDelete } from "../services/cloudinary.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const getTrash = async (req, res) => {
  try {
    const files = await File.find({
      owner: req.user._id,
      isDeleted: true,
    })
      .sort({ deletedAt: -1 })
      .lean();

    const filesWithDaysRemaining = files.map((file) => {
      const daysSinceDeletion = Math.floor(
        (Date.now() - file.deletedAt) / 86400000,
      );
      const retentionDays = file.deletedByExpiry ? 45 : 30;
      const daysRemaining = Math.max(retentionDays - daysSinceDeletion, 0);
      return {
        ...file,
        daysRemaining,
      };
    });

    return successResponse(res, { files: filesWithDaysRemaining });
  } catch (err) {
    return errorResponse(res, "Failed to fetch trash.", 500);
  }
};

const restoreFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: true,
    });

    if (!file) {
      return errorResponse(res, "File not found in trash.", 404);
    }

    file.isDeleted = false;
    file.deletedAt = null;
    file.deletedByExpiry = false;
    await file.save();

    return successResponse(res, { file }, "File restored successfully.");
  } catch (err) {
    return errorResponse(res, "Restore failed.", 500);
  }
};

const permanentDelete = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: true,
    });

    if (!file) {
      return errorResponse(res, "File not found in trash.", 404);
    }

    await cloudinaryDelete(file.cloudinaryPublicId);

    await File.findByIdAndDelete(file._id);

    const user = await User.findById(req.user._id);
    user.storageUsed = Math.max(user.storageUsed - file.size, 0);
    await user.save();

    return successResponse(res, null, "File permanently deleted.");
  } catch (err) {
    return errorResponse(res, "Delete failed.", 500);
  }
};

const emptyTrash = async (req, res) => {
  try {
    const files = await File.find({
      owner: req.user._id,
      isDeleted: true,
    });

    if (files.length === 0) {
      return successResponse(res, null, "Trash is already empty.");
    }

    let totalSize = 0;

    for (const file of files) {
      try {
        await cloudinaryDelete(file.cloudinaryPublicId);
      } catch (err) {
        continue;
      }
      totalSize += file.size;
      await File.findByIdAndDelete(file._id);
    }

    const user = await User.findById(req.user._id);
    user.storageUsed = Math.max(user.storageUsed - totalSize, 0);
    await user.save();

    return successResponse(res, null, "Trash emptied successfully.");
  } catch (err) {
    return errorResponse(res, "Empty trash failed.", 500);
  }
};

export { getTrash, restoreFile, permanentDelete, emptyTrash };
