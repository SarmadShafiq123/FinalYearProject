import { createContext, useState, useEffect } from "react"
import toast from "react-hot-toast"
import axiosInstance from "../utils/axiosInstance"
import {
  loginUser,
  registerUser,
  googleLogin as apiGoogleLogin,
  verifyOTP as apiVerifyOTP,
  resendOTP as apiResendOTP,
} from "../api/auth.api"

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    axiosInstance
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data.user)
      })
      .catch(() => {
        localStorage.removeItem("token")
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const register = async (credentials) => {
    const res = await registerUser(credentials)
    const { token: newToken, user: newUser } = res.data.data
    localStorage.setItem("token", newToken)
    setUser(newUser)
    return { success: true, user: newUser }
  }

  const login = async (credentials) => {
    try {
      const res = await loginUser(credentials)
      const { token: newToken, user: newUser } = res.data.data
      localStorage.setItem("token", newToken)
      setUser(newUser)
      toast.success("Welcome back!")
      return { success: true, user: newUser }
    } catch (err) {
      if (err.response?.status === 403) {
        const msg = err.response.data?.message || ""
        if (msg.includes("setup")) {
          throw err
        }
        const authHeader = err.response.headers["authorization"]
        const headerToken = authHeader?.split(" ")[1]
        if (headerToken) {
          localStorage.setItem("token", headerToken)
          const meRes = await axiosInstance.get("/auth/me")
          setUser(meRes.data.data.user)
        }
        return { success: false, needsVerification: true, message: msg }
      }
      throw err
    }
  }

  const googleLogin = async (idToken) => {
    const res = await apiGoogleLogin(idToken)
    const { token: newToken, user: newUser } = res.data.data
    localStorage.setItem("token", newToken)
    setUser(newUser)
    toast.success("Signed in with Google")
    return { success: true, user: newUser }
  }

  const verifyOTP = async (otp) => {
    await apiVerifyOTP(otp)
    const res = await axiosInstance.get("/auth/me")
    setUser(res.data.data.user)
    toast.success("Email verified successfully")
  }

  const resendOTP = async () => {
    await apiResendOTP()
    toast.success("Verification code sent")
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    toast.success("Logged out successfully")
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me")
      setUser(res.data.data.user)
    } catch {
      // silent
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleLogin,
        logout,
        updateUser,
        refreshUser,
        verifyOTP,
        resendOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
