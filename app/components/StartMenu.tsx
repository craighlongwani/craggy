"use client";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import PixelIcon, { icons, type IconName } from "./PixelIcon";
import { minimizeAndGo, type TaskbarIcon } from "../lib/anchor";
import { scrollToWindow } from "../lib/windowScroll";
import { projects } from "../projects/data";

// One row in the Start menu. Every row is also a command-palette result, so
// keeping the label, group and a few search synonyms here is all the search
// index needs.
type Action = {
  id: string;
  label: string;
  group: string;
  icon: IconName;
  keywords?: string;
  run: () => void;
};

const projectLinks = projects.map(({ slug, name }) => ({ slug, name }));

// Focus the Start button by its DOM marker rather than through a ref. The
// menu's action closures are read during render, and React's compiler treats
// closures that capture refs as ref-like, so keeping refs out of them keeps
// the actions safe to search and render.
function focusStartButton() {
  requestAnimationFrame(() => {
    document.querySelector<HTMLButtonElement>("[data-start-button]")?.focus();
  });
}

// Substring first, then a loose subsequence match ("skl" finds "Skills")
function matches(haystack: string, needle: string) {
  if (!needle) return true;
  const hay = haystack.toLowerCase();
  if (hay.includes(needle)) return true;
  let i = 0;
  for (const c of hay) {
    if (c === needle[i]) i += 1;
    if (i === needle.length) return true;
  }
  return false;
}

