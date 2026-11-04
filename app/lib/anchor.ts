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
  icon: TaskbarIcon
) {
  el.style.transformOrigin = originAtAnchor(el, icon);
  return el.animate(
    [
      { transform: "scale(0)", opacity: 0 },
      { transform: "scale(1)", opacity: 1 },
    ],
    {
      duration: RESTORE_MS,
      delay: index * RESTORE_STAGGER_MS,
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
