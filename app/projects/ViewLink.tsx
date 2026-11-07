"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { expandAndGo } from "../lib/curtain";

// A project window's View button: closes the other windows like a curtain and
// grows its own window into the project page
export default function ViewLink({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const router = useRouter();
  const href = `/projects/${slug}`;

  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    // Modified clicks (new tab, etc.) keep the link's normal behavior
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const win = e.currentTarget.closest<HTMLElement>(".win95-window");
    if (!win) return;
    e.preventDefault();
    expandAndGo(win, () => router.push(href));
  };

  return (
    <Link
      href={href}
      onClick={open}
      aria-label={`View ${name}`}
      className="lx-btn shrink-0"
    >
      View
    </Link>
  );
}
