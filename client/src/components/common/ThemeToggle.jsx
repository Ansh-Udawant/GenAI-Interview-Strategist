import { useTheme } from "./useTheme";

/**
 * UI button component for toggling between light and dark visual themes.
 *
 * @param {Object} props
 * @param {string} [props.className]
 * @returns {React.ReactElement}
 */
export default function ThemeToggle({ className = "" }) {

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
        isDark
          ? "bg-[#18181b] border-zinc-800 text-zinc-200 hover:bg-zinc-800"
          : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
