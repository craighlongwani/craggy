"use client";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import GithubCalendar from "./components/GithubCalendar";
import RestoreWindows from "./components/RestoreWindows";
import type { Skill } from "./components/SkillWindow";
import Window from "./components/Window";
import Sidebar from "./components/linux/Sidebar";
import SkillsList from "./components/linux/SkillsList";
import Uptime from "./components/linux/Uptime";
import { links } from "./components/linux/links";
import { useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { markProjectOpening, minimizeAndGo } from "./lib/anchor";
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

// neofetch-style grays, darkest to brightest
const swatches = [
  "#0b0b0b",
  "#262626",
  "#404040",
  "#5a5a5a",
  "#7d7d7d",
  "#a0a0a0",
  "#c8c8c8",
  "#f0f0f0",
];

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

  // Minimize every window into the sidebar's home entry, then open
  // /projects. Modified clicks (new tab, etc.) keep the link's normal behavior.
  const openProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    minimizeAndGo("home", () => router.push("/projects"));
  };

  // Same movement for a single project: its page restores from the projects
  // entry.
  const openFeatured = (slug: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    minimizeAndGo("home", () => {
      markProjectOpening(slug);
      router.push(`/projects/${slug}`);
    });
  };

  return (
    <main data-skin="linux" className="relative h-dvh w-full overflow-hidden">
      <Sidebar current="home" />

      {/* Below 1024px the windows stack and this area scrolls; from there up
          they tile the screen exactly, 4 columns by 3 rows */}
      <div className="h-full overflow-y-auto pt-10 xl:pl-52 xl:pt-0">
        <div className="p-3 md:p-4 lg:h-full xl:p-5">
          <RestoreWindows
            icon="home"
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:h-full lg:grid-cols-4 lg:grid-rows-3 lg:gap-4"
          >
            {/* About: laid out like neofetch's output */}
            <Window
              id="about"
              title="README.md"
              className="md:col-span-2 lg:row-span-2"
              bodyClassName="flex flex-col gap-3 overflow-hidden"
            >
              <p className="lx-dim">
                <span aria-hidden="true">$ </span>neofetch
              </p>

              <div className="@container flex min-h-0 flex-1 flex-col">
                <div className="grid min-h-0 flex-1 gap-4 @md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
                  <div className="lx-portrait aspect-[4/3] @md:aspect-auto @md:min-h-0">
                    <Image
                      src="/assets/me.png"
                      alt="Portrait of Jed Lawrence Engbino"
                      fill
                      priority
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      className="object-cover object-[55%_35%]"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col gap-3">
                    <div>
                      <h1 className="text-xl font-bold leading-tight tracking-tight @lg:text-2xl">
                        Jed Lawrence Engbino
                      </h1>
                      <hr className="lx-rule mt-2" />
                    </div>

                    <dl className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[12px] @lg:text-[13px]">
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

                    <div aria-hidden="true" className="flex">
                      {swatches.map((color) => (
                        <span
                          key={color}
                          className="h-3 w-5"
                          style={{ background: color }}
                        />
                      ))}
                    </div>

                    {/* The top bar and sidebar list these from 1024px up */}
                    <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 lg:hidden">
                      {links.map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            {...(link.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="lx-link"
                          >
                            {link.label}
                            {link.external && (
                              <span aria-hidden="true" className="lx-dim">
                                {" "}
                                ↗
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Window>

            {/* GitHub: the contribution calendar, scaled to the window */}
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
              bodyClassName="flex flex-col gap-3 overflow-hidden"
            >
              <p className="lx-dim">
                <span aria-hidden="true">$ </span>git log --since=&quot;1 year
                ago&quot;
              </p>
              <div className="flex min-h-0 flex-1 items-center">
                <GithubCalendar />
              </div>
            </Window>

            {/* Skills: a compact list, each row opens its write-up */}
            <Window
              id="skills"
              title="~/skills"
              className="md:col-span-2"
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <SkillsList skills={skills} />
            </Window>

            {/* Featured work: one row per project (they follow data.ts), plus
                the link to the full /projects page */}
            <Window
              id="projects"
              title="~/projects"
              className="lg:col-span-3"
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <p className="lx-dim">
                <span aria-hidden="true">$ </span>ls ~/projects
              </p>
              <ul className="@container flex min-h-0 flex-1 flex-col gap-1.5">
                {projects.map((p) => (
                  <li key={p.slug} className="min-h-0 flex-1">
                    <Link
                      href={`/projects/${p.slug}`}
                      onClick={openFeatured(p.slug)}
                      className="lx-row lx-box flex h-full flex-col justify-center gap-0 @lg:flex-row @lg:items-baseline @lg:justify-start @lg:gap-3"
                    >
                      <span className="shrink-0 font-bold">
                        <span aria-hidden="true" className="lx-dim">
                          ▸{" "}
                        </span>
                        {p.name}
                      </span>
                      <span className="lx-dim min-w-0 truncate text-[12px]">
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
              <p className="lx-dim">
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
          </RestoreWindows>
        </div>
      </div>
    </main>
  );
}
