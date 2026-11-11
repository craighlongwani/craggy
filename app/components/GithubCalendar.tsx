import type { Contributions } from "../lib/github";

// The GitHub window's contribution calendar, laid out like a terminal's
// text grid: one square per day, weeks as columns and weekdays as rows, like
// GitHub's own. A day's square gets bigger and brighter with how much was
// committed (levels 0 to 4, colored with --lx-cal-1 to --lx-cal-4, so the
// palette and theme recolor it in place). The data comes from GitHub's API,
// fetched on the server (lib/github.ts).
//
// Everything is worked out in UTC from the dates themselves, so the server and
// the browser draw exactly the same thing (no hydration mismatch, and no
// waiting for client code). The stylesheet (.lx-heat in globals.css) sizes the
// text to fill the box; when even the smallest size is too wide, the oldest
// weeks (the left) are cropped.

const LEVELS = [0, 1, 2, 3, 4];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// GitHub's rows run Sunday to Saturday; label Mon, Wed and Fri
const WEEKDAYS = ["", "M", "", "W", "", "F", ""];

type Day = Contributions["days"][number];

function utc(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

function label(day: Day) {
  const d = utc(day.date);
  const when = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  const what = day.count === 1 ? "1 contribution" : `${day.count} contributions`;
  return `${what} on ${when}`;
}

// Weeks as columns of 7 (null where the year starts or ends midweek), and
// each month's name over the first week it starts in
function layout(days: Day[]) {
  const offset = days.length ? utc(days[0].date).getUTCDay() : 0;
  const weeks: (Day | null)[][] = [];
  days.forEach((day, i) => {
    const slot = i + offset;
    const week = (weeks[Math.floor(slot / 7)] ??= Array(7).fill(null));
    week[slot % 7] = day;
  });

  // Two characters per week (the day and a space)
  const months = Array<string>(weeks.length * 2).fill(" ");
  let free = 0;
  let last = -1;
  weeks.forEach((week, w) => {
    const first = week.find(Boolean);
    if (!first) return;
    const month = utc(first.date).getUTCMonth();
    if (month === last) return;
    last = month;
    const at = w * 2;
    // Skip a name that would run into the one before it (a partial first week)
    if (at < free) return;
    MONTHS[month].split("").forEach((c, n) => (months[at + n] = c));
    free = at + 4;
  });
  return { weeks, months: months.join("") };
}

function stats(days: Day[]) {
  let longest = 0;
  let run = 0;
  const byMonth = new Map<string, number>();
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
    const key = day.date.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + day.count);
  }
  let busiest = "";
  let most = 0;
  for (const [key, count] of byMonth) {
    if (count > most) {
      most = count;
      busiest = MONTHS[Number(key.slice(5)) - 1];
    }
  }
  return { longest, busiest };
}

function Unavailable() {
  return (
    <div className="text-[12px] leading-[1.5]">
      <p>fatal: unable to load contributions for &apos;github.com/craighlongwani&apos;</p>
      <a href="https://github.com/craighlongwani" target="_blank" rel="noreferrer" className="lx-link">
        view on github ↗
      </a>
    </div>
  );
}

export default function GithubCalendar({
  contributions,
}: {
  contributions: Contributions | null;
}) {
  if (!contributions || !contributions.days.length) return <Unavailable />;
  const { weeks, months } = layout(contributions.days);
  const { longest, busiest } = stats(contributions.days);

  return (
    <div className="lx-heat">
      <div className="lx-heat-grid" aria-hidden="true">
        {/* Weekday labels, outside the cropped part */}
        <div className="lx-dim">
          <div>{" "}</div>
          {WEEKDAYS.map((d, i) => (
            <div key={i}>{d || " "}</div>
          ))}
        </div>
        <div className="lx-heat-cells">
          <div>
            <div className="lx-dim">{months}</div>
            {WEEKDAYS.map((_, row) => (
              <div key={row}>
                {weeks.map((week, w) => {
                  const day = week[row];
                  if (!day) return <span key={w} className="lx-heat-cell" />;
                  return (
                    <span
                      key={w}
                      className={`lx-heat-cell lx-heat-${day.level}`}
                      title={label(day)}
                    >
                      <span />
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lx-heat-stats">
        <p>
          {/* "in the last year": the window's git log --since says so */}
          {contributions.total} contributions
          <span className="lx-dim">
            {" "}· longest streak {longest}d{busiest && ` · busiest ${busiest}`}
          </span>
        </p>
        <p className="lx-heat-legend lx-dim" aria-hidden="true">
          less{" "}
          {LEVELS.map((i) => (
            <span key={i} className={`lx-heat-cell lx-heat-${i}`}>
              <span />
            </span>
          ))}{" "}
          more
        </p>
      </div>
    </div>
  );
}
