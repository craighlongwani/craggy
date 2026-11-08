"use client";
import { useEffect, useRef } from "react";
import { bootDrag, openCurtain } from "../lib/curtain";
import { bootEnd, bootEvents } from "./linux/bootLog";

// The home page's cold-load intro. layout.tsx's inline script sets
// <html data-boot="1"> before first paint (home page, no #hash, no reduced
// motion), which shows this overlay and hides the real footer's contents.
// Then:
//   1. an empty bar sits at the top while an Arch Linux boot log scrolls by
//      (bootLog.ts): kernel, initramfs, systemd, then `jed` logs in and runs
//      `tree renzo`
//   2. near the end of the log, the bar slides down to the bottom, wiping the
//      screen and uncovering a cursor for each window on screen (all six on
//      a wide screen, fewer where the windows stack), side by side
//   3. as the bar lands (it becomes the real footer: data-boot="footer"), the
//      prompt types in, the buttons fade in, and the cursors travel to their
//      windows and drag them open
// Windows below the fold stay shut and open as they're scrolled to, with the
// same cursor drag as the projects board's. Any click or key skips the
// intro (what's on screen shows at once; the rest still opens on scroll).

const WIPE_AT = 0.85; // share of the boot log played when the bar starts sliding
const WIPE_MS = 800;
const WIPE_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const FOOTER_MS = 1100; // keep in step with the data-boot="footer" CSS
const WINDOW_STAGGER_MS = 90;
// One per home window: README, skills, cat, contact, GitHub, status
const CURSORS = 6;
const CURSOR_GAP = 30;

