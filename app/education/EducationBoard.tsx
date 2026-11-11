import Window from "../components/Window";
import { schools } from "./data";

// The education board: degree details first, followed by course modules
// grouped by subject area for easier scanning at every screen size.
export default function EducationBoard() {
  return (
    <div className="mx-auto max-w-6xl p-3 md:p-4">
      <h2 className="mb-4 flex items-baseline gap-3 md:mb-5">
        <span className="lx-dim text-[11px]">§ 03</span>
        <span className="text-lg font-bold md:text-xl">~/education</span>
      </h2>

      <div className="flex flex-col gap-4 md:gap-5">
        {schools.map((school) => {
          const moduleCount = school.courseGroups.reduce(
            (total, group) => total + group.courses.length,
            0,
          );

          return (
            <div key={school.name} className="flex flex-col gap-5">
              <Window
                title={`${school.name.toLowerCase()}/academic-record`}
                bodyClassName="p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="lx-dim mb-1 text-[11px]">Bachelor&apos;s degree</p>
                    <h3 className="text-base font-bold leading-snug sm:text-lg">
                      {school.degree}
                    </h3>
                    <p className="lx-dim mt-1 text-[12px]">{school.name}</p>
                  </div>
                  <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-1 text-[12px] sm:min-w-56">
                    <dt className="lx-dim">period</dt>
                    <dd>{school.period}</dd>
                    <dt className="lx-dim">location</dt>
                    <dd>{school.where}</dd>
                  </dl>
                </div>
              </Window>

              <section aria-labelledby={`${school.name}-modules`}>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div>
                    <h3
                      id={`${school.name}-modules`}
                      className="text-sm font-bold sm:text-base"
                    >
                      Course modules
                    </h3>
                    <p className="lx-dim mt-0.5 text-[11px]">
                      Grouped by subject area
                    </p>
                  </div>
                  <span className="lx-dim text-[11px]">
                    {moduleCount} modules
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {school.courseGroups.map((group) => (
                    <Window
                      key={group.name}
                      title={group.name.toLowerCase().replaceAll(" ", "-")}
                      bodyClassName="p-3 sm:p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="text-[13px] font-bold">{group.name}</h4>
                        <span className="lx-dim shrink-0 text-[10px]">
                          {group.courses.length} modules
                        </span>
                      </div>
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {group.courses.map((course) => (
                          <li
                            key={course}
                            className="lx-box min-w-0 break-words px-2.5 py-2 text-[11px] leading-relaxed sm:text-[12px]"
                          >
                            {course}
                          </li>
                        ))}
                      </ul>
                    </Window>
                  ))}
                </div>
              </section>

              {/* <Window
                title="optional-certifications"
                bodyClassName="p-3 sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold">
                      Optional certification vouchers
                    </h3>
                    <p className="lx-dim mt-0.5 text-[11px]">
                      Certification options listed in the academic plan
                    </p>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {school.optionalCertifications.map((certification) => (
                      <li
                        key={certification}
                        className="lx-box px-2.5 py-1.5 text-[11px] sm:text-[12px]"
                      >
                        {certification}
                      </li>
                    ))}
                  </ul>
                </div>
              </Window> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
