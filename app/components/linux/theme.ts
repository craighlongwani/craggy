"use client";
import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
export type Palette = "gruv" | "mono";

// Mode and palette live on <html> (data-theme, data-palette); the inline
// script in layout.tsx sets them from localStorage before first paint.
function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function readPalette(): Palette {
  return document.documentElement.dataset.palette === "mono" ? "mono" : "gruv";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-palette"],
  });
  return () => observer.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "dark");
}

export function usePalette(): Palette {
  return useSyncExternalStore(subscribe, readPalette, () => "gruv");
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode etc.: the choice just won't persist
  }
}

function setTheme(theme: Theme) {
  if (theme === "light") document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
  remember("theme", theme);
}

function setPalette(palette: Palette) {
  if (palette === "mono") document.documentElement.dataset.palette = "mono";
  else delete document.documentElement.dataset.palette;
  remember("palette", palette);
}

// Keep in step with nothing else: the whole sweep is driven from here
const SWEEP_MS = 800;
const EASING = "cubic-bezier(0.45, 0, 0.25, 1)";
let switching = false;

// Hover is frozen while the sweep plays: the swept area is a copy of the
// page that the pointer isn't over, so a window or card hovered mid-sweep
// would light up (and a card start its video, a decoder start-up that
// dropped frames) on the page but not in the copy. Whatever is hovered when
// the sweep starts is marked data-hover, on the page and so in the copy,
// and keeps that look (globals.css); cards ignore the pointer until the
// sweep ends, then catch up (SWEEP_END, see ProjectsBoard).
export const SWEEP_END = "lx-sweep-end";

export function isSweeping() {
  return switching;
}

// Runs `fn` now, or, mid-sweep, once the sweep ends. Opening or closing a
// project mid-sweep would animate the real window while the copy still
// shows the old state, so it waits. Only the latest request is kept (open
// then Escape mid-sweep: nothing happens).
let pending: (() => void) | null = null;
export function whenSwept(fn: () => void) {
  if (!switching) {
    fn();
    return;
  }
  if (!pending) {
    window.addEventListener(
      SWEEP_END,
      () => {
        const run = pending;
        pending = null;
        run?.();
      },
      { once: true },
    );
  }
  pending = fn;
}

// A canvas standing in for a video in the sweep's copy: the video's current
// frame at its own resolution, sized and styled like the video (so the copy
// lays out the same). Full resolution on purpose: a canvas the size the
// preview shows at (about 360x200) is small enough that Chrome keeps it on
// the CPU, and copying a video frame into it from the GPU took ~3.5ms,
// against ~0.75ms at full size.
function videoStill(video: HTMLVideoElement | undefined, clone: HTMLVideoElement) {
  const still = document.createElement("canvas");
  still.className = clone.className;
  const style = clone.getAttribute("style");
  if (style) still.setAttribute("style", style);
  if (!video) return still;
  still.width = video.videoWidth || video.clientWidth || 1;
  still.height = video.videoHeight || video.clientHeight || 1;
  if (video.readyState >= 2) {
    try {
      still.getContext("2d")?.drawImage(video, 0, 0, still.width, still.height);
    } catch {
      // Not drawable: an empty box the video's size
    }
  }
  return still;
}

