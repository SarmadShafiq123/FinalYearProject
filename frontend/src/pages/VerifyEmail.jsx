import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getPostLoginRedirect } from "../utils/planAccess";

const VerifyEmail = () => {
  const { verifyOTP, resendOTP, user } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (user?.isEmailVerified) {
      navigate(getPostLoginRedirect(user), { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await verifyOTP(otpString);
      setSuccess("Email verified successfully!");
      setTimeout(() => {
        navigate(getPostLoginRedirect(user), { replace: true });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await resendOTP();
      setSuccess("New OTP sent to your email.");
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verify your email
          </h1>
          <p className="text-zinc-400 text-sm">
            We sent a 6-digit code to your email address
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-10 h-12 text-center text-white text-lg font-bold bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-blue-500 transition-colors"
              disabled={loading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-sm text-center mb-4">{success}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="text-center mt-4">
          <p className="text-zinc-400 text-sm">
            Didn&apos;t receive code?{" "}
            <button
              onClick={handleResend}
              disabled={loading || resendCooldown > 0}
              className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
