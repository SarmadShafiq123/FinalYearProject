import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import { forgotPassword as apiForgotPassword } from "../api/auth.api"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiForgotPassword(email)
    } catch {
      toast.error("Something went wrong. Try again.")
      setLoading(false)
      return
    }
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-full text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-xl mb-4">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Check your email</h1>
              <p className="text-zinc-400 text-sm mt-1">
                If <span className="text-white">{email}</span> is registered, a password reset link
                has been sent. Check your inbox.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
              <p className="text-zinc-500 text-sm">
                Didn&apos;t receive it? Check your spam folder.
              </p>
              <Link
                to="/login"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors block"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