// Switches the mode and/or palette with a cursor drag: an oversized cursor (twice the size of
// the window-open one) is dragged from the top left of the page to the bottom
// right, and the new theme is revealed behind it, in the rectangle it has
// swept so far.
//
// The reveal is a live copy of the page, already in the new theme, clipped to
// the swept rectangle. It isn't a browser snapshot (View Transitions), which
// could differ from the live page by a pixel and show as a one-frame jump
// when swapped back. When the sweep ends the real page changes underneath the
// copy, which looks identical, and the copy is removed in the same task.
export function switchTo(next: { theme?: Theme; palette?: Palette }) {
  // A second click mid-drag would stack a second copy
  if (switching) return;
  const theme = next.theme ?? readTheme();
  const palette = next.palette ?? readPalette();
  const apply = () => {
    setTheme(theme);
    setPalette(palette);
  };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  switching = true;
  const root = document.documentElement;
  // Before the copy is made, so it has the same marks
  const hovered = Array.from(
    document.querySelectorAll(".lx-card:hover, .win95-window:hover"),
  );
  hovered.forEach((card) => card.setAttribute("data-hover", ""));
  // Videos hold still while the sweep passes, on the page as in the copy
  // (which shows each as a still of its current frame), and carry on from
  // the same frame when it ends. Keeping them moving in the copy meant
  // copying every frame of a 1920x1080 video into it, for motion nobody
  // watches while a cursor sweeps the screen.
  const held = Array.from(document.querySelectorAll("video")).filter((v) => !v.paused);
  held.forEach((v) => v.pause());
  const page = Array.from(document.body.children).filter(
    (el) => el.tagName !== "SCRIPT",
  );

  const overlay = document.createElement("div");
  overlay.setAttribute("data-skin", "linux");
  overlay.dataset.pv = `${palette}-${theme}`;
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("inert", "");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:190;overflow:hidden;pointer-events:none;clip-path:inset(0 100% 100% 0);";
  const copies = page.map((el) => el.cloneNode(true) as Element);
  // A cloned <video> is a new player: it shows nothing until it has loaded
  // the file again (a blank flash in the swept area, and a burst of
  // downloads). The copy gets a still of each video's current frame instead,
  // one for one, so the copy's elements still line up with the page's.
  page.forEach((el, i) => {
    const originals = el.querySelectorAll("video");
    copies[i].querySelectorAll("video").forEach((v, n) => {
      v.removeAttribute("src");
      v.load();
      v.replaceWith(videoStill(originals[n], v));
    });
  });
  // Text that redraws itself (the ASCII cat, marked data-live)
  const livePairs: [Element, Element][] = [];
  page.forEach((el, i) => {
    const to = copies[i].querySelectorAll("[data-live]");
    el.querySelectorAll("[data-live]").forEach((from, n) => {
      if (to[n]) livePairs.push([from, to[n]]);
    });
  });
  overlay.append(...copies);
  // The copy's toggles already show the labels they'll have afterwards
  overlay
    .querySelectorAll("[data-theme-toggle]")
    .forEach((el) => (el.textContent = theme === "dark" ? "light" : "dark"));
  overlay
    .querySelectorAll("[data-palette-toggle]")
    .forEach((el) => (el.textContent = palette));

  // Scroll positions aren't cloned: copy them across, and keep them in step
  // while the sweep plays (the real page can still be scrolled), so both
  // palettes always show the same part of the page. The page is measured
  // before the copy goes in, while its layout is still clean.
  const twins = new Map<Element, Element>();
  const scrolled: [Element, Element][] = [];
  page.forEach((el, i) => {
    const from = el.querySelectorAll("*");
    const to = copies[i].querySelectorAll("*");
    from.forEach((node, n) => {
      if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
        twins.set(node, to[n]);
      }
      if (node.scrollTop || node.scrollLeft) scrolled.push([node, to[n]]);
    });
  });
  // Styling and laying out a whole copy of the page took 40-130ms in one go,
  // the hitch at the start of every sweep. Its boards are left for the
  // browser to render as they come into view (content-visibility), so only
  // the one on screen is done up front; each keeps its exact size, so the
  // copy scrolls exactly like the page.
  page.forEach((el, i) => {
    const to = copies[i].querySelectorAll<HTMLElement>("[data-board]");
    el.querySelectorAll("[data-board]").forEach((board, n) => {
      if (!to[n]) return;
      const { width, height } = board.getBoundingClientRect();
      to[n].style.contentVisibility = "auto";
      to[n].style.containIntrinsicSize = `${width}px ${height}px`;
    });
  });
  document.body.append(overlay);
  for (const [from, to] of scrolled) {
    to.scrollTop = from.scrollTop;
    to.scrollLeft = from.scrollLeft;
  }
  const mirror = (e: Event) => {
    const twin = twins.get(e.target as Element);
    const from = e.target as Element;
    if (twin) {
      twin.scrollTo({ top: from.scrollTop, left: from.scrollLeft, behavior: "instant" });
    }
  };
  // scroll events don't bubble, so listen in the capture phase
  document.addEventListener("scroll", mirror, true);

  // A board scrolled into view during the sweep opens its windows for real
  // (a fade timed by the cursor drag) while the copy still has them shut, so
  // the copy follows their opacity, and the drag's cursor and outline are
  // lifted above the copy (see html.theme-sweeping in globals.css)
  root.classList.add("theme-sweeping");
  const windowPairs: [Element, HTMLElement][] = [];
  page.forEach((el, i) => {
    const from = el.querySelectorAll(".win95-window");
    const to = copies[i].querySelectorAll<HTMLElement>(".win95-window");
    from.forEach((w, n) => windowPairs.push([w, to[n]]));
  });
  const windowSet = new Set<Element>(windowPairs.map(([w]) => w));
  const copyOf = new Map(windowPairs);

  // The rest of what moves keeps moving in the copy too, so nothing freezes
  // in the swept area and jumps when the sweep ends: windows opening (their
  // opacity) and live text (the cat) are copied across every frame
  let follow = 0;
  const syncWindows = () => {
    // Opacity: a window that's animating (opening) needs its computed
    // opacity, which costs a style lookup; the rest are shut (inline
    // opacity 0) or open (none), which the inline style alone says
    const animating = new Set<Element>();
    for (const a of document.getAnimations()) {
      const target = (a.effect as KeyframeEffect | null)?.target;
      if (target && windowSet.has(target)) animating.add(target);
    }
    for (const [w, c] of windowPairs) {
      c.style.opacity = (w as HTMLElement).style.opacity;
    }
    for (const w of animating) {
      copyOf.get(w)!.style.opacity = getComputedStyle(w).opacity;
    }
    for (const [from, to] of livePairs) {
      if (to.textContent !== from.textContent) to.textContent = from.textContent;
    }
    follow = requestAnimationFrame(syncWindows);
  };
  syncWindows();

  const cursor = document.createElement("div");
  cursor.setAttribute("aria-hidden", "true");
  cursor.style.cssText =
    "position:fixed;left:0;top:0;width:28px;height:40px;z-index:200;pointer-events:none;";
  cursor.innerHTML =
    '<svg width="28" height="40" viewBox="0 0 14 20" style="display:block;overflow:visible"><path d="M0 0v16l4-4 3 7 2.5-1-3-7H13z" fill="#fff" stroke="#000" stroke-width="0.8" stroke-linejoin="round"/></svg>';
  document.body.append(cursor);

  const timing = { duration: SWEEP_MS, easing: EASING, fill: "both" } as const;
  const reveal = overlay.animate(
    [{ clipPath: "inset(0 100% 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
    timing,
  );
  cursor.animate(
    [
      { transform: "translate(0, 0)", opacity: 1 },
      { opacity: 1, offset: 0.85 },
      { transform: "translate(100vw, 100vh)", opacity: 0 },
    ],
    timing,
  );

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    document.removeEventListener("scroll", mirror, true);
    cancelAnimationFrame(follow);
    root.classList.remove("theme-sweeping");
    // Change the real page with its transitions off, and apply it before the
    // copy goes, so no frame shows the old page
    root.classList.add("theme-switching");
    apply();
    void getComputedStyle(document.body).color;
    overlay.remove();
    cursor.remove();
    hovered.forEach((card) => card.removeAttribute("data-hover"));
    root.classList.remove("theme-switching");
    switching = false;
    // Held videos carry on (a card left mid-sweep is paused again by its
    // catch-up, on SWEEP_END)
    held.forEach((v) => void v.play().catch(() => {}));
    window.dispatchEvent(new Event(SWEEP_END));
  };
  reveal.finished.then(finish, finish);
  // A hidden tab may never advance the animation
  setTimeout(finish, SWEEP_MS + 500);
}
