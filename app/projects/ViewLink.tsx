"use client";
import Link from "next/link";
import type { MouseEvent } from "react";
import { openProject } from "../lib/project";

// A project window's View button: the window itself grows into the project's
// write-up, over the page (ProjectView)
export default function ViewLink({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    // Modified clicks (new tab, etc.) keep the link's normal behavior
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    openProject(slug, e.currentTarget.closest<HTMLElement>(".win95-window"));
  };

  return (
    <Link
      href={`/#projects/${slug}`}
      onClick={open}
      aria-label={`View ${name}`}
      className="lx-btn shrink-0"
    >
      View
    </Link>
  );
}
