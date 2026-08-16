import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

import ConfirmModal from "../components/common/ConfirmModal";
import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "../components/common/useTheme";
import { logoutAllDevices, logoutUser } from "../redux/slices/authSlice";

/**
 * Public Landing Page Component displaying application features and authentication entry points.
 *
 * @returns {React.ReactElement}
 */
export default function Home() {

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isDark = theme === "dark";

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    confirmText: "",
    isDanger: false
  });

  const triggerLogoutConfirm = () => {
    setConfirmModal({
      isOpen: true,
      type: "logout",
      title: "Confirm Logout",
      message: "Are you sure you want to log out of your account?",
      confirmText: "Yes, Logout",
      isDanger: true
    });
  };

  const triggerLogoutAllConfirm = () => {
    setConfirmModal({
      isOpen: true,
      type: "logoutAll",
      title: "Logout All Devices",
      message: "Are you sure you want to log out from all active sessions across all devices?",
      confirmText: "Yes, Logout All",
      isDanger: true
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "logout") {
      dispatch(logoutUser()).then(() => navigate("/login"));
    } else if (confirmModal.type === "logoutAll") {
      dispatch(logoutAllDevices()).then(() => navigate("/login"));
    }
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col ${
      isDark ? "bg-[#09090b] text-zinc-100" : "bg-white text-zinc-900"
    }`}>
      {/* Navbar */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isDark ? "border-zinc-800/80 bg-[#09090b]/80" : "border-zinc-200 bg-white/80"
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-14 sm:h-16 py-2 sm:py-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="https://res.cloudinary.com/rcq9ypim/image/upload/v1786791966/ChatGPT_Image_Aug_15_2026_04_34_12_PM.svg"
                alt="GenAI Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-tight truncate max-w-[130px] sm:max-w-none">
              GenAI Interview Strategist
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`hidden sm:block text-xs font-medium hover:underline ${
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  Dashboard
                </Link>
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold">{user.username}</span>
                  <span className="text-[10px] text-zinc-400">{user.email}</span>
                </div>
                <button
                  onClick={triggerLogoutAllConfirm}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Logout All
                </button>
                <button
                  onClick={triggerLogoutConfirm}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    isDark
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isDark
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          Prepare for your next technical interview with AI strategy
        </h1>
        <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8 ${
          isDark ? "text-zinc-400" : "text-zinc-600"
        }`}>
          Analyze target job descriptions against your resume to generate technical & behavioral interview questions, skill gap matrix, and a 5-day study plan.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className={`w-full sm:w-auto px-6 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                isDark
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className={`w-full sm:w-auto px-6 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                  isDark
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className={`w-full sm:w-auto px-6 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h2 className="text-lg font-bold text-center mb-8">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-xl border ${
            isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            <h3 className="text-xs font-bold mb-1.5">Resume ATS Parsing</h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Extract skills and experience from your resume PDF to compare against target job criteria.
            </p>
          </div>

          <div className={`p-5 rounded-xl border ${
            isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            <h3 className="text-xs font-bold mb-1.5">Technical Questions</h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Get role-specific technical questions with interviewer intention and answer structures.
            </p>
          </div>

          <div className={`p-5 rounded-xl border ${
            isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            <h3 className="text-xs font-bold mb-1.5">STAR Behavioral Method</h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Prepare situational responses structured using the STAR method.
            </p>
          </div>

          <div className={`p-5 rounded-xl border ${
            isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            <h3 className="text-xs font-bold mb-1.5">5-Day Action Plan</h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Follow a day-by-day task checklist to prepare effectively for your interview.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isDark ? "border-zinc-800 text-zinc-500" : "border-zinc-200 text-zinc-500"
      }`}>
        <p>© GenAI Interview Strategist. All rights reserved.</p>
      </footer>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
