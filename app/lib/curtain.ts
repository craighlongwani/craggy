// Page transitions. Leaving a page closes its windows like a vertical
// curtain: each window's top and bottom edges slide in until they meet along
// the middle. The next page's windows open the same way, one after another.
// Opening a project from /projects is the one exception: the chosen window
// grows into the project page while all the others close.

export type Page = "home" | "projects";

export const CLOSE_MS = 250;
export const OPEN_MS = 250;
export const OPEN_STAGGER_MS = 50;

// clip-path insets: fully shown, and shut to a line across the middle
const SHOWN = "inset(0% 0 0% 0)";
const SHUT = "inset(50% 0 50% 0)";

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function closeCurtain(el: HTMLElement) {
  return el.animate([{ clipPath: SHOWN }, { clipPath: SHUT }], {
    duration: CLOSE_MS,
    easing: "ease-in",
    fill: "forwards",
  });
}

export function openCurtain(
  el: HTMLElement,
  index = 0,
  // Extra wait before the staggered opening begins
  after = 0,
) {
  // Backwards fill keeps the window shut until its turn comes
  return el.animate([{ clipPath: SHUT }, { clipPath: SHOWN }], {
    duration: OPEN_MS,
    delay: after + index * OPEN_STAGGER_MS,
    easing: "ease-out",
    fill: "backwards",
  });
}

// Set when a page closes its windows on the way out, so the next page opens
// its windows instead of playing the usual page fade. It's a timestamp
// rather than a one-shot flag so React's dev double-render and the template
// can both read it safely.
let closedAt = -Infinity;

export function arrivedFromCurtain() {
  return performance.now() - closedAt < 1500;
}

// Close every window on the page, then run `go` (usually a router.push to the
// next page)
export function curtainAndGo(go: () => void) {
  const windows = document.querySelectorAll<HTMLElement>("main .win95-window");
  const leave = () => {
    closedAt = performance.now();
    go();
  };
  if (windows.length === 0 || prefersReducedMotion()) {
    leave();
    return;
  }
  const animations = Array.from(windows, closeCurtain);
  // Animations stall when the browser stops drawing frames (e.g. a hidden
  // tab), so a timer guarantees we still navigate
  let left = false;
  const leaveOnce = () => {
    if (left) return;
    left = true;
    leave();
  };
  Promise.all(animations.map((a) => a.finished)).then(leaveOnce);
  setTimeout(leaveOnce, CLOSE_MS + 100);
}

// ── Opening a project ────────────────────────────────────────────────────
// On /projects, View closes every other window like a curtain while the
// chosen one grows to fill the bento area, then the project page loads in
// that same spot.

export const EXPAND_MS = 300;
const EXPAND_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

let expandedAt = -Infinity;

// True right after a project window expanded on the way here (generous, so
// a slow dev compile of the next page still counts)
export function arrivedFromExpand() {
  return performance.now() - expandedAt < 10000;
}

// Where an open project's window sits: centered in the bento area ([data-bento]),
// full height, and 25% wider than the old project page card. Keep in step
// with ProjectWindow's width classes.
export function projectWindowRect() {
  const bento = document.querySelector<HTMLElement>("[data-bento]");
  if (!bento) return null;
  const r = bento.getBoundingClientRect();
  const cs = getComputedStyle(bento);
  const pl = parseFloat(cs.paddingLeft);
  const pr = parseFloat(cs.paddingRight);
  const pt = parseFloat(cs.paddingTop);
  const pb = parseFloat(cs.paddingBottom);
  const contentWidth = r.width - pl - pr;
  const vw = window.innerWidth;
  const wanted = vw >= 1024 ? vw * 0.625 : vw >= 768 ? vw * 0.9375 : contentWidth;
  const width = Math.min(wanted, contentWidth);
  return {
    left: r.left + pl + (contentWidth - width) / 2,
    top: r.top + pt,
    width,
    height: r.height - pt - pb,
  };
}

// The expanding stand-in for the chosen window; the project page removes it
// once its own window is in place underneath. Its safety-net removal timer
// is cancelled too, so the timer doesn't keep the detached copy in memory.
const ghostTimers = new Set<ReturnType<typeof setTimeout>>();

export function removeExpandGhost() {
  document.querySelectorAll("[data-expand-ghost]").forEach((g) => g.remove());
  ghostTimers.forEach(clearTimeout);
  ghostTimers.clear();
}

