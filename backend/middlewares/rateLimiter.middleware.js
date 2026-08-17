import rateLimit from "express-rate-limit";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 15 minutes.",
  },
});

const fileUploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many upload requests. Please try again later.",
  },
});

const adminRateLimiter =
  process.env.NODE_ENV === "production"
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message:
            "Too many admin requests. Please try again after 15 minutes.",
        },
      })
    : (req, res, next) => next();

const createRateLimiter = (options) => {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || "Too many requests. Please try again later.",
    },
    ...options,
  });
};

export {
  authRateLimiter,
  otpRateLimiter,
  fileUploadRateLimiter,
  adminRateLimiter,
  createRateLimiter,
};
