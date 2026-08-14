"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "./ui";

type Theme = "dark" | "light";

/** Reads the current theme from the <html> attribute the boot script set. */
function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => setTheme(currentTheme()), []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("guru-theme", next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "focus-ring grid size-9 place-items-center rounded-full border border-leaf-500/20 text-mist transition hover:border-leaf-500/45 hover:text-chalk",
        className,
      )}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/**
 * Runs before first paint (as a blocking inline script) so the saved theme is
 * applied with no flash of the wrong colours. Dark is the default.
 */
export const themeBootScript = `try{var t=localStorage.getItem('guru-theme');if(t==='light'){document.documentElement.dataset.theme='light'}else{document.documentElement.dataset.theme='dark'}}catch(e){document.documentElement.dataset.theme='dark'}`;
