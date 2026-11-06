// Minimize/restore animations: a page's windows shrink into its taskbar icon
// when you leave it, and grow back out of that icon when you arrive, like
// Win95 windows going to and from the taskbar.

export type TaskbarIcon = "home" | "projects";

export const MINIMIZE_MS = 250;
export const RESTORE_MS = 250;
export const RESTORE_STAGGER_MS = 50;

// Center of the taskbar icon, or the bottom middle of the screen if the
// taskbar isn't rendered
function anchorPoint(icon: TaskbarIcon) {
  const target = document.querySelector(`[data-taskbar-icon="${icon}"]`);
  if (!target) return { x: window.innerWidth / 2, y: window.innerHeight };
  const rect = target.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// transform-origin that puts the anchor point under the element, so scaling
// it to 0 collapses it onto the anchor
export function originAtAnchor(el: HTMLElement, icon: TaskbarIcon) {
  const rect = el.getBoundingClientRect();
  const { x, y } = anchorPoint(icon);
  return `${x - rect.left}px ${y - rect.top}px`;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function minimizeToAnchor(el: HTMLElement, icon: TaskbarIcon) {
  el.style.transformOrigin = originAtAnchor(el, icon);
  return el.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(0)", opacity: 0 },
    ],
    { duration: MINIMIZE_MS, easing: "ease-in", fill: "forwards" }
  );
}

export function restoreFromAnchor(
  el: HTMLElement,
  index: number,
  icon: TaskbarIcon,
  // Extra wait before the staggered restore begins
  after = 0
) {
  el.style.transformOrigin = originAtAnchor(el, icon);
  return el.animate(
    [
      { transform: "scale(0)", opacity: 0 },
      { transform: "scale(1)", opacity: 1 },
    ],
    {
      duration: RESTORE_MS,
      delay: after + index * RESTORE_STAGGER_MS,
      easing: "ease-out",
      fill: "backwards",
    }
  );
}

// Set when a page minimizes its windows on the way out, so the next page
// restores its windows instead of playing the usual page fade. It's a
// timestamp rather than a one-shot flag so React's dev double-render and
// the template can both read it safely.
let minimizedAt = -Infinity;

export function arrivedFromMinimize() {
  return performance.now() - minimizedAt < 1500;
}

// ── Opening a project ────────────────────────────────────────────────────
// On /projects, View minimizes every other window into the taskbar while the
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

  // Everything else goes to the taskbar
  const others = Array.from(
    document.querySelectorAll<HTMLElement>("main .win95-window"),
  ).filter((w) => w !== selected);
  const animations = others.map((w) => minimizeToAnchor(w, "projects"));

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

  // Same stalled-animation guard as minimizeAndGo; and never leave the ghost
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

// ── Opening a project from the Start menu ────────────────────────────────
// The Start menu minimizes the current page's windows into its taskbar icon
// first, then the chosen project page grows its single window back out of the
// projects icon. This is separate from View's expand-and-go transition above,
// where the selected window grows straight into the project page.

let startMenuProject: { slug: string; at: number; readAt?: number } | null =
  null;

// The project that should restore its window on arrival. Still readable for a
// moment after the first read, because React in dev mounts the page's effects
// twice; after that a later visit won't replay it.
export function arrivedFromStartMenu(slug: string) {
  const p = startMenuProject;
  if (!p || p.slug !== slug) return false;
  const now = performance.now();
  if (now - p.at > 10000) return false;
  p.readAt ??= now;
  if (now - p.readAt > 500) {
    startMenuProject = null;
    return false;
  }
  return true;
}

export function markProjectOpening(slug: string) {
  startMenuProject = { slug, at: performance.now() };
}

// ── Closing a project ────────────────────────────────────────────────────
// The reverse: the project page's contents fade out, /projects loads with
// that window still expanded, it shrinks back into its grid slot, and then
// the other windows come back out of the taskbar.

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
// slot, then restore the other windows from the taskbar. Returns a cleanup.
export function collapseThenRestore(
  selected: HTMLElement,
  others: HTMLElement[],
  icon: TaskbarIcon,
) {
  const from = projectWindowRect();
  if (!from) {
    const anims = others.map((w, i) => restoreFromAnchor(w, i, icon));
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
  // The others wait their turn, hidden, until the window is home
  others.forEach((w, i) =>
    anims.push(restoreFromAnchor(w, i, icon, EXPAND_MS)),
  );

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

// Minimize every window on the page into `icon`, then run `go` (usually a
// router.push to the next page)
export function minimizeAndGo(icon: TaskbarIcon, go: () => void) {
  const windows = document.querySelectorAll<HTMLElement>("main .win95-window");
  const leave = () => {
    minimizedAt = performance.now();
    go();
  };
  if (windows.length === 0 || prefersReducedMotion()) {
    leave();
    return;
  }
  const animations = Array.from(windows, (w) => minimizeToAnchor(w, icon));
  // Animations stall when the browser stops drawing frames (e.g. a hidden
  // tab), so a timer guarantees we still navigate
  let left = false;
  const leaveOnce = () => {
    if (left) return;
    left = true;
    leave();
  };
  Promise.all(animations.map((a) => a.finished)).then(leaveOnce);
  setTimeout(leaveOnce, MINIMIZE_MS + 100);
}
