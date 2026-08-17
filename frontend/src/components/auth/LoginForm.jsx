import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import GoogleLoginButton from "./GoogleLoginButton";
import toast from "react-hot-toast";
import { getPostLoginRedirect } from "../../utils/planAccess";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await login(form);
      if (result?.needsVerification) {
        navigate("/verify-email");
        return;
      }
      if (result?.success) {
        const u = result.user;
        if (!u.isActive) {
          toast.error(
            "Please complete your account setup. Check your email for the setup link.",
          );
          return;
        }
        navigate(getPostLoginRedirect(u));
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <GoogleLoginButton />

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-500 text-xs">or</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="text-sm text-zinc-400 mb-1 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-full text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm text-zinc-400">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-full text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
