"use client";
import { useEffect, useRef } from "react";

// A cat in ASCII, asleep in its bed at the bottom of its window. When the
// pointer comes near the window it wakes (a "!"), its eyes follow the
// pointer in eight directions, and while the pointer is inside the window it
// stalks over to it
// and pounces ("mrrp!"). When the pointer has been away for a while it goes
// back to bed and falls asleep. Clicking it pokes it. It's text, drawn on a
// grid of character cells that fills the window, redrawn at ~30fps (only
// when something changed), paused whenever it's off screen or the tab is
// hidden, and drawn once, asleep, for reduced motion.
const FRAME_MS = 1000 / 30;
// How close (px) the pointer has to come to the window to wake it
const NEAR_PX = 140;
// It sets off after the pointer when farther than this from it (px), and
// stops and pounces when it gets this close
const GO_PX = 64;
const STOP_PX = 44;
// Walking speed, px per second: unhurried
const SPEED = 130;
// Back to bed after the pointer's been away this long, or hasn't moved for
// this long (ms)
const AWAY_MS = 6000;
const IDLE_MS = 15000;
const STEP_MS = 170;
const WAKE_MS = 450;
const POUNCE_MS = 350;

// The cat: four rows of seven characters. The eyes ("o o", inside the five
// characters of the head) slide across it to look left or right, and are
// drawn high ('), level (o) or low (.) to look up or down: eight directions
// and straight ahead. They shut to sleep or blink, and go wide to pounce.
const SPRITE_W = 7;
const SPRITE_H = 4;
const EARS = " /\\_/\\ ";
const BODY = " > ^ < ";
const PAWS = ['(")_(")', '/")_("\\'];
const SHUT = " - - ";
const WIDE = " O O ";
// Within this many px of the cat's face the pointer is straight ahead
const AHEAD_PX = 28;
// The eight directions as (across, down), in 45-degree steps clockwise from
// right (the screen's y points down)
const COMPASS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

// The eyes looking `across` (-1 left, 0 ahead, 1 right) and `down` (-1 up, 0
// level, 1 down)
function lookEyes(across: number, down: number) {
  const g = down < 0 ? "'" : down > 0 ? "." : "o";
  const left = across + 1;
  return " ".repeat(left) + g + " " + g + " ".repeat(2 - left);
}
const SNORES = ["z", "zZ", "zZz"];
const BED_W = 13;

type Mode = "sleep" | "wake" | "idle" | "walk" | "pounce" | "home";

