"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { openCurtain, prefersReducedMotion } from "../lib/curtain";

// Wraps a board's grid of windows. With `onView`, the windows stay shut until
// the grid scrolls into view, then open their curtains one by one, once.
// (The home board's windows are opened by the boot intro instead.)
export default function OpenWindows({
  onView = false,
  className = "",
  children,
}: {
  onView?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !onView || prefersReducedMotion()) return;
    const windows = Array.from(el.querySelectorAll<HTMLElement>(".win95-window"));
    windows.forEach((w) => (w.style.opacity = "0"));
    const anims: Animation[] = [];
    // The cursor overlays follow their windows (openCurtain), so the opening
    // starts right away even if the scroll is still going
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        windows.forEach((w, i) => {
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
      windows.forEach((w) => (w.style.opacity = ""));
    };
  }, [onView]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
