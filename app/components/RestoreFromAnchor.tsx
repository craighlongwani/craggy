"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion, restoreFromAnchor } from "../lib/anchor";

// Grows its child out of the bottom middle of the viewport, like restoring a
// minimized window. `index` staggers siblings so they open one by one.
export default function RestoreFromAnchor({
  index,
  className = "",
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Hidden until this runs, so the server-rendered window doesn't flash at
  // full size before shrinking to the anchor
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";
    if (prefersReducedMotion()) return;
    const animation = restoreFromAnchor(el, index);
    return () => animation.cancel();
  }, [index]);

  return (
    <div ref={ref} className={`flex flex-col ${className}`} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
