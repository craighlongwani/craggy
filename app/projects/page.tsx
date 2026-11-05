import type { Metadata } from "next";
import Image from "next/image";
import RestoreWindows from "../components/RestoreWindows";
import Taskbar from "../components/Taskbar";
import Window from "../components/Window";
import { projects } from "./data";
import ViewLink from "./ViewLink";

export const metadata: Metadata = {
  title: "Projects · Jed Lawrence Engbino",
  description: "Projects by Jed Lawrence Engbino, each with its own write-up.",
};

// Every project in its own window, laid out as a bento grid like the home
// page; each window's View button opens that project's page. The windows open
// one by one out of the taskbar's projects icon.
export default function Projects() {
  return (
    <main className="relative w-full h-screen font-body bg-[#008080]">
      <h1 className="sr-only">Projects</h1>

      <div className="absolute inset-x-0 top-0 bottom-10 flex items-center justify-center">
        <div
          data-bento
          className="w-full h-[95%] overflow-y-auto p-3 md:w-[95vw] md:p-6 lg:p-8
            scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <RestoreWindows
            icon="projects"
            always
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5 md:min-h-full md:auto-rows-fr"
          >
            {projects.map((project) => (
              <Window
                key={project.slug}
                project={project.slug}
                title={project.name}
                className={project.span}
                bodyClassName="flex flex-col gap-2"
              >
                <div
                  className="win95-sunken relative flex-1 min-h-48"
                  style={{ background: project.logoBackground }}
                >
                  <Image
                    src={project.logo}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    alt={project.name}
                    className="object-contain p-[2px]"
                  />
                </div>

                <div className="flex items-end gap-3 px-1 pb-1">
                  <div className="min-w-0 flex-1">
                    <p className="font-code text-[10px] uppercase tracking-widest text-[#404040]">
                      {project.event}
                    </p>
                    <p className="mt-1 text-sm leading-snug">
                      {project.summary}
                    </p>
                  </div>
                  <ViewLink
                    slug={project.slug}
                    name={project.name}
                  />
                </div>
              </Window>
            ))}
          </RestoreWindows>
        </div>
      </div>

      <Taskbar current="projects" />
    </main>
  );
}