export default function BootIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLPreElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    const tree = treeRef.current;
    const row = rowRef.current;
    const bar = barRef.current;
    if (!root || !tree || !row || !bar || !html.dataset.boot) return;

    const windows = Array.from(
      document.querySelectorAll<HTMLElement>("#home .win95-window"),
    );
    windows.forEach((w) => (w.style.opacity = "0"));

    const anims: Animation[] = [];
    const timers: number[] = [];
    let raf = 0;
    let wiping = false;
    let landed = false;
    let ended = false;
    const t0 = performance.now();
    // Once per browser session the whole log plays; after that it's a quick
    // version of the same thing
    const speed = html.dataset.bootQuick ? 4 : 1;
    try {
      sessionStorage.setItem("booted", "1");
    } catch {
      // Private mode etc.: it just plays in full every time
    }

    // Draws the log as of `t` ms in, scrolled to its end like a console;
    // returns how far through the boot it is (0 to 1)
    const caret = '<span class="lx-boot-caret">▌</span>';
    const render = (t: number) => {
      const out: string[] = [];
      let typing = false;
      for (const e of bootEvents) {
        if (e.at > t) break;
        if (e.typed) {
          const { prefix, text, charMs } = e.typed;
          const n = Math.min(text.length, Math.floor((t - e.at) / charMs));
          typing = n < text.length;
          const shown = text.slice(0, n).replace(/&/g, "&amp;").replace(/</g, "&lt;");
          out.push(prefix + shown + (typing ? caret : ""));
        } else {
          typing = false;
          out.push(e.html ?? "");
        }
      }
      // The cursor waits at the end of the last line
      if (out.length && !typing) out[out.length - 1] += caret;
      tree.innerHTML = out.join("\n");
      tree.scrollLeft = 0;
      tree.scrollTop = tree.scrollHeight;
      return t / bootEnd;
    };

    // One cursor per window that's on screen to be dragged (the stacked phone
    // layout has room for one or two, the rest are below the fold)
    const count = Math.min(
      CURSORS,
      windows.filter(
        (w) =>
          w.offsetWidth > 0 &&
          w.getBoundingClientRect().top < window.innerHeight - 8,
      ).length,
    );
    const cursorX = (i: number) => window.innerWidth / 2 + (i - (count - 1) / 2) * CURSOR_GAP - 7;
    const cursorY = () => window.innerHeight / 2 - 10;

    // The windows that are actually there (the résumé pop-up, a window nested
    // in README, is closed and has nothing to be dragged), split into those
    // on screen and those below the fold
    const split = () => {
      const shown = windows.filter((w) => w.offsetWidth > 0);
      const onScreen = shown.filter((w) => w.getBoundingClientRect().top < window.innerHeight - 8);
      return { onScreen, below: shown.filter((w) => !onScreen.includes(w)) };
    };

    // Windows below the fold stay shut until they scroll into view, then
    // open with the cursor drag (as OpenWindows does on the projects board);
    // windows arriving together open one after another
    const waiting = new Set<HTMLElement>();
    const scrollAnims: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => windows.indexOf(a) - windows.indexOf(b))
          .forEach((w, i) => {
            observer.unobserve(w);
            waiting.delete(w);
            w.style.opacity = "";
            scrollAnims.push(openCurtain(w, i));
          });
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    const openOnScroll = (list: HTMLElement[]) =>
      list.forEach((w) => {
        if (waiting.has(w)) return;
        waiting.add(w);
        observer.observe(w);
      });

    // The bar has landed: it is the real footer from here on
    const land = () => {
      if (landed || ended) return;
      landed = true;
      root.style.display = "none";
      html.dataset.boot = "footer";
      // One cursor per window on screen; the ones below the fold wait to be
      // scrolled to
      const { onScreen, below } = split();
      onScreen.forEach((w) => (w.style.opacity = ""));
      openOnScroll(below);
      onScreen.forEach((w, i) => {
        anims.push(
          bootDrag(
            w,
            { x: cursorX(Math.min(i, Math.max(count - 1, 0))), y: cursorY() },
            i * WINDOW_STAGGER_MS,
          ),
        );
      });
      timers.push(
        window.setTimeout(() => {
          delete html.dataset.boot;
          // The intro is over: clicks and keys no longer skip anything
          window.removeEventListener("pointerdown", end);
          window.removeEventListener("keydown", end);
        }, FOOTER_MS),
      );
    };

    const wipe = () => {
      wiping = true;
      const H = window.innerHeight;
      const barH = bar.offsetHeight;
      Array.from(row.children).forEach((c, i) => {
        const s = (c as HTMLElement).style;
        if (i >= count) s.display = "none";
        s.left = `${cursorX(i)}px`;
        s.top = `${cursorY()}px`;
      });
      const timing = { duration: WIPE_MS, easing: WIPE_EASE, fill: "forwards" as const };
      // The bar, the tree it wipes (hidden above the bar's lower edge) and
      // the cursors it uncovers (shown above its upper edge) share one
      // timeline
      bar.animate(
        [{ transform: "translateY(0)" }, { transform: `translateY(${H - barH}px)` }],
        timing,
      );
      // clip-path insets are measured from the element's own top edge, and the
      // log sits below the top of the screen, so subtract that offset. The
      // start is negative (the bar's lower edge is above the log); it must not
      // be clamped to 0, or the wipe line would run at a different rate from
      // the bar and trail it.
      const top = tree.getBoundingClientRect().top;
      tree.animate(
        [
          { clipPath: `inset(${barH - top}px 0 0 0)` },
          { clipPath: `inset(${H - top}px 0 0 0)` },
        ],
        timing,
      );
      row.animate(
        [{ clipPath: `inset(0 0 ${H}px 0)` }, { clipPath: `inset(0 0 ${barH}px 0)` }],
        timing,
      );
      timers.push(window.setTimeout(land, WIPE_MS));
    };

    const tick = (now: number) => {
      if (!html.dataset.boot) {
        // Something else (the safety timer in layout.tsx) ended the intro
        end();
        return;
      }
      const t = (now - t0) * speed;
      const progress = render(t);
      if (!wiping && progress >= WIPE_AT) wipe();
      if (!landed) raf = requestAnimationFrame(tick);
    };

    // Skip, or the safety net: show the finished page right away
    const end = () => {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      root.style.display = "none";
      // Skipped before the bar landed: what's below the fold now waits to be
      // scrolled to (after landing, it already is)
      if (!landed) openOnScroll(split().below);
      // Everything else shows at once
      windows.forEach((w) => {
        if (!waiting.has(w)) w.style.opacity = "";
      });
      delete html.dataset.boot;
      window.removeEventListener("pointerdown", end);
      window.removeEventListener("keydown", end);
    };

    window.addEventListener("pointerdown", end);
    window.addEventListener("keydown", end);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointerdown", end);
      window.removeEventListener("keydown", end);
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      scrollAnims.forEach((a) => a.cancel());
      observer.disconnect();
      root.style.display = "";
      windows.forEach((w) => (w.style.opacity = ""));
      tree.getAnimations().forEach((a) => a.cancel());
      row.getAnimations().forEach((a) => a.cancel());
      bar.getAnimations().forEach((a) => a.cancel());
    };
  }, []);

  return (
    <div ref={rootRef} className="lx-boot" aria-hidden="true">
      <pre ref={treeRef} className="lx-boot-tree" />
      <div ref={rowRef} className="lx-boot-cursors">
        {Array.from({ length: CURSORS }, (_, i) => (
          <svg
            key={i}
            width="14"
            height="20"
            viewBox="0 0 14 20"
            style={{ position: "absolute", overflow: "visible" }}
          >
            <path
              d="M0 0v16l4-4 3 7 2.5-1-3-7H13z"
              fill="#fff"
              stroke="#000"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      <div ref={barRef} className="lx-boot-bar" />
    </div>
  );
}
