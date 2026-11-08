"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { openCurtain, prefersReducedMotion } from "../lib/curtain";

// Wraps a board's grid of windows. With `onView`, each window stays shut
// until it scrolls into view, then opens its curtain, once; windows coming
// into view together open one after another. (The home board's windows are
// opened by the boot intro instead.)
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
      (entries) => {
        const arriving = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => windows.indexOf(a) - windows.indexOf(b));
        arriving.forEach((w, i) => {
          observer.unobserve(w);
          w.style.opacity = "";
          anims.push(openCurtain(w, i));
        });
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    windows.forEach((w) => observer.observe(w));
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
