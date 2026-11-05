"use client";
import Image from "next/image";
import { useState } from "react";
import SkillWindow, { type Skill } from "./SkillWindow";

// The Skills window's contents: the card grid, the status bar naming the
// card under the pointer, and the pop-up each card opens. Its hover and
// pop-up state live here, so pointing at cards re-renders only this window,
// not the whole home page (the GitHub calendar in particular).
export default function SkillsGrid({ skills }: { skills: Skill[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  // The last skill opened stays mounted in the pop-up between opens, so
  // closing doesn't tear its contents down and reopening is cheap
  const [shown, setShown] = useState<{
    skill: Skill;
    origin: HTMLElement;
    open: boolean;
  } | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
        {skills.map((skill) => (
          <button
            key={skill.title}
            type="button"
            onClick={(e) =>
              setShown({ skill, origin: e.currentTarget, open: true })
            }
            onMouseEnter={() => setHovered(skill.title)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(skill.title)}
            onBlur={() => setHovered(null)}
            aria-haspopup="dialog"
            className="win95-raised win95-focus pixel-hand group relative min-h-28 md:min-h-0"
            style={{ background: skill.color }}
          >
            {/* Raised like a push button; pressing sinks the bevel and
                nudges the art down-right */}
            <Image
              src={skill.image}
              fill
              sizes="(min-width: 768px) 15vw, 50vw"
              alt={skill.title}
              className="object-contain p-2 group-active:translate-x-px group-active:translate-y-px"
            />
          </button>
        ))}
      </div>

      {/* Status bar: names the card under the pointer */}
      <p className="win95-statusbar shrink-0 px-2 py-0.5 text-xs md:text-sm truncate">
        {hovered ? `${hovered} — click to open` : "Click a skill to read more"}
      </p>

      <SkillWindow
        skill={shown?.skill ?? null}
        origin={shown?.origin ?? null}
        open={shown?.open ?? false}
        onClose={() => setShown((s) => (s ? { ...s, open: false } : s))}
      />
    </>
  );
}
