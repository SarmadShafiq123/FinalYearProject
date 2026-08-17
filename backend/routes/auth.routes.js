import { Router } from "express"
import { body } from "express-validator"
import {
  register,
  login,
  googleLogin,
  getMe,
  verifyOTP,
  resendOTP,
  adminForgotPassword,
  adminVerifyOTP,
  adminResetPassword,
  setupPassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js"
import { protect } from "../middlewares/auth.middleware.js"
import { authRateLimiter, otpRateLimiter, createRateLimiter } from "../middlewares/rateLimiter.middleware.js"

const router = Router()

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many password reset requests. Please try again after an hour.",
})

router.post(
  "/register",
  authRateLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters.")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain uppercase, lowercase, and number."),
  ],
  register
)

router.post(
  "/login",
  authRateLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  login
)

router.post("/google", authRateLimiter, googleLogin)

router.get("/me", protect, getMe)

router.post("/verify-otp", protect, otpRateLimiter, verifyOTP)
router.post("/resend-otp", protect, otpRateLimiter, resendOTP)

router.post("/setup-password", setupPassword)
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword)
router.post("/reset-password", resetPassword)

router.post("/admin/forgot-password", authRateLimiter, adminForgotPassword)
router.post("/admin/verify-otp", otpRateLimiter, adminVerifyOTP)
router.post("/admin/reset-password", adminResetPassword)

export default router
