"use client";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { openCurtain, prefersReducedMotion } from "../lib/curtain";
import { closeProject, useLastProject, useOpenProject } from "../lib/project";

const DIM_MS = 200;
// Closing squishes the window shut like a vertical curtain
const CLOSE_MS = 180;
const CLOSE_EASE = "cubic-bezier(0.4, 0, 0.6, 1)";

// The open project's window, over the dimmed page. It opens like every other
// window on the site: the cursor drags its outline out in the middle of the
// screen, then the write-up appears (openCurtain). It closes like a curtain,
// squishing toward its middle line. Every project's write-up is rendered here
// up front (so opening is instant and the text is part of the page); only
// the open one shows.
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
  const anims = useRef<Animation[]>([]);
  const finishClose = useRef<(() => void) | null>(null);

  // Opens, swaps or closes the window whenever the open project changes.
  // The window is shown and hidden directly (not through React state).
  useLayoutEffect(() => {
    const root = rootRef.current;
    const dim = dimRef.current;
    const win = windowRef.current;
    const body = bodyRef.current;
    if (!root || !dim || !win || !body) return;

    const stopAnims = () => {
      anims.current.forEach((a) => a.cancel());
      anims.current = [];
    };
    const video = () =>
      body.querySelector<HTMLVideoElement>(":scope > :not([hidden]) video");

    // ── Open ──
    if (want) {
      finishClose.current?.();
      stopAnims();
      root.hidden = false;
      body.scrollTop = 0;
      // Opened cold (a deep link, a touch): the video's first frame isn't
      // decoded yet (see warmProject), so it fades in when it is, rather
      // than popping in over its black box
      const first = video();
      if (first && first.readyState < 2) {
        first.preload = "auto";
        first.style.opacity = "0";
        const show = () => {
          clearTimeout(timer);
          first.style.transition = "opacity 200ms";
          first.style.opacity = "";
        };
        const timer = setTimeout(show, 1500);
        first.addEventListener("loadeddata", show, { once: true });
      }
      const play = () => void video()?.play().catch(() => {});
      if (prefersReducedMotion()) {
        play();
        return;
      }
      const draw = openCurtain(win);
      anims.current = [
        dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DIM_MS }),
        draw,
      ];
      draw.finished.then(play, () => {});
      return;
    }

    // ── Close ── (nothing to do if it isn't open)
    if (root.hidden || finishClose.current) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      finishClose.current = null;
      video()?.pause();
      root.hidden = true;
      stopAnims();
    };
    finishClose.current = finish;
    // Animations stall when the browser stops drawing frames (a hidden tab)
    const timer = setTimeout(finish, Math.max(CLOSE_MS, DIM_MS) + 150);
    stopAnims();
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    const fill = { fill: "forwards" as const };
    const origin = "50% 50%";
    const squish = win.animate(
      [
        { transform: "scaleY(1)", opacity: 1, transformOrigin: origin },
        { opacity: 1, offset: 0.4 },
        { transform: "scaleY(0)", opacity: 0, transformOrigin: origin },
      ],
      { duration: CLOSE_MS, easing: CLOSE_EASE, ...fill },
    );
    const undim = dim.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: DIM_MS,
      easing: "ease-in",
      ...fill,
    });
    anims.current = [squish, undim];
    Promise.all([squish.finished, undim.finished]).then(finish, () => {});
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
            <article key={p.slug} data-slug={p.slug} hidden={p.slug !== shown}>
              {p.content}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
