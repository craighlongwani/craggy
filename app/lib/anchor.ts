// Minimize/restore animations: windows shrink into, and grow out of, the
// bottom middle of the viewport, like a Win95 window going to the taskbar.

export const MINIMIZE_MS = 250;
export const RESTORE_MS = 250;
export const RESTORE_STAGGER_MS = 50;

// transform-origin that puts the anchor point under the element, so scaling
// it to 0 collapses it onto the anchor
export function originAtAnchor(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const x = window.innerWidth / 2 - rect.left;
  const y = window.innerHeight - rect.top;
  return `${x}px ${y}px`;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function minimizeToAnchor(el: HTMLElement) {
  el.style.transformOrigin = originAtAnchor(el);
  return el.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(0)", opacity: 0 },
    ],
    { duration: MINIMIZE_MS, easing: "ease-in", fill: "forwards" }
  );
}

export function restoreFromAnchor(el: HTMLElement, index: number) {
  el.style.transformOrigin = originAtAnchor(el);
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
