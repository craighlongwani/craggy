import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Window from "../components/Window";
import { projects } from "./data";

export const metadata: Metadata = {
  title: "Projects · Jed Lawrence Engbino",
  description: "Projects by Jed Lawrence Engbino, each with its own write-up.",
};

// Every project in its own window; each window opens that project's page.
export default function Projects() {
  return (
    <main className="min-h-screen w-full font-win bg-[#008080] p-3 md:p-6 lg:p-8">
      <h1 className="sr-only">Projects</h1>

      <Link
        href="/"
        className="win95-raised win95-focus inline-block px-4 py-1 mb-3 md:mb-4 text-sm text-black"
      >
        ← Home
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
        {projects.map((project) => (
          <Window key={project.slug} title={project.name}>
            <Link
              href={`/projects/${project.slug}`}
              className="win95-focus group flex flex-col gap-2 h-full"
            >
              <div className="win95-sunken relative aspect-square bg-white">
                <Image
                  src={project.logo}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  alt={project.name}
                  className="object-cover p-[2px]"
                />
              </div>
              <div className="px-1 pb-1">
                <p className="font-code text-[10px] uppercase tracking-widest text-[#404040]">
                  {project.event}
                </p>
                <p className="mt-1 text-sm leading-snug group-hover:underline">
                  {project.summary}
                </p>
              </div>
            </Link>
          </Window>
        ))}
      </div>
    </main>
  );
}
