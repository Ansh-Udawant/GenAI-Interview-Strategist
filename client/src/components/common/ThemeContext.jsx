import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContextInstance";

/**
 * Theme Provider component managing light/dark theme state with localStorage persistence.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactElement}
 */
export function ThemeProvider({ children }) {

  const [theme, setTheme] = useState(() => {

    const saved = localStorage.getItem("genai_theme");
    return saved ? saved : "dark";
    
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("genai_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
