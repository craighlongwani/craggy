"use client";
import Link from "next/link";
import type { MouseEvent } from "react";
import { closeProject, openProjectNow } from "../../lib/project";
import Clock from "./Clock";
import { jumpToBoard, useActiveBoard, type BoardId } from "./boards";
import LinksMenu from "./LinksMenu";
import PaletteToggle from "./PaletteToggle";
import ThemeToggle from "./ThemeToggle";

// The boards, numbered like tiling-WM workspaces
const workspaces: { id: BoardId; href: string }[] = [
  { id: "home", href: "/" },
  { id: "projects", href: "/#projects" },
  { id: "education", href: "/#education" },
];

// The bar along the bottom: the shell prompt, a button per board, the links
// dropdown, the palette/theme toggles and the clock. A board button scrolls
// to that board (closing an open project first) and the one on screen is
// highlighted.
export default function Header() {
  const board = useActiveBoard();

  const open = (e: MouseEvent<HTMLAnchorElement>, target: BoardId) => {
    // Modified clicks (new tab, etc.) keep the link's normal behavior
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    if (openProjectNow()) closeProject(() => jumpToBoard(target));
    else jumpToBoard(target);
  };

  return (
    <header className="lx-nav fixed inset-x-0 bottom-0 z-[70] flex h-10 items-center gap-2 border-t px-3 md:gap-3">
      <p className="whitespace-nowrap font-bold">
        <span className="lx-typed">
          jed@craggy:~<span aria-hidden="true">$</span>
        </span>{" "}
        <span aria-hidden="true" className="lx-cursor" />
      </p>

      <nav aria-label="Primary" className="flex items-center gap-1.5">
        {workspaces.map((item, i) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={(e) => open(e, item.id)}
            aria-current={item.id === board ? "page" : undefined}
            aria-label={item.id}
            title={item.id}
            className="lx-btn"
          >
            [{i + 1}]
            <span className="hidden sm:inline">&nbsp;{item.id}</span>
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
