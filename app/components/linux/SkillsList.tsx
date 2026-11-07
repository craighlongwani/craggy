"use client";
import { useState } from "react";
import SkillWindow, { type Skill } from "../SkillWindow";

// Width of the write-up window that a skill opens
const WINDOW_WIDTH = 460;

// The Skills window's contents: a compact list, one cell per skill, each
// opening its write-up. Open state lives here, so opening one re-renders
// only this window, not the whole home page.
export default function SkillsList({ skills }: { skills: Skill[] }) {
  // The last skill opened stays mounted in the pop-up between opens, so
  // closing doesn't tear its contents down and reopening is cheap
  const [shown, setShown] = useState<{ skill: Skill; open: boolean } | null>(
    null,
  );

  return (
    <>
      <p className="lx-dim">
        <span aria-hidden="true">$ </span>ls skills/
      </p>

      <ul className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 min-[560px]:grid-cols-2 min-[560px]:grid-rows-3">
        {skills.map((skill) => (
          <li key={skill.title} className="min-h-0">
            <button
              type="button"
              onClick={() => setShown({ skill, open: true })}
              aria-haspopup="dialog"
              className="lx-row lx-box flex h-full flex-col items-start justify-center"
            >
              <span className="block max-w-full truncate text-[12px] font-bold">
                <span aria-hidden="true" className="lx-dim">
                  ▸{" "}
                </span>
                {skill.title}
              </span>
              <span className="lx-dim block max-w-full truncate text-[12px]">
                {skill.description}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <SkillWindow
        skill={shown?.skill ?? null}
        origin={null}
        width={WINDOW_WIDTH}
        open={shown?.open ?? false}
        onClose={() => setShown((s) => (s ? { ...s, open: false } : s))}
      />
    </>
  );
}
