"use client";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { openProject } from "../../lib/project";

// Who the work was for, as `who` would list logged-in users
const who = [
  { name: "barangay-43", what: "Pasay City LGU · demoed & approved" },
  { name: "hackfest", what: "GDG Loyola 2026 · 4 devs, 1 week" },
];

// One strength per project, each with the countable proof from its repo
const strengths = [
  {
    area: "databases",
    slug: "revora",
    proof: "15 tables · 7 procs · 4 triggers · masked PII",
  },
  {
    area: "backend",
    slug: "barangay",
    proof: "certificate PDFs · audit trail · role access",
  },
  {
    area: "ai + apis",
    slug: "verifai",
    proof: "Gemini → CrossRef · 3-tier claim check",
  },
];

function Prompt({ children }: { children: ReactNode }) {
  return (
    <p className="lx-dim">
      <span aria-hidden="true">$ </span>
      {children}
    </p>
  );
}

// The home board's status window: what an employer needs first. Whether
// I'm available and for what (as `systemctl status`), who the work was for
// (`who`), and one strength per project with proof from its repo (`grep`);
// each project name opens that project.
export default function Status() {
  const open = (slug: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    // Modified clicks (new tab, etc.) keep the link's normal behavior
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    openProject(slug, e.currentTarget);
  };

  return (
    <div className="lx-scroll @container flex min-h-0 flex-1 flex-col justify-between gap-0.5 overflow-y-auto text-[12px] leading-[1.3]">
      <section>
        <Prompt>systemctl status jed</Prompt>
        {/* The service line repeats README's name and role: it goes first
            when the screen is short */}
        <p className="shorter:hidden">
          <span className="lx-boot-ok" aria-hidden="true">● </span>
          <span className="font-bold">jed</span>
          <span className="lx-dim"> · IS student · full-stack &amp; databases</span>
        </p>
        <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] pl-4">
          <dt className="lx-dim">Active:</dt>
          <dd>
            <span className="lx-boot-ok font-bold">active (seeking)</span> · 6-mo internship ·
            available now
          </dd>
          <dt className="lx-dim">Where:</dt>
          <dd>remote, or on-site near Manila</dd>
        </dl>
      </section>

      <section>
        <Prompt>who</Prompt>
        <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-2">
          {who.map((w) => (
            <div key={w.name} className="contents">
              <dt className="font-bold">{w.name}</dt>
              <dd className="lx-dim">{w.what}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <Prompt>grep strength ~/projects</Prompt>
        {/* In a narrow window the area labels go, so each line still fits */}
        <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-2 @[34rem]:grid-cols-[4.5rem_5rem_minmax(0,1fr)]">
          {strengths.map((s) => (
            <div key={s.slug} className="contents">
              <dt className="lx-dim hidden @[34rem]:block">{s.area}</dt>
              <dd>
                <Link href={`/#projects/${s.slug}`} onClick={open(s.slug)} className="lx-link font-bold">
                  {s.slug}/
                </Link>
              </dd>
              <dd>{s.proof}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
