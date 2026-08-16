import { useTheme } from "./useTheme";

/**
 * Reusable modal dialog for action confirmation (logout, delete, etc.).
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {string} [props.title]
 * @param {string} [props.message]
 * @param {string} [props.confirmText]
 * @param {string} [props.cancelText]
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 * @param {boolean} [props.isDanger]
 * @returns {React.ReactElement | null}
 * 
 */
export default function ConfirmModal({

  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false

}) {

  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className={`relative z-10 w-full max-w-sm p-6 rounded-2xl border shadow-2xl transition-all ${
        isDark ? "bg-[#121215] border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
      }`}>
        <div className="text-center space-y-3">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl font-bold ${
            isDanger
              ? isDark ? "bg-red-950/60 text-red-400 border border-red-800/80" : "bg-red-50 text-red-600 border border-red-200"
              : isDark ? "bg-zinc-800 text-zinc-200 border border-zinc-700" : "bg-zinc-100 text-zinc-800 border border-zinc-300"
          }`}>
            {isDanger ? "⚠️" : "🔒"}
          </div>

          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {message}
          </p>

          <div className="flex items-center gap-2.5 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  : isDark
                  ? "bg-white hover:bg-zinc-200 text-black shadow-sm"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>

  );
  
}
