import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import {
  getMyAlerts,
  getUnreadAlerts,
  readAlert,
  readAllAlerts,
  removeAlert,
  sendAlertToUser,
  sendAlertToMultipleUsers,
  getAllAlerts,
  deleteAlertByAdmin,
  getAlertStats,
} from "../controllers/alert.controller.js";

const router = Router();

// Specific routes first (before generic :id routes)

// User routes - specific paths
router.get("/my-alerts", protect, getMyAlerts);
router.get("/unread-count", protect, getUnreadAlerts);
router.patch("/read-all", protect, readAllAlerts);

// Admin routes - specific paths
router.post("/send-to-user", protect, requireAdmin, sendAlertToUser);
router.post("/send-to-multiple", protect, requireAdmin, sendAlertToMultipleUsers);
router.get("/stats", protect, requireAdmin, getAlertStats);

// Generic routes with :id parameter (must come after specific routes)
router.patch("/:id/read", protect, readAlert);
router.delete("/:id", protect, removeAlert);
router.delete("/:id/admin", protect, requireAdmin, deleteAlertByAdmin);

// Admin routes - generic
router.get("/", protect, requireAdmin, getAllAlerts);

export default router;
