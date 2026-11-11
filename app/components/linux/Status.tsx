import type { ReactNode } from "react";

// Experience drawn from the résumé
const who = [
  { name: "CareerLaunch-Africa", what: "Founder · full-stack · 2025 · remote" },
  { name: "EngFind", what: "Founder · full-stack · 2025 · remote" },
];

// Representative work with evidence from the résumé
const strengths = [
  {
    area: "AI + SaaS",
    name: "CareerLaunch-Africa",
    proof: "AI CV tools · interview prep · job alerts · mobile-ready",
  },
  {
    area: "full-stack",
    name: "EngFind",
    proof: "Firebase auth · listings & auctions · admin roles",
  },
  {
    area: "real-time",
    name: "Glitchy Chats",
    proof: "Django · PostgreSQL · WebSockets · privacy controls",
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
// (`who`), and representative work with proof from the résumé (`grep`).
export default function Status() {
  return (
    <div className="lx-scroll @container flex min-h-0 flex-1 flex-col justify-between gap-0.5 overflow-y-auto text-[12px] leading-[1.3]">
      <section>
        <Prompt>systemctl status craig</Prompt>
        {/* The service line repeats README's name and role: it goes first
            when the screen is short */}
        <p className="shorter:hidden">
          <span className="lx-boot-ok" aria-hidden="true">● </span>
          <span className="font-bold">craig</span>
          <span className="lx-dim"> · Computer Science student · full-stack &amp; AI</span>
        </p>
        <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] pl-4">
          <dt className="lx-dim">Active:</dt>
          <dd>
            <span className="lx-boot-ok font-bold">active (seeking)</span> · software engineering internship
          </dd>
          <dt className="lx-dim">Where:</dt>
          <dd>Midrand, Gauteng · remote or on-site</dd>
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
        <Prompt>grep strength ~/resume</Prompt>
        {/* In a narrow window the area labels go, so each line still fits */}
        <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-2 @[34rem]:grid-cols-[4.5rem_5rem_minmax(0,1fr)]">
          {strengths.map((s) => (
            <div key={s.name} className="contents">
              <dt className="lx-dim hidden @[34rem]:block">{s.area}</dt>
              <dd className="font-bold">{s.name}</dd>
              <dd>{s.proof}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
