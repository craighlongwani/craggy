"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useLayoutEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import Header from "./linux/Header";
import {
  arrivedAtProject,
  arrivedFromExpand,
  closeProject,
  openCurtain,
  prefersReducedMotion,
  removeExpandGhost,
} from "../lib/curtain";

// A project's page: one window in the same bento area as /projects, centered,
// full height and 25% wider than the old project card (keep the width classes
// in step with projectWindowRect). When the window just expanded out of
// /projects, it takes over from that expanding copy and its contents fade in.
// When the home page jumped here instead, it already closed its windows, so
// this window opens its own curtain. × plays it in reverse: the contents fade
// out and the window shrinks back into its slot on /projects.
export default function ProjectWindow({
  slug,
  title,
  children,
}: {
  slug: string;
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const windowRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const close = (e: MouseEvent<HTMLAnchorElement>) => {
    // Modified clicks (new tab, etc.) keep the link's normal behavior
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    closeProject(slug, contentRef.current, () => router.push("/projects"));
  };

  useLayoutEffect(() => {
    const fromHome = arrivedAtProject(slug);
    const expanded = arrivedFromExpand();
    removeExpandGhost();
    if (prefersReducedMotion()) return;

    // Arriving from the home page: it already closed its windows, so this
    // window opens its curtain, like any other page taking over.
    if (fromHome) {
      const win = windowRef.current;
      if (!win) return;
      const a = openCurtain(win);
      return () => a.cancel();
    }

    // Arriving from /projects: take over from the window expanding there
    if (!expanded) return;
    const a = contentRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      delay: 50,
      easing: "ease-out",
      fill: "backwards",
    });
    return () => a?.cancel();
  }, [slug]);

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Header current="projects" />

      {/* The bento area: below the header, with the page's margins as padding
          (projectWindowRect reads them) */}
      <div
        data-bento
        className="h-full overflow-y-auto p-3 pb-[3.25rem] md:p-4 md:pb-14"
      >
        <section
          ref={windowRef}
          className="win95-window lx-active mx-auto flex h-full min-h-0 w-full max-w-full flex-col md:w-[93.75vw] lg:w-[62.5vw]"
        >
          <div className="win95-titlebar flex shrink-0 items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate">{title}</span>
            {/* Title bar close button: back to all projects */}
            <Link
              href="/projects"
              onClick={close}
              aria-label="Close"
              className="win95-raised grid h-4 w-5 shrink-0 place-items-center text-xs leading-none"
            >
              ×
            </Link>
          </div>
          <div
            ref={contentRef}
            className="lx-scroll min-h-0 flex-1 overflow-y-auto"
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
