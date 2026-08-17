import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Cloud, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import useAdminAuth from "../hooks/useAdminAuth"

const Login = () => {
  const { login, admin, loading } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && admin) {
      navigate("/admin", { replace: true })
    }
  }, [admin, loading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      navigate("/admin", { replace: true })
    } catch (err) {
      const msg =
        err.message === "Access denied."
          ? "Access denied. Admins only."
          : err.response?.data?.message || "Login failed."
      toast.error(msg)
    } finally {
      setSubmitting(false)
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            to="/admin/forgot-password"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