export function expandAndGo(selected: HTMLElement, go: () => void) {
  const target = projectWindowRect();
  const leave = () => {
    expandedAt = performance.now();
    go();
  };
  if (!target || prefersReducedMotion()) {
    leave();
    return;
  }

  // Everything else closes
  const others = Array.from(
    document.querySelectorAll<HTMLElement>("main .win95-window"),
  ).filter((w) => w !== selected);
  const animations = others.map(closeCurtain);

  // A fixed copy of the chosen window grows to the project page's window, so
  // the grid underneath doesn't reflow. Its contents fade out, leaving an
  // empty window for the project page to fill.
  const from = selected.getBoundingClientRect();
  const ghost = selected.cloneNode(true) as HTMLElement;
  ghost.dataset.expandGhost = "";
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  Object.assign(ghost.style, {
    position: "fixed",
    margin: "0",
    zIndex: "60",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
  });
  document.body.appendChild(ghost);
  selected.style.visibility = "hidden";

  const body = ghost.children[1] as HTMLElement | undefined;
  body?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: EXPAND_MS / 2,
    fill: "forwards",
  });
  animations.push(
    ghost.animate(
      [
        {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
        },
        {
          left: `${target.left}px`,
          top: `${target.top}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
        },
      ],
      { duration: EXPAND_MS, easing: EXPAND_EASE, fill: "forwards" },
    ),
  );

  // Same stalled-animation guard as curtainAndGo; and never leave the ghost
  // behind if the next page fails to load
  let left = false;
  const leaveOnce = () => {
    if (left) return;
    left = true;
    leave();
  };
  Promise.all(animations.map((a) => a.finished)).then(leaveOnce);
  setTimeout(leaveOnce, EXPAND_MS + 100);
  const safety = setTimeout(() => {
    ghost.remove();
    ghostTimers.delete(safety);
  }, 10000);
  ghostTimers.add(safety);
}

// ── Opening a project from the home page ─────────────────────────────────
// The home page closes its windows first, then the chosen project page opens
// its single window the same way. This is separate from View's expand-and-go
// transition above, where the selected window grows straight into the
// project page.

let openingProject: { slug: string; at: number; readAt?: number } | null =
  null;

// The project that should open its window on arrival. Still readable for a
// moment after the first read, because React in dev mounts the page's effects
// twice; after that a later visit won't replay it.
export function arrivedAtProject(slug: string) {
  const p = openingProject;
  if (!p || p.slug !== slug) return false;
  const now = performance.now();
  if (now - p.at > 10000) return false;
  p.readAt ??= now;
  if (now - p.readAt > 500) {
    openingProject = null;
    return false;
  }
  return true;
}

export function markProjectOpening(slug: string) {
  openingProject = { slug, at: performance.now() };
}

// ── Closing a project ────────────────────────────────────────────────────
// The reverse: the project page's contents fade out, /projects loads with
// that window still expanded, it shrinks back into its grid slot, and then
// the other windows open their curtains.

let collapse: { slug: string; at: number; readAt?: number } | null = null;

// The project whose window should shrink back into the grid on arrival.
// Still readable for a moment after the first read, because React in dev
// mounts the page's effects twice; after that a later visit won't replay it.
export function collapsingProject() {
  const c = collapse;
  const now = performance.now();
  if (!c || now - c.at > 10000) return null;
  c.readAt ??= now;
  if (now - c.readAt > 500) {
    collapse = null;
    return null;
  }
  return c.slug;
}

export function closeProject(
  slug: string,
  content: HTMLElement | null,
  go: () => void,
) {
  const leave = () => {
    collapse = { slug, at: performance.now() };
    go();
  };
  if (!content || prefersReducedMotion()) {
    leave();
    return;
  }
  const fade = content.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: EXPAND_MS / 2,
    fill: "forwards",
  });
  let left = false;
  const leaveOnce = () => {
    if (left) return;
    left = true;
    leave();
  };
  fade.finished.then(leaveOnce);
  setTimeout(leaveOnce, EXPAND_MS / 2 + 100);
}

// Shrink `selected` from the expanded project window back into its grid
// slot, then open the other windows' curtains. Returns a cleanup.
export function collapseThenOpen(selected: HTMLElement, others: HTMLElement[]) {
  const from = projectWindowRect();
  if (!from) {
    const anims = others.map((w, i) => openCurtain(w, i));
    return () => anims.forEach((a) => a.cancel());
  }
  const to = selected.getBoundingClientRect();
  const ghost = selected.cloneNode(true) as HTMLElement;
  ghost.dataset.expandGhost = "";
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  Object.assign(ghost.style, {
    position: "fixed",
    margin: "0",
    zIndex: "60",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
  });
  document.body.appendChild(ghost);
  selected.style.visibility = "hidden";

  const body = ghost.children[1] as HTMLElement | undefined;
  const anims: Animation[] = [];
  if (body) {
    anims.push(
      body.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: EXPAND_MS / 2,
        delay: EXPAND_MS / 2,
        fill: "both",
      }),
    );
  }
  const shrink = ghost.animate(
    [
      {
        left: `${from.left}px`,
        top: `${from.top}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
      },
      {
        left: `${to.left}px`,
        top: `${to.top}px`,
        width: `${to.width}px`,
        height: `${to.height}px`,
      },
    ],
    { duration: EXPAND_MS, easing: EXPAND_EASE, fill: "forwards" },
  );
  anims.push(shrink);
  // The others wait their turn, shut, until the window is home
  others.forEach((w, i) => anims.push(openCurtain(w, i, EXPAND_MS)));

  const land = () => {
    selected.style.visibility = "";
    ghost.remove();
  };
  shrink.finished.then(land, () => {});
  // Stalled-animation guard, as elsewhere
  const timer = setTimeout(land, EXPAND_MS + 100);

  return () => {
    clearTimeout(timer);
    anims.forEach((a) => a.cancel());
    land();
  };
}
