"use client";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import GithubCalendar from "./components/GithubCalendar";
import Window from "./components/Window";
import { useState } from "react";

export default function HomeClient() {
  const [overlayMinimized, setOverlayMinimized] = useState(false);

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
        className={`fixed inset-0 flex items-center justify-center transition-all duration-500 ease-in-out
    ${
      overlayMinimized
        ? "opacity-0 pointer-events-none"
        : "opacity-100 pointer-events-auto"
    }`}
        style={{ zIndex: 50 }}
      >
        <div
          className="w-full h-[95vh] overflow-y-auto p-3 md:w-[95vw] md:p-6 lg:p-8
      scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5 md:min-h-full md:auto-rows-fr md:grid-flow-dense">
            {/* Me Card */}
            <Window
              title="About Me"
              className="col-span-1 row-span-1"
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
            >
              {/* Calendar scrolls horizontally on small screens */}
              <div className="win95-sunken bg-white p-3 overflow-x-auto w-full">
                <GithubCalendar />
              </div>
            </Window>

            {/* Skills Card — col span 2, row span 2 */}
            <Window
              title="Skills"
              className="col-span-1 md:col-span-2 row-span-2"
              bodyClassName="flex flex-col"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
                {[
                  {
                    title: "Web Development",
                    description:
                      "React, Next.js, Tailwind — building responsive, modern interfaces from scratch.",
                  },
                  {
                    title: "Database Management",
                    description:
                      "SQL & NoSQL databases; schema design, queries, and basic normalization.",
                  },
                  {
                    title: "Data Analysis",
                    description:
                      "Python (pandas, NumPy), Excel, and basic visualization with Matplotlib or Seaborn.",
                  },
                  {
                    title: "Systems Analysis & Design",
                    description:
                      "Use-case modeling, ERDs, DFDs, and systems documentation.",
                  },
                  {
                    title: "Version Control",
                    description:
                      "Git workflows — branching, pull requests, and collaborative development on GitHub.",
                  },
                  {
                    title: "Business Process Modeling",
                    description:
                      "Mapping and optimizing workflows using BPMN and process flow diagrams.",
                  },
                ].map((skill, idx) => (
                  <div
                    key={idx}
                    className="win95-sunken bg-white p-3 md:p-4 flex flex-col justify-between"
                  >
                    <h3 className="text-base mb-2">{skill.title}</h3>
                    <p className="text-sm text-[#404040] leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            </Window>

            {/* Projects Card — links to the full /projects page */}
            <Window
              title="Projects"
              className="col-span-1 row-span-1"
              bodyClassName="flex flex-col"
            >
              <Link
                href="/projects"
                className="win95-sunken win95-focus relative block flex-1 aspect-video md:aspect-auto bg-[#00cc99]"
              >
                <Image
                  src="/assets/ViewMyProjects.png"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                  alt="View my projects"
                  className="object-contain p-3"
                />
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

              <p className="text-xs text-[#404040] shrink-0">
                Open to IS, database & full-stack internships
              </p>
            </Window>
          </div>
        </div>
      </div>
    </main>
  );
}
