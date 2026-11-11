"use client";
import { useSyncExternalStore } from "react";
import { prefersReducedMotion } from "../../lib/curtain";
import { BASE_PATH } from "../../lib/site";

// The home page is a vertical scroll of full-screen "boards" (home, projects,
// education, and later others), numbered in the footer like workspaces. This
// keeps track of which board is on screen and scrolls to one.
export type BoardId = "home" | "projects" | "education";
export const boardIds: BoardId[] = ["home", "projects", "education"];

export function isBoard(id: string): id is BoardId {
  return (boardIds as string[]).includes(id);
}

let active: BoardId = "home";
const listeners = new Set<() => void>();

export function setActiveBoard(id: BoardId) {
  if (id === active) return;
  active = id;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useActiveBoard(): BoardId {
  return useSyncExternalStore(subscribe, () => active, () => "home");
}

// Right after a page loads, the boards are still growing (the calendar sizes
// itself, images load), and a scroll made early is clamped to the page as it
// was then. Keep the board at the top of the screen as they settle, until the
// user takes over the scrolling or `ms` has passed.
export function settleOnBoard(id: BoardId, ms = 1500) {
  const el = document.getElementById(id);
  const scroller = el?.closest<HTMLElement>(".lx-boards");
  if (!el || !scroller) return () => {};
  const takeOver = ["wheel", "touchstart", "keydown", "pointerdown"];
  const realign = () => el.scrollIntoView({ behavior: "auto", block: "start" });
  const observer = new ResizeObserver(realign);
  scroller.querySelectorAll("[data-board]").forEach((b) => observer.observe(b));
  const stop = () => {
    observer.disconnect();
    clearTimeout(timer);
    takeOver.forEach((t) => scroller.removeEventListener(t, stop));
  };
  const timer = setTimeout(stop, ms);
  takeOver.forEach((t) => scroller.addEventListener(t, stop, { passive: true }));
  return stop;
}

// Scrolls to a board and puts it in the URL (replacing the history entry, so
// the back button isn't filled with every board visited). Returns false when
// the page has no such board.
export function jumpToBoard(id: BoardId, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({
    behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
    block: "start",
  });
  history.replaceState(
    null,
    "",
    id === "home" ? `${BASE_PATH}/` : `${BASE_PATH}/#${id}`,
  );
  return true;
}
