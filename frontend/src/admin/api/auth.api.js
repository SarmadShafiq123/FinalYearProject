import adminAxios from "../utils/adminAxios";

const login = (email, password) =>
  adminAxios.post("/auth/login", { email, password });

const getMe = () => adminAxios.get("/auth/me");

const adminForgotPassword = (email) =>
  adminAxios.post("/auth/admin/forgot-password", { email });

const adminVerifyOTP = (email, otp) =>
  adminAxios.post("/auth/admin/verify-otp", { email, otp });

const adminResetPassword = (resetToken, newPassword) =>
  adminAxios.post("/auth/admin/reset-password", { resetToken, newPassword });

export {
  login,
  getMe,
  adminForgotPassword,
  adminVerifyOTP,
  adminResetPassword,
};
