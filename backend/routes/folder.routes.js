import { Router } from "express";
import {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
} from "../controllers/folder.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/", createFolder);
router.get("/", getFolders);
router.patch("/:id", renameFolder);
router.delete("/:id", deleteFolder);

export default router;
