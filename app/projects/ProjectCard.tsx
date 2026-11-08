"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { isSweeping, SWEEP_END } from "../components/linux/theme";
import { openProject, warmProject } from "../lib/project";

function play(card: Element) {
  void card.querySelector("video")?.play().catch(() => {});
}

function pause(card: Element) {
  card.querySelector("video")?.pause();
}

// A project card's interactive shell around its (server-rendered) window:
// the whole card opens the project (its links still do their own thing),
// and pointing at it plays the preview. Cards ignore the pointer while a
// palette sweep plays (see theme.ts); when it ends, the card catches up with
// where the pointer is now.
export default function ProjectCard({ slug, children }: { slug: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const catchUp = () => {
      const card = ref.current;
      if (!card) return;
      if (card.matches(":hover")) play(card);
      else pause(card);
    };
    window.addEventListener(SWEEP_END, catchUp);
    return () => window.removeEventListener(SWEEP_END, catchUp);
  }, []);

  return (
    <div
      ref={ref}
      className="lx-card cursor-pointer"
      onClick={(e) => {
        if ((e.target as Element).closest("a")) return;
        openProject(slug);
      }}
      onTouchStart={() => warmProject(slug)}
      onMouseEnter={(e) => {
        warmProject(slug);
        if (!isSweeping()) play(e.currentTarget);
      }}
      onMouseLeave={(e) => !isSweeping() && pause(e.currentTarget)}
    >
      {children}
    </div>
  );
}
