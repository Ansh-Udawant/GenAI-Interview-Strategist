import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import ConfirmModal from "../components/common/ConfirmModal";
import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "../components/common/useTheme";
import { logoutAllDevices, logoutUser } from "../redux/slices/authSlice";
import { fetchReportById } from "../redux/slices/interviewSlice";
import { api } from "../services/api";

/**
 * Interview Detail View Page Component rendering technical questions, STAR behavioral questions, skill gap matrix, preparation checklist, and ATS resume PDF export.
 *
 * @returns {React.ReactElement}
 */
export default function InterviewDetail() {

  const { interviewID } = useParams();
  const [selectedTab, setSelectedTab] = useState("technical");
  const [checkedTasks, setCheckedTasks] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const { theme } = useTheme();

  const { currentReport, loading } = useSelector((state) => state.interview);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (interviewID) {
      dispatch(fetchReportById(interviewID));
    }
  }, [dispatch, interviewID]);

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

  const handleDownloadResume = async () => {
    try {
      setDownloading(true);
      const response = await api.post(
        `/api/interview/resume-pdf/${interviewID}`,
        {},
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ATS_Resume_${currentReport?.title?.replace(/[^a-zA-Z0-9]/g, "_") || "Report"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading resume PDF:", err);
      alert("Failed to download ATS Resume PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const toggleTask = (dayIndex, taskIndex) => {
    const key = `${dayIndex}-${taskIndex}`;
    setCheckedTasks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isDark = theme === "dark";

  if (loading || !currentReport) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-3 ${
        isDark ? "bg-[#09090b] text-zinc-400" : "bg-white text-zinc-600"
      }`}>
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs tracking-wide font-mono">Fetching Strategy Plan...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col ${
      isDark ? "bg-[#09090b] text-zinc-100" : "bg-white text-zinc-900"
    }`}>
      {/* Top Bar */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isDark ? "border-zinc-800/80 bg-[#09090b]/80" : "border-zinc-200 bg-white/80"
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 cursor-pointer min-w-0" onClick={() => navigate("/dashboard")}>
            <button className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}>
              &larr; <span className="hidden xs:inline">Dashboard</span>
            </button>
            <h1 className="font-bold text-xs sm:text-sm tracking-tight truncate max-w-[130px] sm:max-w-xs md:max-w-md">
              {currentReport.title || "Interview Strategy Plan"}
            </h1>
          </div>

          {/* Desktop Right Nav */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={handleDownloadResume}
              disabled={downloading}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                isDark
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {downloading ? "Generating PDF..." : "Download ATS Resume PDF"}
            </button>

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

              {/* Drawer Menu Items */}
              <div className="space-y-2.5">
                <button
                  onClick={handleDownloadResume}
                  disabled={downloading}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                    isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  {downloading ? "Generating PDF..." : "📥 Download ATS Resume PDF"}
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/dashboard");
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-800"
                  }`}
                >
                  📊 Go to Dashboard
                </button>
              </div>
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        {/* Mobile Top Match Score Banner (Always visible at top of page on mobile) */}
        <div className={`lg:hidden p-4 rounded-xl border space-y-3 ${
          isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-400">Match Score</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black">{currentReport.matchScore ?? 0}%</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                  (currentReport.matchScore ?? 0) >= 80
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/80"
                    : "bg-amber-950/60 text-amber-300 border-amber-800/80"
                }`}>
                  Profile Fit
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Target Role</span>
              <p className="text-xs font-semibold truncate max-w-[140px]">{currentReport.title}</p>
            </div>
          </div>

          {currentReport.skillGaps && currentReport.skillGaps.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase text-zinc-400 mb-1.5 block">Skill Gaps to Bridge</span>
              <div className="flex flex-wrap gap-1.5">
                {currentReport.skillGaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                      isDark ? "bg-[#09090b] border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                    }`}
                  >
                    {gap.skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3-Column Segmented Tab Controls (Zero horizontal overflow/clipping on mobile) */}
        <div className={`p-1 sm:p-1.5 rounded-xl border grid grid-cols-3 gap-1 ${
          isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
        }`}>
          <button
            onClick={() => setSelectedTab("technical")}
            className={`py-2 px-1 text-center rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
              selectedTab === "technical"
                ? isDark
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-white"
                : isDark
                ? "text-zinc-400 hover:bg-zinc-800/60"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <span className="sm:hidden">Technical</span>
            <span className="hidden sm:inline">Technical Questions</span>
          </button>

          <button
            onClick={() => setSelectedTab("behavioral")}
            className={`py-2 px-1 text-center rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
              selectedTab === "behavioral"
                ? isDark
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-white"
                : isDark
                ? "text-zinc-400 hover:bg-zinc-800/60"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <span className="sm:hidden">Behavioral</span>
            <span className="hidden sm:inline">Behavioral Questions</span>
          </button>

          <button
            onClick={() => setSelectedTab("roadmap")}
            className={`py-2 px-1 text-center rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
              selectedTab === "roadmap"
                ? isDark
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-white"
                : isDark
                ? "text-zinc-400 hover:bg-zinc-800/60"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <span className="sm:hidden">5-Day Plan</span>
            <span className="hidden sm:inline">5-Day Preparation Plan</span>
          </button>
        </div>

        {/* Content & Desktop Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <main className="lg:col-span-8 space-y-4">
            {selectedTab === "technical" && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
                }`}>
                  <h2 className="text-sm font-bold tracking-tight">
                    Technical Questions
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Curated questions for your candidate profile and target job.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {currentReport.technicalQuestions?.map((item, idx) => (
                    <div key={idx} className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                      isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
                    }`}>
                      <div className="flex items-start gap-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
                          isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                        }`}>
                          Q{idx + 1}
                        </span>
                        <h3 className="text-xs font-bold leading-snug">
                          {item.question}
                        </h3>
                      </div>

                      <div className={`p-3 rounded-lg border space-y-1 ${
                        isDark ? "bg-[#09090b] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <h4 className="text-[10px] uppercase font-bold text-zinc-400">
                          Interviewer Intention
                        </h4>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{item.intention}</p>
                      </div>

                      <div className={`p-3 rounded-lg border space-y-1 ${
                        isDark ? "bg-[#09090b] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <h4 className="text-[10px] uppercase font-bold text-zinc-400">
                          Recommended Answer Structure
                        </h4>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === "behavioral" && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
                }`}>
                  <h2 className="text-sm font-bold tracking-tight">
                    Behavioral Questions
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Situational questions evaluated using the STAR framework.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {currentReport.behavioralQuestion?.map((item, idx) => (
                    <div key={idx} className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                      isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
                    }`}>
                      <div className="flex items-start gap-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
                          isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                        }`}>
                          Q{idx + 1}
                        </span>
                        <h3 className="text-xs font-bold leading-snug">
                          {item.question}
                        </h3>
                      </div>

                      <div className={`p-3 rounded-lg border space-y-1 ${
                        isDark ? "bg-[#09090b] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <h4 className="text-[10px] uppercase font-bold text-zinc-400">
                          Interviewer Intention
                        </h4>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{item.intention}</p>
                      </div>

                      <div className={`p-3 rounded-lg border space-y-1 ${
                        isDark ? "bg-[#09090b] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <h4 className="text-[10px] uppercase font-bold text-zinc-400">
                          STAR Method Strategy
                        </h4>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === "roadmap" && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
                }`}>
                  <h2 className="text-sm font-bold tracking-tight">
                    5-Day Preparation Plan
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Day-by-day prep roadmap with actionable tasks.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {currentReport.preparationPlan?.map((dayItem, dayIdx) => (
                    <div key={dayIdx} className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                      isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded border shrink-0 ${
                          isDark ? "bg-white text-black" : "bg-zinc-900 text-white"
                        }`}>
                          Day {dayItem.day}
                        </span>
                        <h3 className="text-xs font-semibold truncate text-right">{dayItem.focus}</h3>
                      </div>

                      <ul className="space-y-2 pt-1">
                        {dayItem.task?.map((taskText, taskIdx) => {
                          const isChecked = !!checkedTasks[`${dayIdx}-${taskIdx}`];
                          return (
                            <li
                              key={taskIdx}
                              onClick={() => toggleTask(dayIdx, taskIdx)}
                              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 cursor-pointer transition-colors ${
                                isChecked
                                  ? isDark
                                    ? "bg-[#09090b] border-zinc-800 text-zinc-500 line-through"
                                    : "bg-zinc-50 border-zinc-200 text-zinc-400 line-through"
                                  : isDark
                                  ? "bg-[#09090b] border-zinc-800 text-zinc-200 hover:border-zinc-700"
                                  : "bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                readOnly
                                className="w-3.5 h-3.5 rounded cursor-pointer shrink-0"
                              />
                              <span>{taskText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Desktop Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 space-y-4">
            {/* Match Score */}
            <div className={`p-5 rounded-xl border text-center space-y-2.5 ${
              isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
            }`}>
              <h3 className="text-xs font-semibold text-zinc-400">
                Profile Fit Match Score
              </h3>
              <div className="flex flex-col items-center justify-center my-1">
                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
                  isDark ? "border-white text-white" : "border-zinc-900 text-zinc-900"
                }`}>
                  <span className="text-2xl font-bold">
                    {currentReport.matchScore ?? 0}%
                  </span>
                </div>
              </div>
              <p className={`text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Calculated based on your candidate profile vs job description.
              </p>
            </div>

            {/* Skill Gaps */}
            <div className={`p-5 rounded-xl border space-y-3 ${
              isDark ? "bg-[#121215] border-zinc-800" : "bg-white border-zinc-200"
            }`}>
              <h3 className="text-xs font-semibold text-zinc-400">
                Identified Skill Gaps
              </h3>
              <div className="space-y-2">
                {currentReport.skillGaps?.map((gap, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                      isDark ? "bg-[#09090b] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <span className="font-medium">{gap.skill}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                        gap.severity === "high"
                          ? "bg-red-950/60 text-red-300 border-red-800/80"
                          : gap.severity === "medium"
                          ? "bg-amber-950/60 text-amber-300 border-amber-800/80"
                          : isDark
                          ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                          : "bg-zinc-100 text-zinc-600 border-zinc-300"
                      }`}
                    >
                      {gap.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

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
