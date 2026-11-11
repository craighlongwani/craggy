"use client";
import { useSyncExternalStore } from "react";

// BS Information Systems began in January 2025 (month index 0)
const SINCE = { year: 2025, month: 1 };
const SINCE_LABEL = "since Jan 2025";

// Whole months since then, written out ("2 years, 2 months")
function elapsed() {
  const now = new Date();
  const months =
    (now.getFullYear() - SINCE.year) * 12 + (now.getMonth() - SINCE.month);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (rest > 0) parts.push(`${rest} ${rest === 1 ? "month" : "months"}`);
  return parts.join(", ");
}

// The total only changes monthly, so there is nothing to subscribe to
const subscribe = () => () => {};

// neofetch's "Uptime" line: how long I've been at it. The server renders just
// the start date and the client adds the running total, so the markup matches
// during hydration.
export default function Uptime() {
  const total = useSyncExternalStore(subscribe, elapsed, () => "");

  return (
    <>
      {total && `${total} · `}
      <span className="lx-dim">{SINCE_LABEL}</span>
    </>
  );
}
