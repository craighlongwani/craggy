"use client";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "../lib/curtain";
import {
  closeProject,
  takeOrigin,
  useLastProject,
  useOpenProject,
} from "../lib/project";

const EXPAND_MS = 320;
const EXPAND_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

type Rect = { left: number; top: number; width: number; height: number };

// Keyframe for the window while its position and size are animated: explicit
// numbers, with the CSS centering (auto margins, right/bottom) switched off
const frame = (r: Rect) => ({
  left: `${r.left}px`,
  top: `${r.top}px`,
  width: `${r.width}px`,
  height: `${r.height}px`,
  margin: "0px",
  right: "auto",
  bottom: "auto",
});

// A rect worth animating from/to: the element is laid out and on screen
function onScreen(el: Element | null | undefined): DOMRect | null {
  if (!el?.isConnected) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  if (r.bottom <= 0 || r.top >= window.innerHeight) return null;
  return r;
}

const cardFor = (slug: string) =>
  document.querySelector<HTMLElement>(`[data-project="${slug}"]`);

// A copy of what the window grows out of / shrinks into (a card's body, or
// the clicked row), placed inside the window at the same offset from its
// top-left corner as the original, so it rides along as the window moves.
// It's what the window shows while it's still card-sized.
function contentsCopy(el: HTMLElement, elRect: DOMRect, win: HTMLElement) {
  const src =
    el.classList.contains("win95-window") && el.children[1] instanceof HTMLElement
      ? el.children[1]
      : el;
  const r = src.getBoundingClientRect();
  const copy = src.cloneNode(true) as HTMLElement;
  copy.removeAttribute("id");
  copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  copy.setAttribute("aria-hidden", "true");
  copy.dataset.contentsCopy = "";
  copy.inert = true;
  Object.assign(copy.style, {
    position: "absolute",
    // (positioned from inside the window's border)
    left: `${r.left - elRect.left - win.clientLeft}px`,
    top: `${r.top - elRect.top - win.clientTop}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    margin: "0",
    boxSizing: "border-box",
    overflow: "hidden",
    pointerEvents: "none",
  });
  win.appendChild(copy);
  return copy;
}

// While the window changes size, its write-up keeps the width it has at full
// size (so the text doesn't reflow every frame) and the window clips it
function freezeWidth(win: HTMLElement, body: HTMLElement, width: number) {
  win.style.overflow = "hidden";
  Object.assign(body.style, { width: `${width}px`, flex: "none" });
}

// The open project's window. There's only ever one window on screen for a
// project: its card on the projects board is hidden while this one grows out
// of the card's exact spot to the middle of the screen, dimming the page
// behind, and shrinks back into the same spot on close. Every project's
// write-up is rendered here up front (so opening is instant and the text is
// part of the page); only the open one shows.
export default function ProjectView({
  projects,
}: {
  projects: { slug: string; title: string; content: ReactNode }[];
}) {
  const want = useOpenProject();
  // The write-up on show: the open project, or the one closing
  const shown = useLastProject();
  const rootRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLElement | null>(null);
  const hiddenCard = useRef<HTMLElement | null>(null);
  const anims = useRef<Animation[]>([]);
  const finishClose = useRef<(() => void) | null>(null);

  // Opens, swaps or closes the window whenever the open project changes.
  // The window is shown and hidden directly (not through React state), so
  // the card and the window trade places within a single frame.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const dim = dimRef.current;
    const win = windowRef.current;
    const body = bodyRef.current;
    if (!root || !dim || !win || !body) return;

    // Ends any running open/close animation and what it added (the contents
    // copy, the frozen width)
    const stopAnims = () => {
      anims.current.forEach((a) => a.cancel());
      anims.current = [];
      win.querySelectorAll("[data-contents-copy]").forEach((c) => c.remove());
      win.removeAttribute("style");
      body.removeAttribute("style");
    };
    const showCard = () => {
      if (hiddenCard.current) hiddenCard.current.style.visibility = "";
      hiddenCard.current = null;
    };
    const video = () =>
      body.querySelector<HTMLVideoElement>(":scope > :not([hidden]) video");

    // ── Open ──
    if (want) {
      finishClose.current?.();
      stopAnims();
      showCard();
      win.removeAttribute("style");
      root.hidden = false;
      const card = cardFor(want);
      const origin = takeOrigin() ?? card;
      originRef.current = origin;
      // The card and this window are the same window: one shows at a time
      if (card) {
        card.style.visibility = "hidden";
        hiddenCard.current = card;
      }
      body.scrollTop = 0;
      void video()?.play().catch(() => {});
      if (prefersReducedMotion()) return;

      const from = origin ? onScreen(origin) : null;
      const to = win.getBoundingClientRect();
      const dimIn = dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: EXPAND_MS });
      if (!origin || !from) {
        anims.current = [
          dimIn,
          win.animate(
            [{ opacity: 0, transform: "scale(0.97)" }, { opacity: 1, transform: "none" }],
            { duration: EXPAND_MS, easing: EXPAND_EASE },
          ),
        ];
        return;
      }
      // Growing out of the card: it starts out showing the card's contents,
      // which fade as the write-up fades in, laid out at full width
      freezeWidth(win, body, body.getBoundingClientRect().width);
      const copy = contentsCopy(origin, from, win);
      const grow = win.animate([frame(from), frame(to)], {
        duration: EXPAND_MS,
        easing: EXPAND_EASE,
      });
      anims.current = [
        dimIn,
        grow,
        copy.animate([{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], {
          duration: EXPAND_MS,
          fill: "forwards",
        }),
        body.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], {
          duration: EXPAND_MS,
        }),
      ];
      // At full size: back to the window's normal layout
      grow.finished.then(() => {
        copy.remove();
        win.removeAttribute("style");
        body.removeAttribute("style");
      }, () => {});
      return;
    }

    // ── Close ── (nothing to do if it isn't open)
    if (root.hidden || finishClose.current) return;
    let done = false;
    let raf = 0;
    // Everything in one go, before the next paint: the card shows again in
    // the same frame the window disappears, so nothing flashes
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      finishClose.current = null;
      video()?.pause();
      root.hidden = true;
      showCard();
      stopAnims();
      win.removeAttribute("style");
    };
    finishClose.current = finish;
    const timer = setTimeout(finish, EXPAND_MS + 150);
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    stopAnims();
    const fill = { fill: "forwards" as const };
    anims.current = [
      dim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: EXPAND_MS, easing: "ease-in", ...fill }),
      body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: EXPAND_MS / 2, ...fill }),
    ];
    const target = () => onScreen(hiddenCard.current) ?? onScreen(originRef.current);
    if (!target()) {
      const fade = win.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(0.97)" }], {
        duration: EXPAND_MS / 2,
        ...fill,
      });
      anims.current.push(fade);
      fade.finished.then(finish, () => {});
      return;
    }
    // Shrink back, aimed at the card's live position every frame. The card's
    // contents fade back in as the write-up fades out, so the window lands
    // already looking like the card.
    const from = win.getBoundingClientRect();
    const into = onScreen(hiddenCard.current) ? hiddenCard.current : originRef.current;
    const intoRect = onScreen(into);
    freezeWidth(win, body, body.getBoundingClientRect().width);
    if (into && intoRect) {
      const copy = contentsCopy(into, intoRect, win);
      anims.current.push(
        copy.animate([{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }], {
          duration: EXPAND_MS,
          fill: "forwards",
        }),
      );
    }
    const t0 = performance.now();
    const step = (now: number) => {
      if (done) return;
      const p = Math.min(1, (now - t0) / EXPAND_MS);
      const k = 1 - Math.pow(1 - p, 4);
      const to = target() ?? from;
      Object.assign(
        win.style,
        frame({
          left: from.left + (to.left - from.left) * k,
          top: from.top + (to.top - from.top) * k,
          width: from.width + (to.width - from.width) * k,
          height: from.height + (to.height - from.height) * k,
        }),
      );
      if (p < 1) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);
  }, [want]);

  // Escape closes, like the × and a click on the dim
  useEffect(() => {
    if (!want) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [want]);

  const title = projects.find((p) => p.slug === shown)?.title ?? "";

  return (
    // Starts hidden; shown and hidden directly by the effect above
    <div ref={rootRef} data-project-view hidden className="fixed inset-0 z-[60]">
      <div ref={dimRef} onClick={() => closeProject()} className="absolute inset-0 bg-black/60" />
      {/* Centered, full height above the footer */}
      <section
        ref={windowRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="win95-window lx-active absolute inset-x-3 top-3 bottom-[3.25rem] mx-auto flex min-h-0 w-auto max-w-full flex-col md:inset-x-4 md:bottom-14 md:top-4 md:w-[93.75vw] lg:w-[62.5vw]"
      >
        <div className="win95-titlebar flex shrink-0 items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <button
            type="button"
            onClick={() => closeProject()}
            aria-label="Close"
            className="win95-raised grid h-4 w-5 shrink-0 place-items-center text-xs leading-none"
          >
            ×
          </button>
        </div>
        <div ref={bodyRef} className="lx-scroll min-h-0 flex-1 overflow-y-auto">
          {projects.map((p) => (
            <article key={p.slug} hidden={p.slug !== shown}>
              {p.content}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
