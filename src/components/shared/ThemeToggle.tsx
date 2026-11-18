"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fixmate-theme";
const THEME_EVENT = "fixmate-theme-change";

/** Subscribe to theme changes: our own toggle, other tabs, and the OS. */
function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    media.removeEventListener("change", onChange);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

/** The server cannot know the active theme; assume light for the HTML. */
function getServerSnapshot() {
  return false;
}

/**
 * Light/Dark mode toggle (Sun/Moon). Writes the explicit choice to
 * localStorage (survives reloads) and flips the `dark` class on <html>,
 * which every semantic color token in globals.css responds to.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Storage can be blocked (private mode); the class still applies.
    }
    // Notify this component (and any other toggle on the page).
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      {/* Both icons are mounted and cross-fade so the button never jumps. */}
      <span className="relative flex size-4 items-center justify-center">
        <Sun
          className={cn(
            "absolute size-4 transition-all duration-300",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute size-4 transition-all duration-300",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </span>
    </button>
  );
}
