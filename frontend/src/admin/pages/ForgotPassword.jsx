import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Cloud, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { adminForgotPassword, adminVerifyOTP, adminResetPassword } from "../api/auth.api"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState("enter-email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminForgotPassword(email)
      toast.success("OTP sent to your email.")
      setStep("verify-otp")
      setCooldown(60)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setLoading(true)
    try {
      await adminForgotPassword(email)
      toast.success("OTP resent.")
      setCooldown(60)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length !== 6) {
      toast.error("Enter all 6 digits.")
      return
    }
    setLoading(true)
    try {
      const res = await adminVerifyOTP(email, code)
      setResetToken(res.data.data.resetToken)
      setStep("reset-password")
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    try {
      await adminResetPassword(resetToken, newPassword)
      toast.success("Password reset successfully.")
      navigate("/admin/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <Cloud size={28} className="text-blue-500" />
          <p className="text-lg font-semibold text-white mt-3">Admin Panel</p>
          <p className="text-xs text-zinc-500 mt-1">CloudStore Administration</p>
        </div>

        {step === "enter-email" && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="mb-2">
              <p className="text-sm font-semibold text-white">Reset Password</p>
              <p className="text-xs text-zinc-500 mt-1">Enter your admin email</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="admin@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <div className="text-center">
              <Link to="/admin/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        )}

        {step === "verify-otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="mb-2">
              <p className="text-sm font-semibold text-white">Enter OTP</p>
              <p className="text-xs text-zinc-500 mt-1">6-digit code sent to {email}</p>
            </div>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-10 h-11 text-center bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {step === "reset-password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="mb-2">
              <p className="text-sm font-semibold text-white">New Password</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