export default function Cat() {
  const boxRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const pre = preRef.current;
    if (!box || !pre) return;
    // The grid of character cells that fills the box, and their size in px
    let cols = 0;
    let rows = 0;
    let charW = 0;
    let lineH = 0;
    let boxW = 0;
    let mode: Mode = "sleep";
    let modeAt = 0;
    // The cat's top-left corner, in px from the box's
    const pos = { x: 0, y: 0 };
    let pointer: { x: number; y: number; at: number } | null = null;
    let lastNear = -Infinity;
    let poked = false;
    let bubble: { text: string; until: number } | null = null;
    let lastBubble = -Infinity;
    let nextBlink = 0;
    let blinkUntil = 0;
    // Which way its eyes are looking (across, down), set each frame from the
    // pointer
    let look: [number, number] = [0, 0];
    let shown = "";
    let raf = 0;
    let last = 0;
    let prev = 0;
    let visible = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const spriteW = () => SPRITE_W * charW;
    const spriteH = () => SPRITE_H * lineH;
    // Its bed: the cat sits with its paws on the bottom row, centered
    const home = () => ({ x: (boxW - spriteW()) / 2, y: (rows - SPRITE_H) * lineH });

    const setMode = (m: Mode, now: number) => {
      mode = m;
      modeAt = now;
    };
    const say = (text: string, now: number, ms = 900) => {
      if (now - lastBubble < 1500) return;
      lastBubble = now;
      bubble = { text, until: now + ms };
    };

    // The scene as text
    const draw = (now: number) => {
      const grid = Array.from({ length: rows }, () => new Array<string>(cols).fill(" "));
      const put = (c: number, r: number, s: string) => {
        if (r < 0 || r >= rows) return;
        for (let k = 0; k < s.length; k++) {
          if (c + k >= 0 && c + k < cols) grid[r][c + k] = s[k];
        }
      };
      put(Math.round((cols - BED_W) / 2), rows - 1, `(${"_".repeat(BED_W - 2)})`);

      const c = Math.round(pos.x / charW);
      const r = Math.round(pos.y / lineH);
      const asleep = mode === "sleep";
      const eyes =
        asleep || now < blinkUntil ? SHUT : mode === "pounce" ? WIDE : lookEyes(look[0], look[1]);
      const walking = mode === "walk" || mode === "home";
      put(c, r, EARS);
      put(c, r + 1, `(${eyes})`);
      put(c, r + 2, BODY);
      put(c, r + 3, PAWS[walking ? Math.floor(now / STEP_MS) % 2 : 0]);

      if (asleep) put(c + 8, r, SNORES[Math.floor(now / 700) % SNORES.length]);
      else if (mode === "wake") put(c + 3, r - 1, "!");
      if (bubble && now < bubble.until && !asleep) put(c + 8, r + 1, bubble.text);
      return grid.map((row) => row.join("")).join("\n");
    };

    const measure = () => {
      const probe = document.createElement("span");
      probe.textContent = "M".repeat(10);
      pre.append(probe);
      charW = probe.getBoundingClientRect().width / 10;
      probe.remove();
      // Hidden (the window is display:none on phones): nothing to draw
      if (!charW || !box.clientWidth) {
        cols = rows = 0;
        return;
      }
      lineH = parseFloat(getComputedStyle(pre).lineHeight) || charW * 2;
      boxW = box.clientWidth;
      cols = Math.max(SPRITE_W + 2, Math.floor(boxW / charW));
      rows = Math.max(SPRITE_H + 2, Math.floor(box.clientHeight / lineH));
      if (mode === "sleep") Object.assign(pos, home());
      pos.x = Math.max(0, Math.min(boxW - spriteW(), pos.x));
      pos.y = Math.max(0, Math.min((rows - SPRITE_H) * lineH, pos.y));
      shown = draw(performance.now());
      pre.textContent = shown;
    };

    // Moves toward a point (the center of the cat is what's aimed), returns
    // how far it was from there
    const moveToward = (tx: number, ty: number, dt: number) => {
      const dx = tx - (pos.x + spriteW() / 2);
      const dy = ty - (pos.y + spriteH() / 2);
      const len = Math.hypot(dx, dy);
      const step = Math.min(len, SPEED * dt);
      if (len > 0) {
        pos.x += (dx / len) * step;
        pos.y += (dy / len) * step;
      }
      pos.x = Math.max(0, Math.min(boxW - spriteW(), pos.x));
      pos.y = Math.max(0, Math.min((rows - SPRITE_H) * lineH, pos.y));
      return len;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      const dt = Math.min(0.1, (now - (prev || now)) / 1000);
      prev = now;
      last = now;
      if (!cols) return;

      // Where the pointer is, relative to the window
      const rect = box.getBoundingClientRect();
      let dist = Infinity;
      let bx = 0;
      let by = 0;
      if (pointer && now - pointer.at < IDLE_MS) {
        bx = pointer.x - rect.left;
        by = pointer.y - rect.top;
        dist = Math.hypot(
          Math.max(rect.left - pointer.x, 0, pointer.x - rect.right),
          Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom),
        );
      }
      const inside = dist === 0;
      const near = dist <= NEAR_PX;
      if (near) lastNear = now;
      const away = !near && now - lastNear > AWAY_MS;
      const toPointer = Math.hypot(bx - (pos.x + spriteW() / 2), by - (pos.y + spriteH() / 2));

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
          else if (moveToward(bx, by, dt) < STOP_PX) {
            setMode("pounce", now);
            say("mrrp!", now);
          }
          break;
        case "pounce":
          if (now - modeAt > POUNCE_MS) setMode("idle", now);
          break;
        case "home": {
          const h = home();
          if (near) setMode("idle", now);
          else if (moveToward(h.x + spriteW() / 2, h.y + spriteH() / 2, dt) < 2) {
            Object.assign(pos, h);
            setMode("sleep", now);
          }
          break;
        }
      }
      // A poke wakes it, or makes it answer
      if (poked) {
        if (mode !== "sleep" && mode !== "wake") say("mrrp!", now);
        poked = false;
      }

      // Its eyes follow the pointer while it's awake
      const awake = mode !== "sleep" && mode !== "home";
      if (awake && pointer && now - pointer.at < IDLE_MS) {
        // From its face (the middle of the eye row) to the pointer: straight
        // ahead when close, otherwise the nearest of the eight directions
        const dx = pointer.x - (rect.left + pos.x + spriteW() / 2);
        const dy = pointer.y - (rect.top + pos.y + 1.5 * lineH);
        look =
          Math.hypot(dx, dy) < AHEAD_PX
            ? [0, 0]
            : COMPASS[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8];
      } else look = [0, 0];
      if (awake && now > nextBlink) {
        blinkUntil = now + 160;
        nextBlink = now + 3000 + Math.random() * 3000;
      }

      const text = draw(now);
      if (text !== shown) {
        shown = text;
        pre.textContent = text;
      }
    };
    const run = () => {
      cancelAnimationFrame(raf);
      prev = 0;
      if (visible && !still && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY, at: performance.now() };
    };
    const onLeave = () => {
      pointer = null;
    };
    const onPoke = () => {
      poked = true;
    };

    const resize = new ResizeObserver(measure);
    resize.observe(box);
    const seen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    seen.observe(box);
    document.addEventListener("visibilitychange", run);
    // Reduced motion: it sleeps, drawn once, and nothing steers it
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
    <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden" aria-hidden="true">
      {/* data-live: the palette sweep's copy of the page keeps it moving */}
      <pre
        ref={preRef}
        data-live=""
        className="absolute inset-0 m-0 overflow-hidden text-[12px] leading-[1.2]"
      />
    </div>
  );
}
