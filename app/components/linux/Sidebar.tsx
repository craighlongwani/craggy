"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { minimizeAndGo, type TaskbarIcon } from "../../lib/anchor";
import Clock from "./Clock";
import { links } from "./links";

// The pages, numbered like tiling-WM workspaces
const workspaces: { icon: TaskbarIcon; label: string; href: string }[] = [
  { icon: "home", label: "home", href: "/" },
  { icon: "projects", label: "projects", href: "/projects" },
];

// Navigation: a left sidebar from 1280px up, a slim top bar below that. It's
// one element restyled with breakpoints, so each workspace link exists once
// and the window minimize/restore animation can aim at it.
export default function Sidebar({ current }: { current: TaskbarIcon }) {
  const router = useRouter();

  const open = (
    e: MouseEvent<HTMLAnchorElement>,
    href: string,
    target: TaskbarIcon,
  ) => {
    // Modified clicks (new tab, etc.) keep the link's normal behavior
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    if (target === current) return;
    minimizeAndGo(current, () => router.push(href));
  };

  return (
    <nav
      aria-label="Primary"
      className="lx-nav fixed inset-x-0 top-0 z-[70] flex h-10 items-center gap-4 border-b px-3 xl:inset-y-0 xl:right-auto xl:h-auto xl:w-52 xl:flex-col xl:items-stretch xl:gap-0 xl:border-b-0 xl:border-r xl:px-4 xl:py-5"
    >
      <p className="whitespace-nowrap font-bold">
        jed@renzo:~<span aria-hidden="true">$</span>{" "}
        <span aria-hidden="true" className="lx-cursor" />
      </p>

      <div className="flex items-center gap-1 xl:mt-8 xl:flex-col xl:items-stretch">
        <p className="lx-dim lx-label hidden xl:mb-1 xl:block">workspaces</p>
        {workspaces.map((item, i) => (
          <Link
            key={item.icon}
            href={item.href}
            data-taskbar-icon={item.icon}
            onClick={(e) => open(e, item.href, item.icon)}
            aria-current={item.icon === current ? "page" : undefined}
            className="lx-nav-item whitespace-nowrap"
          >
            [{i + 1}] {item.label}
          </Link>
        ))}
      </div>

      {/* Links: in the sidebar from 1280px, inline in the top bar from
          1024px, and in the About window below that */}
      <div className="hidden lg:block xl:mt-8">
        <p className="lx-dim lx-label mb-1 hidden xl:block">links</p>
        <ul className="flex gap-1 xl:block">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="lx-nav-item"
              >
                {link.label}
                {link.external && (
                  <span aria-hidden="true" className="lx-dim hidden xl:inline">
                    {" "}
                    ↗
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="ml-auto flex items-center gap-3 xl:ml-0 xl:mt-auto xl:flex-col xl:items-stretch xl:gap-2">
        <p className="lx-dim hidden xl:block">
          <span aria-hidden="true">● </span>seeking internships
        </p>
        <Clock className="lx-dim hidden sm:block xl:px-2" />
      </div>
    </nav>
  );
}
