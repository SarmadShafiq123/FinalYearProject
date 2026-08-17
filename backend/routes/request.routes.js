import express from "express";
import { submitRequest, createPayment, confirmPayment } from "../controllers/request.controller.js";
import { createRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

const requestLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many requests. Please try again later.",
});

router.post("/", requestLimiter, submitRequest);
router.post("/payment/create", protect, requestLimiter, createPayment);
router.post("/payment/confirm", protect, confirmPayment);

export default router;
