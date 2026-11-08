"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { curtainAndGo, type Page } from "../../lib/curtain";
import Clock from "./Clock";
import { jumpToBoard, useActiveBoard } from "./boards";
import LinksMenu from "./LinksMenu";
import PaletteToggle from "./PaletteToggle";
import ThemeToggle from "./ThemeToggle";

// The pages, numbered like tiling-WM workspaces
const workspaces: { icon: Page; label: string; href: string }[] = [
  { icon: "home", label: "home", href: "/" },
  { icon: "projects", label: "projects", href: "/#projects" },
];

// A slim bar across the top: the shell prompt, a button per page, the links
// dropdown, and the clock. Switching pages closes the current page's
// windows like a curtain first.
export default function Header({ current }: { current: Page }) {
  const router = useRouter();
  const pathname = usePathname();
  const board = useActiveBoard();
  // On the home page the pages are boards of one scroll, so the footer
  // scrolls to them and highlights the one on screen
  const onHome = pathname === "/";
  const shown = onHome ? board : current;

  const open = (
    e: MouseEvent<HTMLAnchorElement>,
    href: string,
    target: Page,
  ) => {
    // Modified clicks (new tab, etc.) keep the link's normal behavior
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    if (onHome) {
      jumpToBoard(target);
      return;
    }
    curtainAndGo(() => router.push(href));
  };

  return (
    <header className="lx-nav fixed inset-x-0 bottom-0 z-[70] flex h-10 items-center gap-2 border-t px-3 md:gap-3">
      <p className="whitespace-nowrap font-bold">
        <span className="lx-typed">
          jed@renzo:~<span aria-hidden="true">$</span>
        </span>{" "}
        <span aria-hidden="true" className="lx-cursor" />
      </p>

      <nav aria-label="Primary" className="flex items-center gap-1.5">
        {workspaces.map((item, i) => (
          <Link
            key={item.icon}
            href={item.href}
            onClick={(e) => open(e, item.href, item.icon)}
            aria-current={item.icon === shown ? "page" : undefined}
            aria-label={item.label}
            title={item.label}
            className="lx-btn"
          >
            [{i + 1}]
            <span className="hidden sm:inline">&nbsp;{item.label}</span>
          </Link>
        ))}
        <LinksMenu />
      </nav>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <PaletteToggle />
        <ThemeToggle />
        <Clock className="lx-dim hidden sm:block" />
      </div>
    </header>
  );
}