// The Win95 Start button, plus a searchable Start menu standing in for a
// command palette: every page, section, project and link is a result you can
// arrow through and open with Enter. Ctrl/Cmd+K toggles it from anywhere.
export default function StartMenu({ current }: { current: TaskbarIcon }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [shutdown, setShutdown] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const menuId = `start-menu-${uid}`;
  const listId = `${menuId}-listbox`;

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    setQuery("");
    if (restoreFocus) focusStartButton();
  }, []);

  // Every open starts from a clean search, with the first result selected
  const openMenu = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  // Ctrl/Cmd+K opens and closes the menu from anywhere on the desktop
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      if (e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      if (shutdown) return;
      if (open) closeMenu(true);
      else openMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, open, openMenu, shutdown]);

  // Put the caret in the search box whenever the menu opens
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // A click anywhere outside the Start button / menu closes it
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // The shutdown screen traps attention until you boot back up
  useEffect(() => {
    if (!shutdown) return;
    const frame = requestAnimationFrame(() => restartRef.current?.focus());
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setShutdown(false);
      focusStartButton();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [shutdown]);

  const actions = useMemo<Action[]>(() => {
    const goPage = (href: string) => {
      closeMenu(true);
      // A project detail page is still "projects" for the taskbar animation,
      // but its path isn't /projects, so compare paths rather than icons
      if (pathname === href) return;
      minimizeAndGo(current, () => router.push(href));
    };

    const goSection = (id: string) => {
      closeMenu(true);
      if (current === "home") {
        if (scrollToWindow(id)) history.replaceState(null, "", `#${id}`);
        return;
      }
      minimizeAndGo(current, () => router.push(`/#${id}`));
    };

    const goProject = (slug: string) => {
      closeMenu(true);
      router.push(`/projects/${slug}`);
    };

    const openTab = (href: string) => {
      closeMenu(true);
      window.open(href, "_blank", "noopener,noreferrer");
    };

    const sendMail = () => {
      closeMenu(true);
      window.location.href = "mailto:jedlawrence.engbino@gmail.com";
    };

    return [
      {
        id: "page-home",
        label: "Home",
        group: "Programs",
        icon: "home",
        keywords: "desktop main start",
        run: () => goPage("/"),
      },
      {
        id: "page-projects",
        label: "Projects",
        group: "Programs",
        icon: "projects",
        keywords: "portfolio work explorer",
        run: () => goPage("/projects"),
      },

      {
        id: "jump-about",
        label: "About Me",
        group: "Jump to",
        icon: "person",
        keywords: "profile bio renzo education",
        run: () => goSection("about"),
      },
      {
        id: "jump-github",
        label: "GitHub",
        group: "Jump to",
        icon: "branch",
        keywords: "contributions calendar commits",
        run: () => goSection("github"),
      },
      {
        id: "jump-skills",
        label: "Skills",
        group: "Jump to",
        icon: "gear",
        keywords: "stack technologies what i know",
        run: () => goSection("skills"),
      },
      {
        id: "jump-projects",
        label: "Projects window",
        group: "Jump to",
        icon: "folder",
        keywords: "portfolio work",
        run: () => goSection("projects"),
      },
      {
        id: "jump-contact",
        label: "Contact Me",
        group: "Jump to",
        icon: "mail",
        keywords: "email phone reach",
        run: () => goSection("contact"),
      },
      {
        id: "jump-availability",
        label: "Availability",
        group: "Jump to",
        icon: "clock",
        keywords: "hire internship status available",
        run: () => goSection("availability"),
      },

      ...projectLinks.map<Action>(({ slug, name }) => ({
        id: `project-${slug}`,
        label: name,
        group: "Project Files",
        icon: "folder",
        keywords: `${slug} case study`,
        run: () => goProject(slug),
      })),

      {
        id: "elsewhere-github",
        label: "GitHub profile",
        group: "Elsewhere",
        icon: "branch",
        keywords: "source code repositories renzoboyy",
        run: () => openTab("https://github.com/renzoboyy"),
      },
      {
        id: "elsewhere-linkedin",
        label: "LinkedIn",
        group: "Elsewhere",
        icon: "person",
        keywords: "work history professional network",
        run: () =>
          openTab("https://www.linkedin.com/in/jed-lawrence-engbino-629997372/"),
      },
      {
        id: "elsewhere-email",
        label: "Email",
        group: "Elsewhere",
        icon: "mail",
        keywords: "contact mail message",
        run: sendMail,
      },
      {
        id: "elsewhere-resume",
        label: "Résumé",
        group: "Elsewhere",
        icon: "document",
        keywords: "cv resume pdf hire",
        run: () => openTab("/Jed-Lawrence-Engbino-Resume.pdf"),
      },

      {
        id: "system-shutdown",
        label: "Shut Down...",
        group: "System",
        icon: "power",
        keywords: "power off restart exit sleep",
        run: () => {
          closeMenu();
          setShutdown(true);
        },
      },
    ];
  }, [closeMenu, current, pathname, router]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found: Action[] = [];
    for (const action of actions) {
      const haystack = `${action.label} ${action.keywords ?? ""} ${action.group}`;
      if (matches(haystack, q)) found.push(action);
    }
    return found;
  }, [actions, query]);

  const grouped = useMemo(() => {
    const groups: { name: string; items: { action: Action; index: number }[] }[] =
      [];
    visible.forEach((action, index) => {
      const last = groups[groups.length - 1];
      if (!last || last.name !== action.group) {
        groups.push({ name: action.group, items: [{ action, index }] });
      } else {
        last.items.push({ action, index });
      }
    });
    return groups;
  }, [visible]);

  // Clamp on read instead of in an effect, so a shrinking result list can't
  // briefly point the active descendant at a row that no longer exists
  const activeIndex = visible.length ? Math.min(active, visible.length - 1) : 0;

  // Arrow keys scroll the highlighted row into view inside the menu
  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu(true);
      return;
    }
    if (visible.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIndex + 1) % visible.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIndex - 1 + visible.length) % visible.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(visible.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      visible[activeIndex]?.run();
    }
  };

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        data-start-button
        type="button"
        title="Start menu (Ctrl+K)"
        aria-keyshortcuts="Control+K Meta+K"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) closeMenu(true);
          else openMenu();
        }}
        className={`win95-focus flex h-8 items-center gap-1.5 px-2 font-win text-sm font-bold text-black ${
          open ? "win95-pressed" : "win95-raised"
        }`}
      >
        <PixelIcon rows={icons.windows} size={18} />
        <span>Start</span>
      </button>

      {open && (
        <div
          id={menuId}
          role="dialog"
          aria-label="Start menu"
          onKeyDown={onMenuKeyDown}
          className="start-menu win95-window fixed bottom-10 left-1 z-[80] flex max-h-[calc(100dvh-5rem)] w-[min(94vw,22rem)] p-[3px] text-black"
        >
          <div aria-hidden className="start-menu-banner shrink-0">
            Renzo 95
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="win95-sunken m-1 flex h-7 shrink-0 items-center gap-1 bg-white px-1 focus-within:outline focus-within:outline-1 focus-within:outline-dotted focus-within:outline-black">
              <PixelIcon
                rows={icons.search}
                size={16}
                className="shrink-0 opacity-70"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search..."
                aria-label="Search the Start menu"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={
                  visible.length ? `${listId}-option-${activeIndex}` : undefined
                }
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent font-win text-sm text-black outline-none placeholder:text-[#808080]"
              />
            </div>

            <div
              id={listId}
              role="listbox"
              aria-label="Start menu items"
              className="min-h-0 flex-1 overflow-y-auto px-1 pb-1"
            >
              {grouped.length === 0 ? (
                <p className="px-2 py-6 text-center font-win text-sm text-[#404040]">
                  No matching items.
                </p>
              ) : (
                grouped.map((group, gi) => (
                  <div key={group.name} role="group" aria-label={group.name}>
                    {gi > 0 && (
                      <div
                        role="presentation"
                        className="win95-etched mx-1 my-1"
                      />
                    )}
                    <p
                      role="presentation"
                      className="px-2 pt-1 pb-0.5 font-code text-[9px] uppercase tracking-[0.2em] text-[#404040]"
                    >
                      {group.name}
                    </p>
                    {group.items.map(({ action, index }) => (
                      <button
                        key={action.id}
                        ref={(el) => {
                          optionRefs.current[index] = el;
                        }}
                        type="button"
                        role="option"
                        id={`${listId}-option-${index}`}
                        aria-selected={index === activeIndex}
                        tabIndex={-1}
                        title={action.label}
                        onPointerEnter={() => setActive(index)}
                        onClick={action.run}
                        className={`flex w-full items-center gap-2 px-2 py-1.5 text-left font-win text-sm ${
                          index === activeIndex
                            ? "bg-[#000080] text-white"
                            : "text-black"
                        }`}
                      >
                        <PixelIcon
                          rows={icons[action.icon]}
                          size={20}
                          className="shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div role="presentation" className="win95-etched mx-1" />
            <p className="px-2 py-1 font-code text-[9px] uppercase tracking-widest text-[#505050]">
              ↑↓ move · ↵ open · esc close
            </p>
          </div>
        </div>
      )}

      {shutdown && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${menuId}-shutdown`}
          className="shutdown-screen fixed inset-0 z-[90] grid place-items-center p-6 text-center"
        >
          <div className="max-w-md">
            <p
              id={`${menuId}-shutdown`}
              className="font-win text-2xl leading-snug md:text-4xl"
            >
              It&apos;s now safe to turn off your computer.
            </p>
            <div aria-hidden className="mx-auto my-6 h-px w-40 bg-black/40" />
            <button
              ref={restartRef}
              type="button"
              onClick={() => {
                setShutdown(false);
                focusStartButton();
              }}
              className="win95-raised win95-focus px-6 py-1.5 font-win text-sm text-black"
            >
              Restart
            </button>
            <p className="mt-4 font-code text-[10px] uppercase tracking-widest text-black/60">
              Press Esc or Restart to boot back up
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
