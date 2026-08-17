import Folder from "../models/Folder.model.js";
import File from "../models/File.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const createFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, "Folder name is required.", 400);
    }

    const existingFolder = await Folder.findOne({
      name: name.trim(),
      owner: req.user._id,
      parentFolder: parentFolder || null,
    });

    if (existingFolder) {
      return errorResponse(res, "Folder with this name already exists in this location.", 409);
    }

    const folder = await Folder.create({
      name: name.trim(),
      owner: req.user._id,
      parentFolder: parentFolder || null,
    });

    return successResponse(res, { folder }, "Folder created successfully.", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id })
      .populate("parentFolder", "name")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, { folders });
  } catch (err) {
    return errorResponse(res, "Failed to fetch folders.", 500);
  }
};

const renameFolder = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, "Folder name is required.", 400);
    }

    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return errorResponse(res, "Folder not found.", 404);
    }

    if (folder.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Forbidden. You do not own this folder.", 403);
    }

    folder.name = name.trim();
    await folder.save();

    return successResponse(res, { folder }, "Folder renamed successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      return errorResponse(res, "Folder not found.", 404);
    }

    await File.updateMany(
      { owner: req.user._id, folder: req.params.id },
      { folder: null }
    );

    await Folder.findByIdAndDelete(req.params.id);

    return successResponse(res, null, "Folder deleted successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export { createFolder, getFolders, renameFolder, deleteFolder };
