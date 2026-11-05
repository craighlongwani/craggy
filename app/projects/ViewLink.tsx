"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { expandAndGo } from "../lib/anchor";

// A project window's View button: minimizes the other windows and grows its
// own window into the project page
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
      className="retro-button shrink-0 px-4 py-1 text-sm"
    >
      View
    </Link>
  );
}
