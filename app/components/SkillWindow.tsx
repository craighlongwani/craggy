"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export type Skill = {
  title: string;
  image: string;
  color: string;
  description: string;
  highlights: string[];
  usedIn: string[];
};

// Window width relative to the skill card that opened it
const WIDTH_OF_CARD = 1.625;
// Small screens make tiny grid cards, so give the window a readable floor there
const MOBILE_MIN_WIDTH = 338;

// Width from the card that was clicked, so the window scales with the grid
function windowWidth(card: HTMLElement | null) {
  const cardWidth = card?.getBoundingClientRect().width ?? 160;
  const width = cardWidth * WIDTH_OF_CARD;
  return window.innerWidth < 768
    ? Math.max(width, Math.min(MOBILE_MIN_WIDTH, window.innerWidth - 32))
    : Math.min(width, window.innerWidth - 32);
}

// Pop the window up in the middle of the screen, with focus on OK (the
// scrolling text would take it otherwise)
function openWindow(dialog: HTMLDialogElement, card: HTMLElement | null) {
  dialog.style.width = `${windowWidth(card)}px`;
  dialog.showModal();
  dialog
    .querySelector<HTMLElement>("[data-ok]")
    ?.focus({ preventScroll: true });
}

// A skill's full write-up in a classic Win95 pop-up: it appears instantly in
// the middle of the screen, and OK or the title bar's × closes it. Built on
// <dialog> so focus trapping and the top layer come from the browser;
// Escape and clicking outside the window also close it.
export default function SkillWindow({
  skill,
  origin,
  open,
  onClose,
}: {
  // The last skill opened; it stays rendered while closed, so reopening
  // doesn't rebuild the window
  skill: Skill | null;
  origin: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !skill || !open || dialog.open) return;
    openWindow(dialog, origin);
  }, [skill, origin, open]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="skill-window win95-window m-auto max-h-[calc(100dvh-2rem)] flex-col open:flex"
      aria-labelledby="skill-window-title"
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {skill && (
        <>
          <div className="win95-titlebar flex items-center gap-2 shrink-0">
            <h2
              id="skill-window-title"
              className="font-win text-sm md:text-base leading-tight flex-1 min-w-0"
            >
              {skill.title}
            </h2>
            {/* Title bar close button */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="win95-raised shrink-0 w-4 h-3.5 md:w-[18px] md:h-4 grid place-items-center text-black text-xs leading-none font-bold"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col min-h-0 p-1.5 md:p-2">
            <div
              className="h-20 shrink-0 relative win95-sunken"
              style={{ background: skill.color }}
            >
              <Image
                src={skill.image}
                fill
                loading="eager"
                sizes="260px"
                alt=""
                className="object-contain p-1"
              />
            </div>

            {/* Sized to its text; scrolls only if the screen is too short */}
            <div className="win95-sunken bg-white mt-1.5 min-h-0 overflow-y-auto p-2 md:p-2.5 text-sm leading-snug">
              <p>{skill.description}</p>
              <ul className="mt-2 space-y-1.5">
                {skill.highlights.map((h) => (
                  <li key={h} className="flex gap-1.5">
                    <span aria-hidden="true">■</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <hr className="win95-etched my-2" />
              <p>
                <span className="text-[#404040]">Used in: </span>
                {skill.usedIn.join(", ")}
              </p>
            </div>

            <div className="flex justify-center pt-2 shrink-0">
              <button
                type="button"
                data-ok
                onClick={close}
                className="win95-raised win95-focus px-6 py-0.5 text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
