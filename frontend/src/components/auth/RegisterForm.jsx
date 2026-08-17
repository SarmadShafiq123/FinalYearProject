import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import GoogleLoginButton from "./GoogleLoginButton";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email) return "Email is required.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(form.password)) return "Password must contain lowercase letters.";
    if (!/[A-Z]/.test(form.password)) return "Password must contain uppercase letters.";
    if (!/\d/.test(form.password)) return "Password must contain numbers.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const result = await register({ name: form.name, email: form.email, password: form.password });
      if (result.success) {
        // Preserve any redirect/plan params so VerifyEmail can bounce back to /pricing
        const redirect = searchParams.get("redirect");
        const plan = searchParams.get("plan");
        const params = new URLSearchParams();
        if (redirect) params.set("redirect", redirect);
        if (plan) params.set("plan", plan);
        const query = params.toString();
        navigate(`/verify-email${query ? `?${query}` : ""}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-full text-sm";

  // Build the login link preserving any redirect/plan params
  const redirect = searchParams.get("redirect");
  const plan = searchParams.get("plan");
  const loginParams = new URLSearchParams();
  if (redirect) loginParams.set("redirect", redirect);
  if (plan) loginParams.set("plan", plan);
  const loginQuery = loginParams.toString();
  const loginHref = `/login${loginQuery ? `?${loginQuery}` : ""}`;

  return (
    <div className="space-y-4">
      <GoogleLoginButton />

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-zinc-800"></div>
        <span className="text-zinc-500 text-xs">or</span>
        <div className="flex-1 h-px bg-zinc-800"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="reg-name" className="text-sm text-zinc-400 mb-1 block">
            Full Name
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="text-sm text-zinc-400 mb-1 block">
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="text-sm text-zinc-400 mb-1 block">
            Password
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={handleChange}
            className={inputClass}
            placeholder="Min. 8 chars, uppercase, lowercase, number"
          />
        </div>

        <div>
          <label htmlFor="reg-confirmPassword" className="text-sm text-zinc-400 mb-1 block">
            Confirm Password
          </label>
          <input
            id="reg-confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            to={loginHref}
            className="text-blue-500 hover:text-blue-400 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
