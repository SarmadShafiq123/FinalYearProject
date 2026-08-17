import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import { adminRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  getDashboardStats,
  getAllUsers,
  updateUserStorage,
  deleteUser,
  getAllRequests,
  approveRequest,
  rejectRequest,
  updateRequestStatus,
  getAllContacts,
  deleteContact,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(protect, requireAdmin, adminRateLimiter);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/storage", updateUserStorage);
router.delete("/users/:id", deleteUser);
router.get("/requests", getAllRequests);
router.patch("/requests/:id/approve", approveRequest);
router.patch("/requests/:id/reject", rejectRequest);
router.patch("/requests/:id/status", updateRequestStatus);
router.get("/contacts", getAllContacts);
router.delete("/contacts/:id", deleteContact);

export default router;
