"use client";
import { useEffect, useRef } from "react";

const FRAME_MS = 1000 / 30;
const NEAR_PX = 140;
const GO_PX = 64;
const STOP_PX = 44;
const SPEED = 130;
const AWAY_MS = 6000;
const IDLE_MS = 15000;
const WAKE_MS = 450;
const POUNCE_MS = 350;
const COLUMNS = 15;
const ROWS = 8;
const SLEEP_SIGNALS = ["z", "z z", "Z z", " z"];

type Mode = "sleep" | "wake" | "idle" | "walk" | "pounce" | "home";

const DIRECTIONS: [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

function center(line: string) {
  const padding = Math.max(0, COLUMNS - line.length);
  return `${" ".repeat(Math.floor(padding / 2))}${line}${" ".repeat(Math.ceil(padding / 2))}`;
}

function drawRobot(mode: Mode, look: [number, number], blink: boolean, now: number) {
  const awake = mode !== "sleep" && mode !== "home";
  const sleepSignal = SLEEP_SIGNALS[Math.floor(now / 850) % SLEEP_SIGNALS.length];
  const sensor = !awake || blink
    ? "-"
    : mode === "pounce"
      ? "*"
      : look[0] < 0
        ? "<"
        : look[0] > 0
          ? ">"
          : look[1] < 0
            ? "^"
            : look[1] > 0
              ? "v"
              : "o";
  const signal =
    mode === "sleep"
      ? sleepSignal
      : mode === "wake"
        ? "!"
        : mode === "pounce"
          ? "*"
          : "o";

  return [
    center(`   ${signal}   `),
    " .-----------. ",
    "/             \\",
    "| .---------. |",
    center(`| | ${sensor} ${sensor} | |`),
    "| '---------' |",
    "\\             /",
    " '-----------' ",
  ].join("\n");
}

export default function Robot() {
  const boxRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLPreElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const robot = robotRef.current;
    const bubbleNode = bubbleRef.current;
    if (!box || !robot || !bubbleNode) return;

    let boxW = 0;
    let boxH = 0;
    let spriteW = 0;
    let spriteH = 0;
    let mode: Mode = "sleep";
    let modeAt = 0;
    const pos = { x: 0, y: 0 };
    let pointer: { x: number; y: number; at: number } | null = null;
    let lastNear = -Infinity;
    let poked = false;
    let bubbleUntil = 0;
    let lastBubble = -Infinity;
    let nextBlink = 0;
    let blinkUntil = 0;
    let look: [number, number] = [0, 0];
    let raf = 0;
    let last = 0;
    let prev = 0;
    let visible = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const home = () => ({
      x: (boxW - spriteW) / 2,
      y: Math.max(0, boxH - spriteH - 12),
    });

    const setMode = (next: Mode, now: number) => {
      mode = next;
      modeAt = now;
      robot.style.transform =
        next === "sleep" ? "rotate(-2deg)" : next === "pounce" ? "scale(1.04)" : "";
    };

    const say = (text: string, now: number) => {
      if (now - lastBubble < 1500) return;
      lastBubble = now;
      bubbleNode.textContent = text;
      bubbleNode.style.opacity = "1";
      bubbleUntil = now + 900;
    };

    const render = (now: number) => {
      robot.dataset.mode = mode;
      robot.style.left = `${pos.x}px`;
      robot.style.top = `${pos.y}px`;
      robot.style.width = `${spriteW}px`;
      robot.style.height = `${spriteH}px`;
      robot.style.opacity = "1";
      const blink = mode !== "sleep" && mode !== "home" && now < blinkUntil;
      robot.textContent = drawRobot(mode, look, blink, now);
      if (bubbleUntil && now >= bubbleUntil) {
        bubbleNode.style.opacity = "0";
        bubbleUntil = 0;
      }
    };

    const measure = () => {
      boxW = box.clientWidth;
      boxH = box.clientHeight;
      if (!boxW || !boxH) {
        spriteW = spriteH = 0;
        return;
      }
      const style = window.getComputedStyle(robot);
      const fontSize = Number.parseFloat(style.fontSize);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const charWidth = fontSize * 0.61;
      spriteW = Math.min(COLUMNS * charWidth, boxW * 0.62, 118);
      spriteH = Math.min(ROWS * lineHeight, boxH * 0.92);
      if (mode === "sleep") Object.assign(pos, home());
      pos.x = Math.max(0, Math.min(boxW - spriteW, pos.x));
      pos.y = Math.max(0, Math.min(Math.max(0, boxH - spriteH - 12), pos.y));
      render(performance.now());
    };

    const moveToward = (tx: number, ty: number, dt: number) => {
      const dx = tx - (pos.x + spriteW / 2);
      const dy = ty - (pos.y + spriteH / 2);
      const distance = Math.hypot(dx, dy);
      const step = Math.min(distance, SPEED * dt);
      if (distance > 0) {
        pos.x += (dx / distance) * step;
        pos.y += (dy / distance) * step;
      }
      pos.x = Math.max(0, Math.min(boxW - spriteW, pos.x));
      pos.y = Math.max(0, Math.min(Math.max(0, boxH - spriteH - 12), pos.y));
      return distance;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      const dt = Math.min(0.1, (now - (prev || now)) / 1000);
      prev = now;
      last = now;
      if (!spriteW) return;

      const rect = box.getBoundingClientRect();
      let distance = Infinity;
      let pointerX = 0;
      let pointerY = 0;
      if (pointer && now - pointer.at < IDLE_MS) {
        pointerX = pointer.x - rect.left;
        pointerY = pointer.y - rect.top;
        distance = Math.hypot(
          Math.max(rect.left - pointer.x, 0, pointer.x - rect.right),
          Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom),
        );
      }
      const inside = distance === 0;
      const near = distance <= NEAR_PX;
      if (near) lastNear = now;
      const away = !near && now - lastNear > AWAY_MS;
      const toPointer = Math.hypot(
        pointerX - (pos.x + spriteW / 2),
        pointerY - (pos.y + spriteH / 2),
      );

      switch (mode) {
        case "sleep":
          if (near || poked) setMode("wake", now);
          break;
        case "wake":
          if (now - modeAt > WAKE_MS) setMode("idle", now);
          break;
        case "idle":
          if (away) setMode("home", now);
          else if (inside && toPointer > GO_PX) setMode("walk", now);
          break;
        case "walk":
          if (away) setMode("home", now);
          else if (!inside) setMode("idle", now);
          else if (moveToward(pointerX, pointerY, dt) < STOP_PX) {
            setMode("pounce", now);
            say("ONLINE", now);
          }
          break;
        case "pounce":
          if (now - modeAt > POUNCE_MS) setMode("idle", now);
          break;
        case "home": {
          const target = home();
          if (near) setMode("idle", now);
          else if (
            moveToward(target.x + spriteW / 2, target.y + spriteH / 2, dt) < 2
          ) {
            Object.assign(pos, target);
            setMode("sleep", now);
          }
          break;
        }
      }

      if (poked) {
        if (mode !== "sleep" && mode !== "wake") say("ONLINE", now);
        poked = false;
      }

      const awake = mode !== "sleep" && mode !== "home";
      if (awake && pointer && now - pointer.at < IDLE_MS) {
        const dx = pointer.x - (rect.left + pos.x + spriteW / 2);
        const dy = pointer.y - (rect.top + pos.y + spriteH * 0.48);
        if (Math.hypot(dx, dy) < 28) look = [0, 0];
        else {
          const direction =
            (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
          look = DIRECTIONS[direction];
        }
      } else look = [0, 0];

      if (awake && now > nextBlink) {
        blinkUntil = now + 120;
        nextBlink = now + 3000 + Math.random() * 3000;
      }
      render(now);
    };

    const run = () => {
      cancelAnimationFrame(raf);
      prev = 0;
      if (visible && !still && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY, at: performance.now() };
    };
    const onLeave = () => {
      pointer = null;
    };
    const onPoke = () => {
      poked = true;
      if (mode === "sleep") setMode("wake", performance.now());
    };

    const resize = new ResizeObserver(measure);
    resize.observe(box);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    seen.observe(box);
    document.addEventListener("visibilitychange", run);
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      box.addEventListener("pointerdown", onPoke);
    }
    measure();

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      seen.disconnect();
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointerdown", onPoke);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative min-h-32 flex-1 select-none overflow-hidden"
      aria-label="An animated text robot"
    >
      <pre
        ref={robotRef}
        aria-hidden="true"
        className="lx-robot pointer-events-none absolute m-0 overflow-visible text-center text-[11px] leading-[1.15] text-[var(--lx-fg)]"
        style={{ fontFamily: "inherit", whiteSpace: "pre" }}
      />
      <span
        ref={bubbleRef}
        className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-[var(--lx-dim)] transition-opacity"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
