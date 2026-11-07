import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/linux/Header";
import OpenWindows from "../components/OpenWindows";
import Window from "../components/Window";
import { projects } from "./data";
import ViewLink from "./ViewLink";

export const metadata: Metadata = {
  title: "Projects · Jed Lawrence Engbino",
  description: "Projects by Jed Lawrence Engbino, each with its own write-up.",
};

// Every project in its own window, laid out as a bento grid like the home
// page; each window's View button opens that project's page. The windows open
// their curtains one by one.
export default function Projects() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <h1 className="sr-only">Projects</h1>
      <Header current="projects" />

      {/* The bento area: below the header, with the page's margins as padding
          (projectWindowRect reads them) */}
      <div
        data-bento
        className="h-full overflow-y-auto p-3 pt-[3.25rem] md:p-4 md:pt-14"
      >
        <OpenWindows
          always
          className="grid grid-cols-1 gap-3 md:min-h-full md:auto-rows-fr md:grid-cols-3 md:gap-4 lg:grid-cols-4"
        >
          {projects.map((project) => (
            <Window
              key={project.slug}
              project={project.slug}
              title={project.name}
              className={project.span}
              bodyClassName="flex flex-col gap-2 overflow-hidden"
            >
              <div className="lx-portrait relative min-h-48 flex-1 md:min-h-0">
                <Image
                  src={project.logo}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  alt={project.name}
                  className="object-contain p-3"
                />
              </div>

              <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  <p className="lx-dim text-[10px] uppercase tracking-widest">
                    {project.event}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug">
                    {project.summary}
                  </p>
                </div>
                <ViewLink slug={project.slug} name={project.name} />
              </div>
            </Window>
          ))}
        </OpenWindows>
      </div>
    </main>
  );
}
