"use client";
import { useEffect, useId, useRef, useState } from "react";
import { links } from "./links";

// The header's "links" dropdown. Open it with a click; Escape, a click
// outside, tabbing away, or picking a link closes it.
export default function LinksMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      // Anchored under its button from 768px up; on phones the panel hangs
      // from the header's right edge instead, so it can't run off-screen
      className="md:relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="lx-btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        links
        <span aria-hidden="true" className="ml-1.5">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <ul
          id={panelId}
          className="lx-menu absolute right-3 top-full z-10 mt-1 w-44 md:left-0 md:right-auto"
        >
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                onClick={() => setOpen(false)}
                className="lx-menu-item"
              >
                <span>{link.label}</span>
                {link.external && (
                  <span aria-hidden="true" className="lx-dim">
                    ↗
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
