import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

import ConfirmModal from "../components/common/ConfirmModal";
import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "../components/common/useTheme";
import { logoutAllDevices, logoutUser } from "../redux/slices/authSlice";
import { createInterviewReport, fetchReports } from "../redux/slices/interviewSlice";

/**
 * Authenticated User Dashboard Component for generating new AI reports and listing historical reports.
 *
 * @returns {React.ReactElement}
 */
export default function Dashboard() {

  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [fileName, setFileName] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    confirmText: "",
    isDanger: false
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const resumeInputRef = useRef(null);
  const { theme } = useTheme();

  const { user } = useSelector((state) => state.auth);
  const { reports, loading } = useSelector((state) => state.interview);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const triggerLogoutConfirm = () => {
    setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
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

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files?.[0];

    if (!resumeFile && !selfDescription.trim()) {
      alert("Please upload a resume PDF or provide a self-description.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please provide a target job description.");
      return;
    }

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    const result = await dispatch(createInterviewReport(formData));
    if (createInterviewReport.fulfilled.match(result)) {
      const report = result.payload;
      if (report && report._id) {
        navigate(`/interview/${report._id}`);
      }
    } else if (createInterviewReport.rejected.match(result)) {
      alert(result.payload || "Failed to generate interview strategy report.");
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col ${
      isDark ? "bg-[#09090b] text-zinc-100" : "bg-white text-zinc-900"
    }`}>
      {/* Navbar */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isDark ? "border-zinc-800/80 bg-[#09090b]/80" : "border-zinc-200 bg-white/80"
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 min-w-0">
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
          </Link>

          {/* Desktop Right Nav */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold">{user?.username}</span>
              <span className="text-[10px] text-zinc-400">{user?.email}</span>
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
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-100 border-zinc-200 text-zinc-900"
              }`}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`relative z-10 w-72 h-full p-5 shadow-2xl flex flex-col justify-between border-l transition-transform ${
            isDark ? "bg-[#09090b] border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/rcq9ypim/image/upload/v1786791966/ChatGPT_Image_Aug_15_2026_04_34_12_PM.svg"
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-bold text-xs">Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* User info card */}
              {user && (
                <div className={`p-3 rounded-xl border space-y-1 ${
                  isDark ? "bg-[#121215] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                }`}>
                  <p className="text-xs font-bold">{user.username}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="space-y-2 pt-4 border-t border-zinc-800/60">
              <button
                onClick={triggerLogoutConfirm}
                className={`w-full py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                Logout
              </button>

              <button
                onClick={triggerLogoutAllConfirm}
                className={`w-full py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-red-400 hover:bg-zinc-800" : "bg-zinc-100 border-zinc-200 text-red-600 hover:bg-zinc-200"
                }`}
              >
                Logout All Devices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Create Interview Strategy
          </h1>
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Provide the target job description and your candidate profile to generate a customized strategy plan.
          </p>
        </div>

        {/* Input Form Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Job Description */}
          <div className={`p-5 rounded-xl border flex flex-col gap-3 ${
            isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold">Target Job Description</label>
              <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
              }`}>
                Required
              </span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              maxLength={5000}
              rows={9}
              placeholder="Paste the target job description here..."
              className={`w-full min-h-[200px] p-3 text-xs rounded-lg border transition-all resize-none focus:outline-none ${
                isDark
                  ? "bg-[#09090b] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600"
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400"
              }`}
            />
            <span className={`text-[10px] self-end ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              {jobDescription.length}/5000 chars
            </span>
          </div>

          {/* Card 2: Profile & Resume */}
          <div className={`p-5 rounded-xl border flex flex-col gap-4 ${
            isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            <div className="space-y-1">
              <label className="block text-xs font-bold">Candidate Profile & Resume</label>
              <p className={`text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Upload a resume PDF or enter a quick self-description.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Upload Resume PDF</label>
              <label className={`w-full min-w-0 border border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDark
                  ? "border-zinc-800 bg-[#09090b] hover:border-zinc-700"
                  : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
              }`}>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span
                  title={fileName || "Choose Resume PDF"}
                  className="text-xs font-semibold w-full max-w-full text-center truncate px-2 block"
                >
                  {fileName ? fileName : "Choose Resume PDF"}
                </span>
                <span className={`text-[10px] mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  PDF or DOCX (Max 3MB)
                </span>
              </label>
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col">
              <label className="block text-xs font-medium">Quick Self-Description</label>
              <textarea
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                rows={3}
                placeholder="Briefly describe your experience, primary tech stack, and key skills..."
                className={`w-full flex-1 min-h-[80px] p-3 text-xs rounded-lg border transition-all resize-none focus:outline-none ${
                  isDark
                    ? "bg-[#09090b] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
        }`}>
          <span className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Takes approx 15–25 seconds to generate
          </span>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className={`w-full sm:w-auto py-2.5 px-6 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {loading ? "Generating..." : "Generate Strategy Plan \u2192"}
          </button>
        </div>

        {/* Saved Strategy Reports */}
        {reports && reports.length > 0 && (
          <section className="space-y-3 pt-2">
            <h2 className="text-base font-bold tracking-tight">
              Saved Reports ({reports.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => navigate(`/interview/${report._id}`)}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                    isDark
                      ? "bg-[#121215] border-zinc-800 hover:border-zinc-700"
                      : "bg-white border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-bold line-clamp-1">
                      {report.title || "Untitled Position"}
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between pt-2 border-t text-xs ${
                    isDark ? "border-zinc-800 text-zinc-300" : "border-zinc-100 text-zinc-700"
                  }`}>
                    <span className="font-semibold">{report.matchScore ?? 0}% Match</span>
                    <span className="text-[11px] font-medium">&rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

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
