import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { OTPInput } from "../components/common/OTPInput";
import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "../components/common/useTheme";
import { setResetToken } from "../redux/slices/authSlice";
import { api } from "../services/api";

/**
 * Password Reset OTP Verification Page Component.
 *
 * @returns {React.ReactElement}
 */
export default function ResetOTP() {

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pendingEmail } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.post("/api/auth/verify-reset-otp", {
        email: pendingEmail,
        otp
      });
      const resetToken = response.data.data.resetToken;
      dispatch(setResetToken(resetToken));
      navigate("/reset-password");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid or expired reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setInfoMsg("");
      const response = await api.post("/api/auth/forgot-password", { email: pendingEmail });
      setInfoMsg(response.data.message || "New reset code sent to your email.");
    } catch (err) {
      setInfoMsg(err.response?.data?.message || "Failed to resend code.");
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
        <div className={`w-12 h-12 rounded-xl border shadow-sm flex items-center justify-center overflow-hidden mx-auto mb-3 ${
          isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-200 border-zinc-300"
        }`}>
          <img
            src="https://res.cloudinary.com/rcq9ypim/image/upload/v1786791966/ChatGPT_Image_Aug_15_2026_04_34_12_PM.svg"
            alt="GenAI Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-1">Enter Reset Code</h1>
        <p className={`text-xs mb-6 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Enter the 6-digit reset code sent to <strong className={isDark ? "text-white" : "text-zinc-900"}>{pendingEmail || "your email"}</strong>
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 text-left">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className={`mb-4 p-3 rounded-lg border text-xs text-left ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-200" : "bg-zinc-50 border-zinc-200 text-zinc-800"
          }`}>
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            onResend={handleResend}
            loading={loading}
            resendCooldown={45}
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {loading ? "Verifying..." : "Verify Reset Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
