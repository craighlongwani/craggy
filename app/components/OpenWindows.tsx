"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  arrivedFromCurtain,
  collapseThenOpen,
  collapsingProject,
  openCurtain,
  prefersReducedMotion,
} from "../lib/curtain";

// Wraps a page's grid of windows and opens their curtains one by one. With
// `always`, it plays on every visit; otherwise only when the previous page
// closed its own windows on the way here. Coming back from a project page,
// that project's window (tagged data-project) first shrinks back into its
// slot.
export default function OpenWindows({
  always = false,
  className = "",
  children,
}: {
  always?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // With `always`, the grid starts hidden so the server-rendered windows
  // don't flash open before their curtains start
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";
    if (!(always || arrivedFromCurtain()) || prefersReducedMotion()) return;
    const windows = el.querySelectorAll<HTMLElement>(".win95-window");
    const slug = collapsingProject();
    const selected = slug
      ? el.querySelector<HTMLElement>(`[data-project="${slug}"]`)
      : null;
    if (selected) {
      const others = Array.from(windows).filter((w) => w !== selected);
      return collapseThenOpen(selected, others);
    }
    const animations = Array.from(windows, (w, i) => openCurtain(w, i));
    return () => animations.forEach((a) => a.cancel());
  }, [always]);

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
