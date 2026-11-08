"use client";
import { useSyncExternalStore } from "react";
import { whenSwept } from "../components/linux/theme";
import { projects } from "../projects/data";

// Which project's window is open over the page, if any. The site is a single
// page: opening a project is page state, mirrored in the URL as
// /#projects/<slug> so it can be linked to and Back closes it.
//
// The URL is changed through location.hash rather than history.pushState,
// which Next.js patches to tag entries for its router. Back/Forward reach the
// page as "lx-popstate" (see layout.tsx), never Next's router.

let open: string | null = null;
// The last project opened: its write-up stays in the window while it closes
let last: string | null = null;
// The element the window grows out of (the clicked card or link)
let origin: HTMLElement | null = null;
// Whether opening added a history entry, which closing then goes back over
let pushed = false;
// A hash change made here, which the page's hashchange handler should skip
let selfHash = false;
// Run once a Back-driven close has landed (e.g. a footer jump)
let afterClose: (() => void) | null = null;
const listeners = new Set<() => void>();

function set(slug: string | null) {
  if (slug === open) return;
  open = slug;
  if (slug) last = slug;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useOpenProject() {
  return useSyncExternalStore(subscribe, () => open, () => null);
}

export function useLastProject() {
  return useSyncExternalStore(subscribe, () => last, () => null);
}

export function openProjectNow() {
  return open;
}

export function takeOrigin() {
  const el = origin;
  origin = null;
  return el;
}

// True once for a hash change this module made itself
export function consumeSelfHash() {
  const was = selfHash;
  selfHash = false;
  return was;
}

// The project named by the URL's hash (#projects/<slug>), if it's a real one
export function hashProject() {
  const m = window.location.hash.match(/^#projects\/([\w-]+)\/?$/);
  return m && projects.some((p) => p.slug === m[1]) ? m[1] : null;
}

// Opening, closing and following the URL wait for a palette sweep to end
// (whenSwept, theme.ts)
export function openProject(slug: string, from?: HTMLElement | null) {
  whenSwept(() => openNow(slug, from));
}

function openNow(slug: string, from?: HTMLElement | null) {
  origin = from ?? null;
  if (open === slug) return;
  selfHash = true;
  if (open) {
    // Swapping projects: same history entry
    location.replace(`#projects/${slug}`);
  } else {
    location.hash = `projects/${slug}`;
    pushed = true;
  }
  set(slug);
}

// Closes the open project. When opening added a history entry, this goes
// back over it (so Back and × agree); `after` runs once that has landed.
export function closeProject(after?: () => void) {
  whenSwept(() => closeNow(after));
}

function closeNow(after?: () => void) {
  if (!open) {
    after?.();
    return;
  }
  if (pushed) {
    pushed = false;
    afterClose = after ?? null;
    history.back();
    return;
  }
  selfHash = true;
  location.replace("#projects");
  set(null);
  after?.();
}

// Back/Forward or a typed hash: follow the URL
export function syncProjectFromUrl() {
  whenSwept(syncNow);
}

function syncNow() {
  const slug = hashProject();
  // Back over the entry opening made: it's gone now
  if (!slug) pushed = false;
  set(slug);
  const after = afterClose;
  afterClose = null;
  after?.();
}
