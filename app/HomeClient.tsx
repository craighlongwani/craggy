"use client";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import GithubCalendar from "./components/GithubCalendar";
import SkillsGrid from "./components/SkillsGrid";
import type { Skill } from "./components/SkillWindow";

import RestoreWindows from "./components/RestoreWindows";
import Taskbar from "./components/Taskbar";
import Window from "./components/Window";
import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { minimizeAndGo } from "./lib/anchor";

// Each card shows its title art on a 90s web-safe color picked to contrast
// with it; clicking opens a window with the full write-up.
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

export default function HomeClient() {
  const router = useRouter();
  const [overlayMinimized, setOverlayMinimized] = useState(false);

  // Minimize every window into the taskbar's home icon, then open
  // /projects. Modified clicks (new tab, etc.) keep the link's normal behavior.
  const openProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    minimizeAndGo("home", () => router.push("/projects"));
  };

  return (
    <main className="relative w-full h-screen font-body bg-[#008080]">
      {/* Minimize/Expand Button */}
      <button
        onClick={() => setOverlayMinimized((v) => !v)}
        className="win95-raised win95-focus fixed top-4 right-4 z-[60] w-8 h-7 text-black text-base leading-none"
        aria-label={overlayMinimized ? "Expand" : "Minimize"}
      >
        {overlayMinimized ? "+" : "−"}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-x-0 top-0 bottom-10 flex items-center justify-center transition-all duration-500 ease-in-out
    ${
      overlayMinimized
        ? "opacity-0 pointer-events-none"
        : "opacity-100 pointer-events-auto"
    }`}
        style={{ zIndex: 50 }}
      >
        <div
          className="w-full h-[95%] overflow-y-auto p-3 md:w-[95vw] md:p-6 lg:p-8
      scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <RestoreWindows
            icon="home"
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5 md:min-h-full md:auto-rows-fr md:grid-flow-dense"
          >
            {/* Me Card */}
            <Window
              title="About Me"
              className="col-span-1 row-span-1 max-md:-order-2"
              bodyClassName="flex flex-col justify-between"
            >
              <div>
                <h1 className="text-5xl md:text-6xl">renzo</h1>
                <p className="font-code text-xs md:text-sm text-[#404040]">
                  Information Systems | Software Engineer
                </p>

                {/* Education */}
                <p className="mt-2 text-sm leading-snug">
                  BSIS, 3rd year · Dean&apos;s Lister
                </p>
                <p className="text-sm leading-snug text-[#404040]">
                  De La Salle-College of Saint Benilde
                </p>
              </div>

              {/* Socials + résumé */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Link
                  href="https://www.linkedin.com/in/jed-lawrence-engbino-629997372/"
                  target="_blank"
                >
                  <Image
                    src="/assets/icons/LinkedIn.png"
                    width={24}
                    height={24}
                    alt="LinkedIn Icon"
                    className="pointer-events-none"
                  />
                </Link>
                <Link href="https://www.instagram.com/jlrebn/" target="_blank">
                  <Image
                    src="/assets/icons/Instagram.png"
                    width={24}
                    height={24}
                    alt="Instagram Icon"
                    className="pointer-events-none"
                  />
                </Link>
                <Link
                  href="https://discord.com/users/472141998565097472"
                  target="_blank"
                >
                  <Image
                    src="/assets/icons/Disc.png"
                    width={24}
                    height={24}
                    alt="Discord Icon"
                    className="pointer-events-none"
                  />
                </Link>
                <Link
                  href="https://www.facebook.com/jelo.binz/"
                  target="_blank"
                >
                  <Image
                    src="/assets/icons/Facebook.png"
                    width={24}
                    height={24}
                    alt="Facebook Icon"
                    className="pointer-events-none"
                  />
                </Link>

                <a
                  href="/Jed-Lawrence-Engbino-Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win95-raised win95-focus ml-auto px-4 py-1 text-sm"
                >
                  Résumé
                </a>
              </div>
            </Window>

            {/* GitHub Card — spans 2 cols on md+ */}
            <Window
              title={
                <Link
                  href="https://github.com/renzoboyy"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <Image
                    src="/assets/icons/GitHub.png"
                    width={16}
                    height={16}
                    alt="GitHub Icon"
                  />
                  GitHub
                </Link>
              }
              className="col-span-1 md:col-span-2 row-span-1"
              bodyClassName="flex flex-col"
            >
              {/* Calendar fills the window on md+ and scrolls horizontally */}
              <div className="win95-sunken bg-white p-3 overflow-x-auto w-full relative flex-1 min-h-0">
                <GithubCalendar fit />
              </div>
            </Window>

            {/* Skills Card — col span 2, row span 2 */}
            <Window
              title="Skills"
              className="col-span-1 md:col-span-2 row-span-2"
              bodyClassName="flex flex-col gap-1.5 md:gap-2"
            >
              <SkillsGrid skills={skills} />
            </Window>

            {/* Projects Card — links to the full /projects page */}
            <Window
              title="Projects"
              className="col-span-1 row-span-1"
              bodyClassName="flex flex-col"
            >
              <Link
                href="/projects"
                onClick={openProjects}
                className="win95-sunken win95-focus relative block flex-1 aspect-video md:aspect-auto bg-[#00cc99]"
              >
                <Image
                  src="/assets/ViewMyProjects.png"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                  alt="View my projects"
                  className="object-contain p-3"
                />
                <span aria-hidden className="click-me-badge font-win">
                  Click me!
                </span>
              </Link>
            </Window>

            {/* Contact Card — col span 1 */}
            <Window
              title="Contact Me"
              className="col-span-1 row-span-1"
              bodyClassName="flex flex-col gap-3 overflow-hidden"
            >
              <div className="flex flex-col gap-2 min-h-0 overflow-hidden flex-1">
                {[
                  {
                    icon: "✉️",
                    label: "Email",
                    value: "jedlawrence.engbino@gmail.com",
                    href: "mailto:jedlawrence.engbino@gmail.com",
                  },
                  {
                    icon: "📱",
                    label: "Phone",
                    value: "+63 945 971 8300",
                    href: "tel:+639459718300",
                  },
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="win95-sunken flex items-center gap-3 bg-white p-3 hover:bg-[#000080] hover:text-white group flex-1 min-h-0"
                  >
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-[#606060] group-hover:text-white/80">
                        {item.label}
                      </p>
                      <p className="font-code text-sm truncate">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </Window>

            {/* Availability: what an employer needs to know first. Right
                after About Me on phones; beside Contact Me on desktop. */}
            <Window
              title="Availability"
              className="col-span-1 row-span-1 max-md:-order-1"
              bodyClassName="flex flex-col gap-2"
            >
              <p className="flex items-center gap-2 text-lg leading-tight">
                <span
                  aria-hidden="true"
                  className="win95-sunken inline-block w-3.5 h-3.5 shrink-0 bg-[#00c000]"
                />
                <span className="font-bold">Available now</span>
              </p>

              <dl className="win95-sunken bg-white flex-1 grid grid-cols-[auto_1fr] content-center gap-x-3 gap-y-1.5 p-2.5 text-sm leading-snug">
                {[
                  ["Seeking", "IS, database & full-stack internships"],
                  ["Setup", "Hybrid or remote"],
                  ["Hours", "Flexible: full- or part-time"],
                  ["Location", "Metro Manila"],
                ].map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-[#404040]">{label}:</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <a
                href="mailto:jedlawrence.engbino@gmail.com?subject=Internship%20opportunity"
                className="retro-button self-end shrink-0 px-4 py-1 text-sm"
              >
                Hire me
              </a>
            </Window>
          </RestoreWindows>
        </div>
      </div>

      <Taskbar current="home" />
    </main>
  );
}
