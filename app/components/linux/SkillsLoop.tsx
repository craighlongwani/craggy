import { skills } from "./skills";

// The Skills window's contents, written as the loop that prints them:
//   for skill in skills:
// Everything is on the page; nothing opens on click.
export default function SkillsLoop() {
  return (
    <>
      <p className="lx-dim lx-prompt">
        <span aria-hidden="true">$ </span>python skills.py
      </p>

      <p className="text-[12px]">
        <span className="lx-dim">for</span> skill{" "}
        <span className="lx-dim">in</span> skills
        <span className="lx-dim">:</span>
      </p>

      <ul
        className="lx-skills lx-scroll grid min-h-0 flex-1 grid-cols-1 gap-x-4 gap-y-0.5 overflow-y-auto border-l pl-3 min-[560px]:grid-cols-2 min-[560px]:grid-rows-[repeat(3,minmax(min-content,1fr))]"
        style={{ borderColor: "var(--lx-line)" }}
      >
        {skills.map((skill) => (
          <li key={skill.name} className="text-[12px] leading-[1.3]">
            <span className="block font-bold">
              <span aria-hidden="true" className="lx-dim">
                ▸{" "}
              </span>
              {skill.name}
            </span>
            <span className="lx-skill-proof block">{skill.proof}</span>
            <span className="lx-dim lx-skill-used block">
              <span aria-hidden="true"># </span>
              {skill.usedIn}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
