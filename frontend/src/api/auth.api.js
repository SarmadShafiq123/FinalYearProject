import axiosInstance from "../utils/axiosInstance"

const loginUser = (data) => axiosInstance.post("/auth/login", data)

const registerUser = (data) => axiosInstance.post("/auth/register", data)

const googleLogin = (idToken) => axiosInstance.post("/auth/google", { idToken })

const getCurrentUser = () => axiosInstance.get("/auth/me")

const verifyOTP = (otp) => axiosInstance.post("/auth/verify-otp", { otp })

const resendOTP = () => axiosInstance.post("/auth/resend-otp")

const setupPassword = (token, password, confirmPassword) =>
  axiosInstance.post("/auth/setup-password", { token, password, confirmPassword })

const forgotPassword = (email) =>
  axiosInstance.post("/auth/forgot-password", { email })

const resetPassword = (token, password, confirmPassword) =>
  axiosInstance.post("/auth/reset-password", { token, password, confirmPassword })

export {
  loginUser,
  registerUser,
  googleLogin,
  getCurrentUser,
  verifyOTP,
  resendOTP,
  setupPassword,
  forgotPassword,
  resetPassword,
}
