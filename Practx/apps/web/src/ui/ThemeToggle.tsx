"use client";

import { useEffect, useState } from "react";
import { getPreferredTheme, setTheme, toggleTheme } from "@/lib/theme-controller";

export function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const preferred = getPreferredTheme();
    setTheme(preferred);
    setThemeState(preferred);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  return (
    <button type="button" className="btn btn--ghost" onClick={handleToggle} aria-label="Toggle theme">
      {theme === "dark" ? "Switch to light" : "Switch to dark"}
    </button>
  );
}
