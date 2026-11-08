// Windows opening the way you'd draw one on a desktop: a mouse cursor fades
// in at the window's top-left corner and drags an outline out to the
// bottom-right, then the cursor fades away and the window's contents appear.
// Used by the boot intro, the boards (as they scroll into view) and pop-ups.

// One window's whole sequence: cursor fades in, the drag, then the fade out
const FADE_MS = 110;
const DRAG_MS = 420;
export const OPEN_MS = FADE_MS + DRAG_MS + FADE_MS;
// Wait between one window starting to open and the next
export const OPEN_STAGGER_MS = 120;

const DRAG_EASE = "cubic-bezier(0.45, 0, 0.25, 1)";
const OUTLINE = "var(--lx-fg)";

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The cursor and the outline are temporary overlays above the page, placed
// over the window's slot. They're removed once the sequence ends or the
// window's animation is cancelled.
function dragOverlay(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  // A hidden window (the skill dialog while closed) has nothing to draw
  if (r.width === 0 || r.height === 0) return null;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.setAttribute("data-drag", "");
  layer.style.cssText = `position:fixed;inset:auto;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;padding:0;border:0;overflow:visible;background:transparent;pointer-events:none;z-index:65;`;
  const outline = document.createElement("div");
  outline.style.cssText = `position:absolute;left:0;top:0;box-sizing:border-box;border:1px solid ${OUTLINE};background:color-mix(in srgb, var(--lx-fg) 5%, transparent);`;
  const cursor = document.createElement("div");
  // A classic arrow: its tip is the element's top-left corner
  cursor.style.cssText = "position:absolute;left:0;top:0;width:14px;height:20px;";
  cursor.innerHTML =
    '<svg width="14" height="20" viewBox="0 0 14 20" style="display:block;overflow:visible"><path d="M0 0v16l4-4 3 7 2.5-1-3-7H13z" fill="#fff" stroke="#000" stroke-width="1" stroke-linejoin="round"/></svg>';
  layer.append(outline, cursor);
  document.body.append(layer);
  // The top layer beats every z-index, the footer's included, so only use it
  // (as a popover) when a pop-up <dialog> is open, to show above it and its
  // backdrop; otherwise the overlay sits just under the footer (z 70)
  if (document.querySelector("dialog[open]")) {
    try {
      layer.popover = "manual";
      layer.showPopover();
    } catch {
      // Without the Popover API the overlay just sits in the normal layer
    }
  }
  // The window can move while this plays (a board still being scrolled), so
  // the overlay stays glued to the window's slot until it's removed
  const follow = () => {
    if (!layer.isConnected) return;
    const now = el.getBoundingClientRect();
    layer.style.left = `${now.left}px`;
    layer.style.top = `${now.top}px`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
  return { layer, outline, cursor, w: r.width, h: r.height, x: r.left, y: r.top };
}

// Plays the overlay in step with the window's own animation `main`, and
// cleans it up when that ends or is cancelled
function followWith(
  main: Animation,
  layer: HTMLElement,
  extra: Animation[],
  total: number,
  delay: number,
) {
  const remove = () => {
    layer.remove();
    extra.forEach((a) => a.cancel());
  };
  main.addEventListener("finish", remove);
  main.addEventListener("cancel", remove);
  // Animations stall when the browser stops drawing frames (e.g. a hidden
  // tab), so don't leave the overlay behind
  setTimeout(remove, delay + total + 600);
}

export function openCurtain(
  el: HTMLElement,
  index = 0,
  // Extra wait before the staggered opening begins
  after = 0,
) {
  const delay = after + index * OPEN_STAGGER_MS;
  const overlay = dragOverlay(el);
  const main = el.animate(
    [{ opacity: 0 }, { opacity: 0, offset: (FADE_MS + DRAG_MS) / OPEN_MS }, { opacity: 1 }],
    { duration: OPEN_MS, delay, fill: "backwards" },
  );
  if (!overlay) return main;
  const { layer, outline, cursor, w, h } = overlay;
  const t0 = FADE_MS / OPEN_MS;
  const t1 = (FADE_MS + DRAG_MS) / OPEN_MS;
  const timing = { duration: OPEN_MS, delay, fill: "both" as const };

  // The outline and cursor sit at the corner, drag out, then fade away
  const outlineAnim = outline.animate(
    [
      { width: "0px", height: "0px", opacity: 0 },
      { width: "0px", height: "0px", opacity: 1, offset: t0, easing: DRAG_EASE },
      { width: `${w}px`, height: `${h}px`, opacity: 1, offset: t1 },
      { width: `${w}px`, height: `${h}px`, opacity: 0 },
    ],
    timing,
  );
  const cursorAnim = cursor.animate(
    [
      { transform: "translate(0px,0px)", opacity: 0 },
      { transform: "translate(0px,0px)", opacity: 1, offset: t0, easing: DRAG_EASE },
      { transform: `translate(${w}px,${h}px)`, opacity: 1, offset: t1 },
      { transform: `translate(${w}px,${h}px)`, opacity: 0 },
    ],
    timing,
  );
  followWith(main, layer, [outlineAnim, cursorAnim], OPEN_MS, delay);
  return main;
}

// The boot sequence's version of opening: the cursor starts at `from` (a
// viewport point, where the intro left it), waits a beat, travels to the
// window's top-left corner, then drags the outline out as usual. The caller
// clears the window's hidden state first; this fades it in once dragged.
const BOOT_HOLD_MS = 150;
const BOOT_TRAVEL_MS = 520;
export function bootDrag(
  el: HTMLElement,
  from: { x: number; y: number },
  delay = 0,
) {
  const r = el.getBoundingClientRect();
  // A window below the fold (the stacked layout) has nowhere to be dragged
  const overlay = r.top < window.innerHeight - 8 ? dragOverlay(el) : null;
  const total = BOOT_HOLD_MS + BOOT_TRAVEL_MS + DRAG_MS + FADE_MS;
  const tA = BOOT_HOLD_MS / total;
  const tB = (BOOT_HOLD_MS + BOOT_TRAVEL_MS) / total;
  const tC = (BOOT_HOLD_MS + BOOT_TRAVEL_MS + DRAG_MS) / total;
  const main = el.animate(
    [{ opacity: 0 }, { opacity: 0, offset: tC }, { opacity: 1 }],
    { duration: total, delay, fill: "backwards" },
  );
  if (!overlay) return main;
  const { layer, outline, cursor, w, h, x, y } = overlay;
  const sx = from.x - x;
  const sy = from.y - y;
  const timing = { duration: total, delay, fill: "both" as const };
  const outlineAnim = outline.animate(
    [
      { width: "0px", height: "0px", opacity: 0 },
      { width: "0px", height: "0px", opacity: 1, offset: tB, easing: DRAG_EASE },
      { width: `${w}px`, height: `${h}px`, opacity: 1, offset: tC },
      { width: `${w}px`, height: `${h}px`, opacity: 0 },
    ],
    timing,
  );
  const cursorAnim = cursor.animate(
    [
      { transform: `translate(${sx}px,${sy}px)`, opacity: 1 },
      { transform: `translate(${sx}px,${sy}px)`, opacity: 1, offset: tA, easing: DRAG_EASE },
      { transform: "translate(0px,0px)", opacity: 1, offset: tB, easing: DRAG_EASE },
      { transform: `translate(${w}px,${h}px)`, opacity: 1, offset: tC },
      { transform: `translate(${w}px,${h}px)`, opacity: 0 },
    ],
    timing,
  );
  followWith(main, layer, [outlineAnim, cursorAnim], total, delay);
  return main;
}

