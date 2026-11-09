import OpenWindows from "../components/OpenWindows";
import Window from "../components/Window";
import ProjectLink from "../projects/ProjectLink";
import { schools } from "./data";

// The education board: one window per school, like a transcript queried as
// data. A school's coursework (relevant to a full-stack/database career;
// general education, PE, NSTP and electives outside that line are left off)
// shows as a tag cloud underneath it, joined to the project a course
// produced where one exists.
export default function EducationBoard() {
  return (
    <div className="p-3 md:p-4">
      <h2 className="mb-3 flex items-baseline gap-3 md:mb-4">
        <span className="lx-dim text-[11px]">§ 03</span>
        <span className="text-lg font-bold md:text-xl">~/education</span>
      </h2>

      <OpenWindows
        onView
        className="grid grid-cols-1 gap-3 md:mx-auto md:w-[calc(80%+0.2rem)] md:grid-cols-2 md:gap-4"
      >
        {schools.map((s, i) => (
          <Window
            key={s.name}
            title="transcript.sql"
            className="h-full"
            bodyClassName="flex flex-col gap-4"
          >
            <p className="lx-dim lx-prompt">
              <span aria-hidden="true">$ </span>SELECT * FROM schools WHERE id ={" "}
              {i + 1};
            </p>
            <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-[12px] leading-[1.45]">
              <dt className="lx-dim">school</dt>
              <dd className="font-bold">{s.name}</dd>
              <dt className="lx-dim">degree</dt>
              <dd>
                {s.degree}
                {s.detail && ` · ${s.detail}`}
              </dd>
              {s.honors?.map((h) => (
                <div className="contents" key={h}>
                  <dt className="lx-dim">honors</dt>
                  <dd>{h}</dd>
                </div>
              ))}
              {s.period && (
                <>
                  <dt className="lx-dim">period</dt>
                  <dd>{s.period}</dd>
                </>
              )}
              <dt className="lx-dim">where</dt>
              <dd>{s.where}</dd>
            </dl>

            {s.courses && (
              <div>
                <p className="lx-dim mb-1.5 flex items-center gap-2 text-[10px]">
                  <span>coursework</span>
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {s.courses.map((c) => {
                    const chip = "lx-box px-2 py-0.5 text-[12px] leading-[1.4]";
                    if (c.project) {
                      return (
                        <li key={c.name}>
                          <ProjectLink
                            slug={c.project}
                            label={`See the ${c.project} project`}
                            className={`${chip} lx-link`}
                          >
                            {c.name} →
                          </ProjectLink>
                        </li>
                      );
                    }
                    return (
                      <li key={c.name} className={chip}>
                        {c.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Window>
        ))}
      </OpenWindows>
    </div>
  );
}
