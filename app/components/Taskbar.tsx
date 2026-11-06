"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { minimizeAndGo, type TaskbarIcon } from "../lib/anchor";
import PixelIcon, { icons } from "./PixelIcon";
import StartMenu from "./StartMenu";
import TaskbarClock from "./TaskbarClock";

const items: { icon: TaskbarIcon; label: string; href: string }[] = [
  { icon: "home", label: "Home", href: "/" },
  { icon: "projects", label: "Projects", href: "/projects" },
];

// Win95 taskbar along the bottom: Start on the left, the page icons centered,
// and the tray clock on the right. Switching pages minimizes the current
// page's windows into its own icon first.
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
      className="win95-taskbar fixed inset-x-0 bottom-0 z-[70] h-10 flex items-center px-1"
    >
      <StartMenu current={current} />

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
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
      </div>

      <div className="ml-auto flex items-center">
        <TaskbarClock />
      </div>
    </nav>
  );
}
