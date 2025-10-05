"use client";

export type ThemeName = "light" | "dark";

const STORAGE_KEY = "practx-theme";

function isTheme(value: string | null): value is ThemeName {
  return value === "light" || value === "dark";
}

export function getPreferredTheme(): ThemeName {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isTheme(stored)) {
    return stored;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export function setTheme(theme: ThemeName) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized: ThemeName = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", normalized);
  window.localStorage.setItem(STORAGE_KEY, normalized);
}

export function toggleTheme() {
  const nextTheme: ThemeName = getPreferredTheme() === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  return nextTheme;
}
