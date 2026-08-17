import axiosInstance from "../utils/axiosInstance";

const login = (email, password) =>
  axiosInstance.post("/api/auth/login", { email, password });

const getMe = () => axiosInstance.get("/api/auth/me");

const adminForgotPassword = (email) =>
  axiosInstance.post("/api/auth/admin/forgot-password", { email });

const adminVerifyOTP = (email, otp) =>
  axiosInstance.post("/api/auth/admin/verify-otp", { email, otp });

const adminResetPassword = (resetToken, newPassword) =>
  axiosInstance.post("/api/auth/admin/reset-password", { resetToken, newPassword });

export { login, getMe, adminForgotPassword, adminVerifyOTP, adminResetPassword };
