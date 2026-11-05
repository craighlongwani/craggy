"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { minimizeAndGo, type TaskbarIcon } from "../lib/anchor";

// 16×16 pixel art, one character per pixel; "." is transparent
const palette: Record<string, string> = {
  k: "#000",
  r: "#c00000",
  w: "#fff",
  b: "#00a0ff",
  d: "#8b5a2b",
  g: "#808080",
  s: "#505050",
};

const house = [
  "................",
  ".......kk.......",
  "......krrk......",
  ".....krrrrk.....",
  "....krrrrrrk....",
  "...krrrrrrrrk...",
  "..krrrrrrrrrrk..",
  ".kkkkkkkkkkkkkk.",
  "..kwwwwwwwwwwk..",
  "..kwkkkwwwwwwk..",
  "..kwkbkwkkkkwk..",
  "..kwkkkwkddkwk..",
  "..kwwwwwkddkwk..",
  "..kwwwwwkddkwk..",
  "..kkkkkkkkkkkk..",
  "................",
];

// Clipboard with a gear badge over its bottom-right corner
const clipboard = [
  "......kkkk......",
  "..kkkkggggkkkk..",
  "..kddkkkkkkddk..",
  "..kdwwwwwwwwdk..",
  "..kdwkkkkkkwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwkkkkkwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwkkkkwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kddddddddddk..",
  "..kkkkkkkkkkkk..",
];

const gear = [
  ".s.s.s.",
  "sssssss",
  ".ss.ss.",
  "ss...ss",
  ".ss.ss.",
  "sssssss",
  ".s.s.s.",
];

function withOverlay(base: string[], overlay: string[], x: number, y: number) {
  return base.map((row, r) => {
    const over = overlay[r - y];
    if (!over) return row;
    return Array.from(row, (c, col) => {
      const o = over[col - x];
      return o && o !== "." ? o : c;
    }).join("");
  });
}

const icons: Record<TaskbarIcon, string[]> = {
  home: house,
  projects: withOverlay(clipboard, gear, 9, 9),
};

function PixelIcon({ rows }: { rows: string[] }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={24}
      height={24}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {rows.flatMap((row, y) =>
        Array.from(row, (c, x) =>
          c === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={palette[c]} />
          )
        )
      )}
    </svg>
  );
}

const items: { icon: TaskbarIcon; label: string; href: string }[] = [
  { icon: "home", label: "Home", href: "/" },
  { icon: "projects", label: "Projects", href: "/projects" },
];

// Win95 taskbar along the bottom with the page icons centered. Switching
// pages minimizes the current page's windows into its own icon first.
export default function Taskbar({ current }: { current: TaskbarIcon }) {
  const router = useRouter();

  const open = (e: MouseEvent<HTMLAnchorElement>, href: string, target: TaskbarIcon) => {
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
      aria-label="Taskbar"
      className="win95-taskbar fixed inset-x-0 bottom-0 z-[70] h-10 flex items-center justify-center gap-1"
    >
      {items.map((item) => {
        const active = item.icon === current;
        return (
          <Link
            key={item.icon}
            href={item.href}
            data-taskbar-icon={item.icon}
            onClick={(e) => open(e, item.href, item.icon)}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            title={item.label}
            className={`win95-focus w-11 h-8 flex items-center justify-center ${
              active ? "win95-taskbar-active" : "win95-raised"
            }`}
          >
            <PixelIcon rows={icons[item.icon]} />
          </Link>
        );
      })}
    </nav>
  );
}
