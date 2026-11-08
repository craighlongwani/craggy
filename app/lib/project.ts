"use client";
import { useSyncExternalStore } from "react";
import { whenSwept } from "../components/linux/theme";

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

// True once for a hash change this module made itself
export function consumeSelfHash() {
  const was = selfHash;
  selfHash = false;
  return was;
}

// The project named by the URL's hash (#projects/<slug>), if it's a real
// one: one with a write-up on the page (ProjectView renders them all, so the
// project data itself never has to reach the browser)
export function hashProject() {
  const m = window.location.hash.match(/^#projects\/([\w-]+)\/?$/);
  return m && document.querySelector(`[data-project-view] article[data-slug="${m[1]}"]`)
    ? m[1]
    : null;
}

// Starts decoding a project's write-up video ahead of its window opening
// (when the pointer reaches the card or link that opens it). The video is
// only told to fetch its metadata until then, so without this its first
// frame arrived after the window was already showing: a black box that
// popped into a picture. The file is the card preview's, already cached.
export function warmProject(slug: string) {
  const video = document.querySelector<HTMLVideoElement>(
    `[data-project-view] article[data-slug="${slug}"] video`,
  );
  if (video && video.preload !== "auto") video.preload = "auto";
}

// Opening, closing and following the URL wait for a palette sweep to end
// (whenSwept, theme.ts)
export function openProject(slug: string) {
  whenSwept(() => openNow(slug));
}

function openNow(slug: string) {
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
