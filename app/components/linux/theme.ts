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

export function setTheme(theme: Theme) {
  if (theme === "light") document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
  remember("theme", theme);
}

export function setPalette(palette: Palette) {
  if (palette === "mono") document.documentElement.dataset.palette = "mono";
  else delete document.documentElement.dataset.palette;
  remember("palette", palette);
}

// Keep in step with nothing else: the whole sweep is driven from here
const SWEEP_MS = 800;
const EASING = "cubic-bezier(0.45, 0, 0.25, 1)";
let switching = false;

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
  overlay.append(...copies);
  // The copy's toggles already show the labels they'll have afterwards
  overlay
    .querySelectorAll("[data-theme-toggle]")
    .forEach((el) => (el.textContent = theme === "dark" ? "light" : "dark"));
  overlay
    .querySelectorAll("[data-palette-toggle]")
    .forEach((el) => (el.textContent = palette));
  document.body.append(overlay);

  // Scroll positions aren't cloned: copy them across
  page.forEach((el, i) => {
    const from = el.querySelectorAll("*");
    const to = copies[i].querySelectorAll("*");
    from.forEach((node, n) => {
      if (node.scrollTop || node.scrollLeft) {
        to[n].scrollTop = node.scrollTop;
        to[n].scrollLeft = node.scrollLeft;
      }
    });
  });

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
    // Change the real page with its transitions off, and apply it before the
    // copy goes, so no frame shows the old page
    root.classList.add("theme-switching");
    apply();
    void getComputedStyle(document.body).color;
    overlay.remove();
    cursor.remove();
    root.classList.remove("theme-switching");
    switching = false;
  };
  reveal.finished.then(finish, finish);
  // A hidden tab may never advance the animation
  setTimeout(finish, SWEEP_MS + 500);
}
