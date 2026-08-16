import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "../components/common/useTheme";
import { clearError, loginUser, setPendingEmail } from "../redux/slices/authSlice";

/**
 * User Login Page Component handling email/password submission and triggering 2FA OTP flow.
 *
 * @returns {React.ReactElement}
 */
export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      dispatch(setPendingEmail(email));
      navigate("/login-otp");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 relative ${
      isDark ? "bg-[#09090b] text-zinc-100" : "bg-white text-zinc-900"
    }`}>
      {/* Absolute Theme Toggle at top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className={`w-full max-w-sm p-6 sm:p-8 rounded-xl border transition-all ${
        isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
      }`}>
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm flex items-center justify-center overflow-hidden mx-auto mb-3">
            <img
              src="https://res.cloudinary.com/rcq9ypim/image/upload/v1786791966/ChatGPT_Image_Aug_15_2026_04_34_12_PM.svg"
              alt="GenAI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Login</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Log in to access your interview prep
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold">Password</label>
              <Link to="/forgot-password" className={`text-xs hover:underline ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full px-3.5 py-2.5 pr-10 text-xs rounded-lg border transition-all focus:outline-none ${
                  isDark
                    ? "bg-[#09090b] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xs transition-colors cursor-pointer ${
                  isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-800"
                }`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.046 10.046 0 013.122-.463c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243m4.242 4.242L3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        <p className={`text-xs text-center mt-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          Don't have an Account?{" "}
          <Link to="/register" className={`font-semibold hover:underline ${
            isDark ? "text-white" : "text-zinc-900"
          }`}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
