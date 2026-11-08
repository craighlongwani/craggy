"use client";
import { useEffect, useState } from "react";

// 24-hour local time. Renders a placeholder on the server, then ticks on the
// client so the markup never mismatches during hydration. It shows hours and
// minutes, so it updates once a minute, on the minute (not every second).
export default function Clock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const date = new Date();
      setNow(date);
      timer = window.setTimeout(tick, 60_000 - (date.getTime() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const time = now
    ? now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
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
    <time title={full} className={`tabular-nums ${className}`}>
      {time}
    </time>
  );
}
