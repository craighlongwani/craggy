"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  arrivedFromMinimize,
  prefersReducedMotion,
  restoreFromAnchor,
  type TaskbarIcon,
} from "../lib/anchor";

// Wraps a page's grid of windows and grows them out of the page's taskbar
// icon one by one, like restoring minimized windows. With `always`, it plays
// on every visit; otherwise only when the previous page minimized into the
// taskbar on the way here.
export default function RestoreWindows({
  icon,
  always = false,
  className = "",
  children,
}: {
  icon: TaskbarIcon;
  always?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // With `always`, the grid starts hidden so the server-rendered windows
  // don't flash at full size before shrinking into the icon
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";
    if (!(always || arrivedFromMinimize()) || prefersReducedMotion()) return;
    const windows = el.querySelectorAll<HTMLElement>(".win95-window");
    const animations = Array.from(windows, (w, i) =>
      restoreFromAnchor(w, i, icon)
    );
    return () => animations.forEach((a) => a.cancel());
  }, [always, icon]);

  return (
    <div
      ref={ref}
      className={className}
      style={always ? { opacity: 0 } : undefined}
    >
      {children}
    </div>
  );
}
