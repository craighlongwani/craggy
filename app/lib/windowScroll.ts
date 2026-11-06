import { prefersReducedMotion } from "./anchor";

// Scroll the desktop window with this id into view and flash a highlight
// around it, so a jump from the Start menu lands somewhere obvious.
export function scrollToWindow(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;

  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "center",
    inline: "nearest",
  });

  // Restart the flash if the window is already mid-highlight
  el.classList.remove("window-target");
  void el.offsetWidth;
  el.classList.add("window-target");
  window.setTimeout(() => el.classList.remove("window-target"), 1600);

  return true;
}

// The id in the URL hash, decoded, or "" when there isn't one
export function hashId() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
