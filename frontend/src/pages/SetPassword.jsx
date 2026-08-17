import { useState } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock } from "lucide-react"
import toast from "react-hot-toast"
import { setupPassword } from "../api/auth.api"

const SetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-sm text-center">
          <p className="text-red-400 text-sm mb-4">Invalid or missing setup link.</p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  const validate = () => {
    const errs = {}
    if (password.length < 8) errs.password = "Password must be at least 8 characters."
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match."
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await setupPassword(token, password, confirmPassword)
      toast.success("Password set! You can now sign in.")
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set your password</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Choose a strong password for your CloudStore account.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((p) => ({ ...p, password: undefined }))
                  }}
                  required
                  placeholder="Min. 8 characters"
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-full text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors((p) => ({ ...p, confirmPassword: undefined }))
                  }}
                  required
                  placeholder="••••••••"
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-full text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Setting password..." : "Set Password & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SetPassword
