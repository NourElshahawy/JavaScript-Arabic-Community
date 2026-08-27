"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "jsac-theme";

// tokens.css already defines the full palette for [data-theme="light"] and
// [data-theme="dark"] plus a system default. This just flips the attribute
// on <html> and remembers the choice. The pre-paint script in the root
// layout applies the stored value before first paint to avoid a flash.
function currentTheme() {
  if (typeof document === "undefined") return "light";
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // No persistence available — the toggle still works for this session.
    }
  }

  const label = theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن";

  return (
    <button type="button" className="btn btn--icon" onClick={toggle} aria-label={label} title={label}>
      {/* Render a stable icon until mounted so SSR and first client render match. */}
      {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
