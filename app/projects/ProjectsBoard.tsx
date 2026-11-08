"use client";
import Link from "next/link";
import OpenWindows from "../components/OpenWindows";
import Window from "../components/Window";
import { openProject } from "../lib/project";
import { projects } from "./data";
import ViewLink from "./ViewLink";

// How many tech chips a card shows before "+N more"
const CHIPS = 5;

// The projects board: a catalog of equal cards, two to a row, running down
// the page; a new project is one more card. Each card is a window titled like
// a folder, with its demo video as the preview (its first frame, playing on
// hover), when it was done and for what, the pitch, the stack, and links.
// "open" grows the card into the project's window. The windows open as they
// scroll into view.
export default function ProjectsBoard() {
  return (
    <div className="p-3 md:p-4">
      <h2 className="mb-3 flex items-baseline gap-3 md:mb-4">
        <span className="lx-dim text-[11px]">§ 02</span>
        <span className="text-lg font-bold md:text-xl">~/projects</span>
      </h2>

      {/* From tablet width the cards are 80% of the full-width size and
          centered, with the same 1rem gap: two cards at 80% of
          (100% - gap), plus the gap, is 80% + 0.2rem */}
      <OpenWindows
        onView
        className="grid grid-cols-1 gap-3 md:mx-auto md:w-[calc(80%+0.2rem)] md:grid-cols-2 md:gap-4"
      >
        {projects.map((p) => (
          // The whole card opens the project (its links still do their
          // own thing), and pointing at it plays the preview
          <div
            key={p.slug}
            className="lx-card cursor-pointer"
            onClick={(e) => {
              if ((e.target as Element).closest("a")) return;
              openProject(p.slug, e.currentTarget.querySelector<HTMLElement>(".win95-window"));
            }}
            onMouseEnter={(e) => void e.currentTarget.querySelector("video")?.play().catch(() => {})}
            onMouseLeave={(e) => e.currentTarget.querySelector("video")?.pause()}
          >
          <Window
            project={p.slug}
            title={`${p.slug}/`}
            className="h-full"
            bodyClassName="flex flex-col gap-2"
          >
            <Preview src={p.video.src} label={p.video.label} background={p.logoBackground} />

            <p className="lx-dim mt-1 text-[11px]">
              {p.when} · {p.badge}
            </p>
            <h3 className="text-[14px] font-bold leading-snug md:text-[15px]">
              {p.name}: {p.summary}
            </h3>
            <p className="lx-dim line-clamp-3 text-[12px] leading-relaxed">{p.description[0]}</p>

            <ul className="flex flex-wrap gap-1.5">
              {p.tech.slice(0, CHIPS).map((t) => (
                <li key={t} className="lx-box px-2 text-[11px]">
                  {t}
                </li>
              ))}
              {p.tech.length > CHIPS && (
                <li className="lx-box lx-dim border-dashed px-2 text-[11px]">
                  +{p.tech.length - CHIPS} more
                </li>
              )}
            </ul>

            <div className="mt-auto flex items-center gap-3 border-t border-[var(--lx-line)] pt-2 text-[12px]">
              {"href" in p.source ? (
                <Link href={p.source.href} target="_blank" className="lx-link min-w-0 truncate">
                  {p.source.label}
                </Link>
              ) : (
                <span className="lx-dim min-w-0 truncate">{p.source.note}</span>
              )}
              <span className="ml-auto">
                <ViewLink slug={p.slug} name={p.name} />
              </span>
            </div>
          </Window>
          </div>
        ))}
      </OpenWindows>

      <p className="lx-dim mt-4 text-[12px]">
        <span aria-hidden="true">$ </span>open a project for the full write-up, demo and stack
      </p>
    </div>
  );
}

// The card's preview: the demo video's first frame (the card plays it while
// the pointer is over it). Only its first frame's worth is fetched up front.
function Preview({ src, label, background }: { src: string; label: string; background: string }) {
  return (
    <div className="lx-portrait relative aspect-video" style={{ background }}>
      <video
        src={`${src}#t=0.1`}
        preload="metadata"
        muted
        loop
        playsInline
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
