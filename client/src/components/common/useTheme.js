import { useContext } from "react";
import { ThemeContext } from "./ThemeContextInstance";

/**
 * Custom hook accessing theme context state and toggle function.
 *
 * @returns {{ theme: string, toggleTheme: Function, setTheme: Function }}
 * @throws {Error} When used outside of ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

