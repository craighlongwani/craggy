"use client";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { openProject, warmProject } from "../lib/project";

// A link that opens a project's window over the page (ProjectView). It's a
// real link to /#projects/<slug>, so modified clicks (new tab, etc.) and
// crawlers still get somewhere. Used by the cards' "open ↗" and ~/status.
export default function ProjectLink({
  slug,
  className,
  label,
  children,
}: {
  slug: string;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    openProject(slug);
  };

  return (
    <Link
      href={`/#projects/${slug}`}
      onClick={open}
      onPointerEnter={() => warmProject(slug)}
      onFocus={() => warmProject(slug)}
      aria-label={label}
      className={className}
    >
      {children}
    </Link>
  );
}
