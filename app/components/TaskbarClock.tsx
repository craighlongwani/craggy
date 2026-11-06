"use client";
import { useEffect, useState } from "react";

// Win95 tray clock. Renders a placeholder on the server, then ticks once a
// second on the client so the markup never mismatches during hydration.
export default function TaskbarClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const time = now
    ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "--:--";
  const full = now
    ? now.toLocaleString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      title={full}
      className="win95-sunken flex h-8 items-center px-2 font-win text-xs text-black tabular-nums"
    >
      {time}
    </div>
  );
}
