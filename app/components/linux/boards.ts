"use client";
import { useSyncExternalStore } from "react";
import { prefersReducedMotion } from "../../lib/curtain";

// The home page is a vertical scroll of full-screen "boards" (home, projects,
// and later others), numbered in the footer like workspaces. This keeps track
// of which board is on screen and scrolls to one.
export type BoardId = "home" | "projects";
export const boardIds: BoardId[] = ["home", "projects"];

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
  history.replaceState(null, "", id === "home" ? "/" : `/#${id}`);
  return true;
}
