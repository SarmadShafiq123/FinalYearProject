import { Router } from "express";
import { getTrash, restoreFile, permanentDelete, emptyTrash } from "../controllers/trash.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getTrash);
router.patch("/:id/restore", restoreFile);
router.delete("/empty", emptyTrash);
router.delete("/:id", permanentDelete);

export default router;
