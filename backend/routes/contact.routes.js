import express from "express";
import { submitContact } from "../controllers/contact.controller.js";
import { createRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

const contactLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many contact requests. Please try again later.",
});

router.post("/", contactLimiter, submitContact);

export default router;
