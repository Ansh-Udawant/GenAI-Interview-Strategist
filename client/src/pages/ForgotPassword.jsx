import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";

import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "../components/common/useTheme";
import { setPendingEmail } from "../redux/slices/authSlice";
import { api } from "../services/api";

/**
 * Password Recovery Request Page Component where users request password reset OTP.
 *
 * @returns {React.ReactElement}
 */
export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg("");
      await api.post("/api/auth/forgot-password", { email });
      dispatch(setPendingEmail(email));
      navigate("/reset-otp");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 relative ${
      isDark ? "bg-[#09090b] text-zinc-100" : "bg-white text-zinc-900"
    }`}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className={`w-full max-w-sm p-6 sm:p-8 rounded-xl border text-center transition-all ${
        isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
      }`}>
        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm flex items-center justify-center overflow-hidden mx-auto mb-3">
          <img
            src="https://res.cloudinary.com/rcq9ypim/image/upload/v1786791966/ChatGPT_Image_Aug_15_2026_04_34_12_PM.svg"
            alt="GenAI Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-1">Reset Password</h1>
        <p className={`text-xs mb-6 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Enter your email address to receive a 6-digit password reset code
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 text-left">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className={`w-full px-3.5 py-2.5 text-xs rounded-lg border transition-all focus:outline-none ${
                isDark
                  ? "bg-[#09090b] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600"
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <p className={`text-xs text-center mt-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          Remembered password?{" "}
          <Link to="/login" className={`font-semibold hover:underline ${
            isDark ? "text-white" : "text-zinc-900"
          }`}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
