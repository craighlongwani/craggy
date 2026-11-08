"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { boardIds, setActiveBoard, type BoardId } from "./linux/boards";

// The scroll area holding the home page's boards. From 1024px each board is
// one screen tall, and scrolling settles onto a board when it ends close to
// one (proximity snapping); below that the boards just stack. Whichever
// board shows the most is the active one (the highlighted footer button).
export default function Boards({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.intersectionRatio);
        let best: BoardId | null = null;
        let most = 0;
        for (const id of boardIds) {
          const ratio = visible.get(id) ?? 0;
          if (ratio > most) {
            most = ratio;
            best = id;
          }
        }
        if (best) setActiveBoard(best);
      },
      { root: scroller, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    scroller
      .querySelectorAll("[data-board]")
      .forEach((board) => observer.observe(board));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="lx-boards h-full overflow-y-auto pb-10">
      {children}
    </div>
  );
}

// One board: a section of the scroll, one screen tall from 1024px
export function Board({ id, children }: { id: BoardId; children: ReactNode }) {
  return (
    <section id={id} data-board className="lx-board lg:h-full">
      {children}
    </section>
  );
}
