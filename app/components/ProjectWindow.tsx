"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useLayoutEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import Taskbar from "./Taskbar";
import {
  arrivedFromExpand,
  closeProject,
  prefersReducedMotion,
  removeExpandGhost,
} from "../lib/anchor";

// A project's page: one Win95 window on the teal desktop, in the same bento
// area as /projects, centered, full height and 25% wider than the old
// project card (keep the width classes in step with projectWindowRect).
// When the window just expanded out of /projects, it takes over from that
// expanding copy and its contents fade in. × plays it in reverse: the
// contents fade out and the window shrinks back into its slot on /projects.
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
    const expanded = arrivedFromExpand();
    removeExpandGhost();
    if (!expanded || prefersReducedMotion()) return;
    const a = contentRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      delay: 50,
      easing: "ease-out",
      fill: "backwards",
    });
    return () => a?.cancel();
  }, []);

  return (
    <main className="relative w-full h-screen font-body bg-[#008080]">
      <div className="absolute inset-x-0 top-0 bottom-10 flex items-center justify-center">
        <div data-bento className="w-full h-[95%] p-3 md:w-[95vw] md:p-6 lg:p-8">
          <section className="win95-window mx-auto h-full w-full md:w-[93.75vw] lg:w-[62.5vw] max-w-full flex flex-col min-h-0">
            <div className="win95-titlebar font-win flex items-center gap-1.5 text-sm md:text-base shrink-0">
              <span className="flex-1 min-w-0 truncate">{title}</span>
              {/* Title bar close button: back to all projects */}
              <Link
                href="/projects"
                onClick={close}
                aria-label="Close"
                className="win95-raised shrink-0 w-4 h-3.5 md:w-[18px] md:h-4 grid place-items-center text-black text-xs leading-none font-bold"
              >
                ×
              </Link>
            </div>
            <div
              ref={contentRef}
              className="flex-1 min-h-0 overflow-y-auto p-3 md:p-5 lg:p-6"
            >
              {children}
            </div>
          </section>
        </div>
      </div>

      <Taskbar current="projects" />
    </main>
  );
}
