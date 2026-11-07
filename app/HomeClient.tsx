"use client";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import GithubCalendar from "./components/GithubCalendar";
import OpenWindows from "./components/OpenWindows";
import type { Skill } from "./components/SkillWindow";
import Window from "./components/Window";
import Header from "./components/linux/Header";
import SkillsList from "./components/linux/SkillsList";
import Uptime from "./components/linux/Uptime";
import { stack } from "./components/linux/stack";
import { Fragment, useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { curtainAndGo, markProjectOpening } from "./lib/curtain";
import { projects } from "./projects/data";
import { hashId, scrollToWindow } from "./lib/windowScroll";

// Each skill is a row in the Skills window; clicking one opens a window with
// the full write-up and its title art.
const skills: Skill[] = [
  {
    title: "Full-Stack Development",
    image: "/assets/projects/FULLSTACKDEV.png",
    color: "#99ccff",
    description:
      "Building complete web apps end to end, from the screens people click through to the servers and APIs behind them.",
    highlights: [
      "Responsive interfaces that work on phones and desktops alike",
      "Back-end APIs that validate input and hand the front end clean, predictable data",
      "Picking up an existing codebase and shipping new features on top of it",
      "Generating branded PDF documents and reports straight from app data",
    ],
    usedIn: ["Bean-o", "Barangay Management System", "VerifAI", "Revora"],
  },
  {
    title: "Database Design & SQL",
    image: "/assets/projects/DBandSQL.png",
    color: "#ffff99",
    description:
      "Modeling data so it stays correct, then writing the queries and rules that keep it that way.",
    highlights: [
      "Normalized schemas and ER diagrams, such as a 15-table design with a full address hierarchy",
      "Multi-step writes wrapped in one transaction, so related records save together or not at all",
      "Stored procedures and triggers that enforce business rules inside the database itself",
      "Queries and functions that power live dashboards and approval queues",
    ],
    usedIn: ["Revora", "Bean-o", "Barangay Management System"],
  },
  {
    title: "Security & Access Control",
    image: "/assets/projects/SECandAC.png",
    color: "#ccffcc",
    description:
      "Making sure every person and service can do exactly what it needs to, and nothing more.",
    highlights: [
      "Role-based accounts and admin-only pages, where users can't raise their own role",
      "Least-privilege database logins with explicit deny rules and masked personal data",
      "Hashed passwords, idle session timeouts, and audit logs that record who did what",
      "Keeping secret keys on the server, never in the browser",
    ],
    usedIn: ["Bean-o", "Revora", "Barangay Management System"],
  },
  {
    title: "AI & API Integration",
    image: "/assets/projects/AIandAPI_Integration.png",
    color: "#ff66cc",
    description:
      "Putting AI models and outside APIs to work, without trusting their answers blindly.",
    highlights: [
      "A server-side proxy so AI keys never reach the user's browser",
      "Checking every AI-suggested source against an authoritative database before showing it",
      "Parallel API lookups, with a fallback search when no match turns up",
      "A 100-point rubric that scores each source on recency and relevance",
    ],
    usedIn: ["VerifAI"],
  },
  {
    title: "Testing & DevOps",
    image: "/assets/projects/TESTandDEVOPS.png",
    color: "#00cc99",
    description:
      "Automated checks and repeatable builds, so changes ship with confidence instead of crossed fingers.",
    highlights: [
      "Automated tests that catch regressions before users ever see them",
      "Containerized environments that run the same on every machine",
      "CI pipelines that test and build every change automatically",
      "Repeatable deploys that take the guesswork out of releasing",
    ],
    usedIn: ["Bean-o", "This portfolio"],
  },
  {
    title: "Systems Analysis & Design",
    image: "/assets/projects/SYSandDE.png",
    color: "#ffcc66",
    description:
      "Working out what a system should do before building it, and writing it down so the whole team agrees.",
    highlights: [
      "Requirements specifications and use cases that pin down the scope",
      "Data flow and ER diagrams that map how information moves and where it lives",
      "Multi-step workflows, like registration and approval, designed before any code",
      "Technical documentation the rest of the team can build from",
    ],
    usedIn: ["VerifAI", "Revora"],
  },
];

// neofetch's color blocks, in grays: 16 steps from dark to light, shown as
// two rows of eight
const ramp = Array.from({ length: 16 }, (_, i) => `hsl(0 0% ${6 + i * 6}%)`);

export default function HomeClient() {
  const router = useRouter();

  // Deep links such as /#skills (used by the Start menu) scroll the page's
  // own scroll area, since the page itself doesn't scroll. Also runs on
  // hashchange so jumping within the page doesn't reload it.
  useEffect(() => {
    const jump = () => {
      const id = hashId();
      if (!id) return;
      const frame = requestAnimationFrame(() => scrollToWindow(id));
      return () => cancelAnimationFrame(frame);
    };

    let cancel = jump();
    const onHash = () => {
      cancel?.();
      cancel = jump();
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      cancel?.();
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  // Close every window like a curtain, then open /projects. Modified clicks
  // (new tab, etc.) keep the link's normal behavior.
  const openProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    curtainAndGo(() => router.push("/projects"));
  };

  // Same for a single project: its page opens its own curtain.
  const openFeatured = (slug: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    curtainAndGo(() => {
      markProjectOpening(slug);
      router.push(`/projects/${slug}`);
    });
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Header current="home" />

      {/* From 1024px the windows tile the screen exactly: 4 columns by 3 rows.
          About is 2x2; GitHub, Skills and Projects are 2x1; Contact is 1x1.
          Below that they stack (two columns from 768px) and this area
          scrolls. */}
      <div className="h-full overflow-y-auto pt-10">
        <div className="p-3 md:p-4 lg:h-full">
          <OpenWindows
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:h-full lg:grid-cols-4 lg:grid-rows-3 lg:gap-4"
          >
            {/* About: neofetch's output (portrait, facts and a gray gradient),
                then a short bio and the tech stack. The neofetch part keeps
                its size; the bio and stack scroll inside the window when they
                don't fit. The prompts and the decoration only show where
                there's room for them. */}
            <Window
              id="about"
              title="README.md"
              className="md:col-span-2 lg:row-span-2"
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <p className="lx-dim lx-prompt">
                <span aria-hidden="true">$ </span>neofetch
              </p>

              <div className="@container flex min-h-0 flex-1 flex-col gap-3 shorter:gap-2">
                <div className="grid shrink-0 gap-3 @md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
                  <div className="lx-portrait aspect-[4/3] @md:aspect-auto @md:min-h-0">
                    <Image
                      src="/assets/me.png"
                      alt="Portrait of Jed Lawrence Engbino"
                      fill
                      priority
                      sizes="(min-width: 1024px) 15vw, 100vw"
                      className="object-cover object-[55%_35%]"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col gap-2 shorter:gap-1.5">
                    <div>
                      <p
                        aria-hidden="true"
                        className="lx-dim mb-0.5 text-[11px] shorter:hidden"
                      >
                        jed@renzo
                      </p>
                      <h1 className="text-lg font-bold leading-tight tracking-tight @lg:text-xl shorter:text-base shorter:@lg:text-base">
                        Jed Lawrence Engbino
                      </h1>
                      <hr className="lx-rule mt-1.5 shorter:mt-1" />
                    </div>

                    <dl className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-[12px] leading-[1.45] shorter:gap-y-0.5">
                      <dt className="lx-dim">role</dt>
                      <dd>Full-stack &amp; Database</dd>
                      <dt className="lx-dim">school</dt>
                      <dd>De La Salle-College of Saint Benilde</dd>
                      <dt className="lx-dim">study</dt>
                      <dd>Information Systems, 3rd year · Dean&apos;s Lister</dd>
                      <dt className="lx-dim">uptime</dt>
                      <dd>
                        <Uptime />
                      </dd>
                      <dt className="lx-dim">based</dt>
                      <dd>Manila, Philippines | Jeddah, Kingdom of Saudi Arabia</dd>
                      <dt className="lx-dim">seeking</dt>
                      <dd>
                        IS / software engineering internships · Metro Manila /
                        remote
                      </dd>
                    </dl>

                    {/* neofetch's color blocks, in grays: one ramp over two rows */}
                    <div aria-hidden="true" className="mt-auto pt-1 shorter:hidden">
                      <div className="flex">
                        {ramp.slice(0, 8).map((color) => (
                          <span
                            key={color}
                            className="h-3.5 w-6"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                      <div className="flex">
                        {ramp.slice(8).map((color) => (
                          <span
                            key={color}
                            className="h-3.5 w-6"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  role="region"
                  aria-label="About, and tech stack"
                  tabIndex={0}
                  className="lx-scroll min-h-0 flex-1 overflow-y-auto"
                >
                  <p className="lx-dim lx-prompt mb-1.5">
                    <span aria-hidden="true">$ </span>cat about.txt
                  </p>
                  <p className="text-[12px] leading-[1.6]">
                    Information Systems student building database-driven web
                    systems end to end, from requirements and ER design to the
                    APIs and screens on top. Led Revora, a verified-onboarding
                    system that keeps its business rules and security inside SQL
                    Server: a normalized 15-table schema, all-or-nothing
                    registration transactions, triggers for password hashing and
                    audit logs, and least-privilege logins with masked personal
                    data. Led the backend and AI integration for VerifAI, a
                    hackathon prototype that checks every AI-suggested source
                    against CrossRef before showing it, and built certificate
                    PDFs, household rules and access controls for a Pasay City
                    barangay&apos;s management system. Currently building Bean-o,
                    a recipe-costing and inventory app for small cafés, backed
                    by automated tests and CI. Writes things down as it goes:
                    requirements specifications, data flow diagrams, and
                    technical documentation the rest of a team can build from.
                  </p>

                  <p className="lx-dim lx-prompt mb-1.5 mt-3">
                    <span aria-hidden="true">$ </span>cat stack.txt
                  </p>
                  <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-[12px] leading-[1.45]">
                    {stack.map(({ label, items }) => (
                      <Fragment key={label}>
                        <dt className="lx-dim">{label}</dt>
                        <dd>{items.join(" · ")}</dd>
                      </Fragment>
                    ))}
                  </dl>
                </div>
              </div>
            </Window>

            {/* GitHub: the whole year when it fits the window at a readable
                size, otherwise the latest weeks */}
            <Window
              id="github"
              title={
                <Link
                  href="https://github.com/renzoboyy"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <Image
                    src="/assets/icons/GitHub.png"
                    width={14}
                    height={14}
                    alt=""
                    className="h-3.5 w-3.5"
                  />
                  github.com/renzoboyy
                </Link>
              }
              className="md:col-span-2"
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <p className="lx-dim lx-prompt">
                <span aria-hidden="true">$ </span>git log --since=&quot;1 year
                ago&quot;
              </p>
              <div className="lx-box relative min-h-0 w-full flex-1 overflow-hidden p-3">
                <GithubCalendar />
              </div>
            </Window>

            {/* Skills: a list, each cell opens its write-up */}
            <Window
              id="skills"
              title="~/skills"
              className="md:col-span-2"
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <SkillsList skills={skills} />
            </Window>

            {/* Projects: one row per project (they follow data.ts), plus the
                link to the full /projects page */}
            <Window
              id="projects"
              title="~/projects"
              className="lg:col-span-2"
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <p className="lx-dim lx-prompt">
                <span aria-hidden="true">$ </span>ls ~/projects
              </p>
              <ul className="@container flex min-h-0 flex-1 flex-col gap-1.5">
                {projects.map((p) => (
                  <li key={p.slug} className="min-h-0 flex-1">
                    <Link
                      href={`/projects/${p.slug}`}
                      onClick={openFeatured(p.slug)}
                      className="lx-row lx-box flex h-full flex-col justify-center @lg:flex-row @lg:items-baseline @lg:justify-start @lg:gap-3"
                    >
                      <span className="block max-w-full shrink-0 truncate font-bold">
                        <span aria-hidden="true" className="lx-dim">
                          ▸{" "}
                        </span>
                        {p.name}
                      </span>
                      <span className="lx-dim block min-w-0 max-w-full truncate text-[12px]">
                        {p.summary}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/projects"
                onClick={openProjects}
                className="lx-link self-start"
              >
                all projects →
              </Link>
            </Window>

            {/* Contact */}
            <Window
              id="contact"
              title="contact.txt"
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <p className="lx-dim lx-prompt">
                <span aria-hidden="true">$ </span>cat contact.txt
              </p>
              <dl className="flex flex-col gap-3 text-[12px]">
                <div className="min-w-0">
                  <dt className="lx-dim">email</dt>
                  <dd className="break-all">
                    <a
                      href="mailto:jedlawrence.engbino@gmail.com"
                      className="lx-link"
                    >
                      jedlawrence.engbino@gmail.com
                    </a>
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="lx-dim">phone</dt>
                  <dd className="truncate">
                    <a href="tel:+639459718300" className="lx-link">
                      +63 949 825 3671
                    </a>
                  </dd>
                </div>
              </dl>
            </Window>
          </OpenWindows>
        </div>
      </div>
    </main>
  );
}
