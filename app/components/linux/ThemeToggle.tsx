"use client";
import { switchTo, useTheme } from "./theme";

// Switches between dark and light (in whichever palette is on). The label
// names the theme a click switches to.
export default function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => switchTo({ theme: next })}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="lx-btn"
      data-theme-toggle
    >
      {next}
    </button>
  );
}
