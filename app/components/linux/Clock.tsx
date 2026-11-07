"use client";
import { useEffect, useState } from "react";

// 24-hour local time. Renders a placeholder on the server, then ticks on the
// client so the markup never mismatches during hydration.
export default function Clock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
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
