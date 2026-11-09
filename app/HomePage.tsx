import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Boards, { Board } from "./components/Boards";
import GithubCalendar from "./components/GithubCalendar";
import HashSync from "./components/HashSync";
import OpenWindows from "./components/OpenWindows";
import ProjectView from "./components/ProjectView";
import Window from "./components/Window";
import Cat from "./components/linux/Cat";
import Header from "./components/linux/Header";
import ResumeButton from "./components/linux/ResumeButton";
import SkillsLoop from "./components/linux/SkillsLoop";
import Status from "./components/linux/Status";
import Uptime from "./components/linux/Uptime";
import { stack } from "./components/linux/stack";
import EducationBoard from "./education/EducationBoard";
import type { Contributions } from "./lib/github";
import ProjectsBoard from "./projects/ProjectsBoard";

// neofetch's color blocks in the Gruvbox Material palette: the soft colors,
// then the deeper ones, shown as two rows of eight
const ramp = [
  "#45403d", "#ea6962", "#e78a4e", "#d8a657",
  "#a9b665", "#89b482", "#7daea3", "#d3869b",
  "#928374", "#c14a4a", "#c35e0a", "#b47109",
  "#6c782e", "#4c7a5d", "#45707a", "#945e80",
];

// The home page, rendered on the server: only its interactive pieces (the
// footer, windows opening, the cat, links that open projects, the project
// window, HashSync) run in the browser.
export default function HomePage({
  projectViews,
  contributions,
}: {
  // Each project's write-up, rendered on the server
  projectViews: { slug: string; title: string; content: ReactNode }[];
  // The GitHub calendar, fetched on the server (null if unavailable)
  contributions: Contributions | null;
}) {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <HashSync />
      <Header />

      {/* From 1024px the windows tile the screen exactly: 4 columns by 3 rows.
          About is 2x2; Projects and Skills are 2x1 on the right; GitHub is 2x1
          and Contact 1x1 along the bottom. Below that they stack (two columns
          from 768px) and this area scrolls. */}
      <Boards>
        <Board id="home">
        <div className="p-3 md:p-4 lg:h-full">
          <OpenWindows
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:h-full lg:grid-cols-4 lg:grid-rows-3 lg:gap-4"
          >
            {/* About: neofetch's output (portrait, facts and a color
                gradient), then a short bio and the tech stack as chips. The neofetch
                part keeps its size; the bio and stack scroll inside the
                window only when they don't fit. The prompts and the
                decoration only show where there's room for them. */}
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
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold leading-tight tracking-tight @lg:text-xl shorter:text-base shorter:@lg:text-base">
                          Jed Lawrence Engbino (renz)
                        </h1>
                        <div className="flex shrink-0 gap-1.5">
                          <ResumeButton />
                          <a 
                          className="lx-btn shrink-0"
                          href="https://github.com/renzoboyy"
                          target="_blank" 
                          rel="noreferrer">
                            github ↗
                          </a>
                        </div>
                      </div>
                      <hr className="lx-rule mt-1.5 shorter:mt-1" />
                    </div>

                    <dl className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-[12px] leading-[1.45] shorter:gap-y-0.5">
                      <dt className="lx-dim">role</dt>
                      <dd>Full-stack &amp; Database</dd>
                      <dt className="lx-dim">school</dt>
                      <dd>De La Salle – College of Saint Benilde</dd>
                      <dt className="lx-dim">study</dt>
                      <dd>Information Systems, 3rd year · Dean&apos;s Lister</dd>
                      <dt className="lx-dim">uptime</dt>
                      <dd>
                        <Uptime />
                      </dd>
                      <dt className="lx-dim">based</dt>
                      <dd>Manila, Philippines | Jeddah, Saudi Arabia</dd>
                      <dt className="lx-dim">speaks</dt>
                      <dd>English, Tagalog</dd>
                      <dt className="lx-dim">seeking</dt>
                      <dd>
                        IS / software engineering internships · Metro Manila /
                        remote
                      </dd>
                    </dl>

                    {/* neofetch's color blocks, in the gruvbox palette, over two rows */}
                    <div aria-hidden="true" className="lx-ramp mt-auto pt-1 shorter:hidden">
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
                    systems end to end. Led Revora, a verified-onboarding system
                    with its rules and security inside SQL Server, and the
                    backend and AI integration for VerifAI.
                  </p>

                  <p className="lx-dim lx-prompt mb-1 mt-2">
                    <span aria-hidden="true">$ </span>cat stack.txt
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {stack.map((tool) => (
                      <li
                        key={tool}
                        className="lx-box px-2 py-0.5 text-[12px] leading-[1.4]"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Window>

            {/* The right half, top to bottom: skills; cat.c and contact
                side by side; status (in source order, GitHub fills the
                bottom-left cell before status) */}

            {/* Skills: a for loop over the skills, each with its proof */}
            <Window
              id="skills"
              title="~/skills"
              className="md:col-span-2"
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <SkillsLoop />
            </Window>

            {/* Decoration: a sleeping ASCII cat that wakes, watches and
                stalks the pointer (desktop and tablet) */}
            <Window
              id="cat"
              title="cat.c"
              className="max-md:hidden"
              bodyClassName="flex flex-col overflow-hidden"
            >
              <Cat />
            </Window>

            {/* Contact */}
            <Window
              id="contact"
              title="contact.txt"
              className="md:col-span-1"
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
                    <a href="tel:+639498253671" className="lx-link">
                      +63 949 825 3671
                    </a>
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="lx-dim">linkedin</dt>
                  <dd className="truncate">
                    <a href="https://www.linkedin.com/in/renzoboyy/" className="lx-link" target="_blank">
                      in/renzoboyy
                    </a>
                  </dd>
                </div>
              </dl>
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
                <GithubCalendar contributions={contributions} />
              </div>
            </Window>

            {/* Status: availability, who the work was for, and a strength
                per project with proof (the projects themselves are the
                next board) */}
            <Window
              id="status"
              title="~/status"
              className="md:col-span-2"
              bodyClassName="flex flex-col overflow-hidden"
            >
              <Status />
            </Window>
          </OpenWindows>
        </div>
        </Board>
        <Board id="projects" long>
          <ProjectsBoard />
        </Board>
        <Board id="education" long>
          <EducationBoard />
        </Board>
      </Boards>
      <ProjectView projects={projectViews} />
    </main>
  );
}
