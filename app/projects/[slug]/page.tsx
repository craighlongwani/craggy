import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectWindow from "../../components/ProjectWindow";
import { getProject, projects } from "../data";

// One page per entry in data.ts, prerendered; any other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.name} · Jed Lawrence Engbino`,
    description: `${project.name}: ${project.summary}`,
  };
}

// A project's write-up inside its window, in the desktop's Win95 look: gray
// window, black serif text, sunken white panels and raised chips
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <ProjectWindow slug={project.slug} title={project.name}>
      {/* Event label */}
      <p className="text-center font-code text-[10px] md:text-xs uppercase tracking-widest text-[#404040]">
        {project.event}
      </p>

      {/* Title */}
      <h1 className="mt-2 text-center text-lg md:text-2xl font-bold">
        {project.name}: {project.summary}
      </h1>

      {/* Role */}
      <p className="text-center text-sm text-[#404040]">{project.role}</p>

      {/* Demo video, set into a sunken frame */}
      <div className="win95-sunken bg-black p-[2px] mt-5">
        <video
          src={project.video.src}
          autoPlay
          muted
          loop
          playsInline
          aria-label={project.video.label}
          className="block w-full h-auto"
        />
      </div>

      {/* Description + highlights: stacked on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row mt-5 gap-4 items-start">
        <div className="flex-1 space-y-3 text-justify text-sm md:text-base">
          {project.description.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>

        <ul className="flex-1 list-none space-y-2 text-sm md:text-base">
          {project.highlights.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="shrink-0">
                ■
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps / key features */}
      <h2 className="mt-6 text-sm md:text-base font-bold">
        {project.steps.heading}
      </h2>
      <ol className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {project.steps.items.map(({ step, text }, i) => (
          <li key={step} className="win95-sunken bg-white p-3">
            <p className="font-code text-xs text-[#404040]">
              {i + 1}. {step}
            </p>
            <p className="mt-1 text-sm">{text}</p>
          </li>
        ))}
      </ol>

      {/* Tech stack */}
      <ul className="mt-5 flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <li key={tech} className="win95-raised px-3 py-1 text-xs">
            {tech}
          </li>
        ))}
      </ul>

      {/* Closing statement */}
      <p className="mt-5 text-justify text-sm md:text-base">
        {project.closing}
      </p>

      {/* Source code */}
      <div className="text-right mt-5">
        {"href" in project.source ? (
          <Link
            href={project.source.href}
            target="_blank"
            className="retro-button px-4 py-1 text-sm"
          >
            {project.source.label}
          </Link>
        ) : (
          <p className="text-sm text-[#404040]">{project.source.note}</p>
        )}
      </div>
    </ProjectWindow>
  );
}
