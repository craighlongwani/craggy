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

// A project's write-up inside its window, in the site's monochrome Linux
// look: flat panels, dim secondary text, and the demo video in full color
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
      <p className="lx-dim text-center text-[10px] md:text-xs uppercase tracking-widest">
        {project.event}
      </p>

      {/* Title */}
      <h1 className="mt-2 text-center text-lg md:text-2xl font-bold">
        {project.name}: {project.summary}
      </h1>

      {/* Role */}
      <p className="lx-dim text-center text-sm">{project.role}</p>

      {/* Demo video, framed */}
      <div className="lx-box mt-5 bg-black p-[2px]">
        <video
          src={project.video.src}
          autoPlay
          muted
          loop
          playsInline
          aria-label={project.video.label}
          className="block h-auto w-full"
        />
      </div>

      {/* Description + highlights: stacked on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row mt-5 gap-4 items-start">
        <div className="flex-1 space-y-3 text-sm md:text-base">
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
          <li key={step} className="lx-box p-3">
            <p className="lx-dim text-xs">
              {i + 1}. {step}
            </p>
            <p className="mt-1 text-sm">{text}</p>
          </li>
        ))}
      </ol>

      {/* Tech stack */}
      <ul className="mt-5 flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <li key={tech} className="lx-box px-2.5 py-0.5 text-xs">
            {tech}
          </li>
        ))}
      </ul>

      {/* Closing statement */}
      <p className="mt-5 text-sm md:text-base">{project.closing}</p>

      {/* Source code */}
      <div className="text-right mt-5">
        {"href" in project.source ? (
          <Link
            href={project.source.href}
            target="_blank"
            className="lx-btn"
          >
            {project.source.label}
          </Link>
        ) : (
          <p className="lx-dim text-sm">{project.source.note}</p>
        )}
      </div>
    </ProjectWindow>
  );
}
