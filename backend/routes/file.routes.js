import { Router } from "express";
import {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
  moveFile,
} from "../controllers/file.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { fileUploadRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.use(protect);

router.post("/upload", fileUploadRateLimiter, upload.single("file"), uploadFile);
router.get("/", getFiles);
router.get("/:id/download", downloadFile);
router.delete("/:id", deleteFile);
router.patch("/:id/move", moveFile);

export default router;
