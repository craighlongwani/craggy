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
// closed its own windows on the way here. With `onView` (a board of the home
// page), the windows stay shut until the grid scrolls into view, then open
// once. Coming back from a project page, that project's window (tagged
// data-project) first shrinks back into its slot.
export default function OpenWindows({
  always = false,
  onView = false,
  className = "",
  children,
}: {
  always?: boolean;
  onView?: boolean;
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
    const windows = el.querySelectorAll<HTMLElement>(".win95-window");
    const slug = collapsingProject();
    const selected = slug
      ? el.querySelector<HTMLElement>(`[data-project="${slug}"]`)
      : null;

    if (onView) {
      if (prefersReducedMotion()) return;
      const all = Array.from(windows);
      // Back from a project page: its board is already scrolled to, and the
      // window shrinks into its slot
      if (selected) {
        el.closest("[data-board]")?.scrollIntoView({ behavior: "auto", block: "start" });
        return collapseThenOpen(selected, all.filter((w) => w !== selected));
      }
      all.forEach((w) => (w.style.opacity = "0"));
      const anims: Animation[] = [];
      // The cursor overlays follow their windows (openCurtain), so the
      // opening starts right away even if the scroll is still going
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          all.forEach((w, i) => {
            w.style.opacity = "";
            anims.push(openCurtain(w, i));
          });
        },
        { rootMargin: "0px 0px -25% 0px" },
      );
      observer.observe(el);
      return () => {
        observer.disconnect();
        anims.forEach((a) => a.cancel());
        all.forEach((w) => (w.style.opacity = ""));
      };
    }

    if (!(always || arrivedFromCurtain()) || prefersReducedMotion()) return;
    if (selected) {
      const others = Array.from(windows).filter((w) => w !== selected);
      return collapseThenOpen(selected, others);
    }
    const animations = Array.from(windows, (w, i) => openCurtain(w, i));
    return () => animations.forEach((a) => a.cancel());
  }, [always, onView]);

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
