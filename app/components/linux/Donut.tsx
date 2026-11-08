"use client";
import { useEffect, useRef } from "react";

// Andy Sloane's donut.c: a torus spun in 3D and drawn in ASCII, each cell's
// character picked by how much light hits it. Sized to fill its box (in
// character cells, accounting for characters being about twice as tall as
// they are wide), redrawn at ~30fps, paused whenever it's off screen or the
// tab is hidden, and drawn once and left still for reduced motion.
const SHADES = ".,-~:;=!*#$@";
const FRAME_MS = 1000 / 30;
// Rotation per frame: slow, so it sits in the corner without pulling focus
const SPIN_A = 0.03;
const SPIN_B = 0.015;

function render(cols: number, rows: number, a: number, b: number) {
  const out = new Array<string>(cols * rows).fill(" ");
  const depth = new Float32Array(cols * rows);
  const R1 = 1;
  const R2 = 2;
  const K2 = 5;
  // Fit the donut to the box; characters are ~2x taller than wide
  const K1 = (Math.min(cols, rows * 2) * K2 * 3) / (8 * (R1 + R2));
  const cA = Math.cos(a);
  const sA = Math.sin(a);
  const cB = Math.cos(b);
  const sB = Math.sin(b);
  for (let theta = 0; theta < 6.28; theta += 0.07) {
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const cx = R2 + R1 * ct;
    const cy = R1 * st;
    for (let phi = 0; phi < 6.28; phi += 0.02) {
      const cp = Math.cos(phi);
      const sp = Math.sin(phi);
      const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
      const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
      const ooz = 1 / (K2 + cA * cx * sp + cy * sA);
      const xp = Math.floor(cols / 2 + K1 * ooz * x);
      const yp = Math.floor(rows / 2 - K1 * ooz * y * 0.5);
      if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;
      const lum = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
      const i = xp + yp * cols;
      if (lum > 0 && ooz > depth[i]) {
        depth[i] = ooz;
        out[i] = SHADES[Math.min(SHADES.length - 1, Math.floor(lum * 8))];
      }
    }
  }
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) lines.push(out.slice(r * cols, (r + 1) * cols).join(""));
  return lines.join("\n");
}

export default function Donut() {
  const boxRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const pre = preRef.current;
    if (!box || !pre) return;
    let cols = 0;
    let rows = 0;
    let a = 1;
    let b = 1;
    let raf = 0;
    let last = 0;
    let visible = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // How many character cells fit in the box
    const measure = () => {
      const probe = document.createElement("span");
      probe.textContent = "M".repeat(10);
      pre.append(probe);
      const charW = probe.getBoundingClientRect().width / 10;
      probe.remove();
      const lineH = parseFloat(getComputedStyle(pre).lineHeight) || charW * 2;
      cols = Math.max(10, Math.floor(box.clientWidth / charW));
      rows = Math.max(5, Math.floor(box.clientHeight / lineH));
      pre.textContent = render(cols, rows, a, b);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      a += SPIN_A;
      b += SPIN_B;
      pre.textContent = render(cols, rows, a, b);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (visible && !still && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const resize = new ResizeObserver(measure);
    resize.observe(box);
    const seen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    seen.observe(box);
    document.addEventListener("visibilitychange", run);
    measure();
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      seen.disconnect();
      document.removeEventListener("visibilitychange", run);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden" aria-hidden="true">
      {/* data-live: the palette sweep's copy of the page keeps it spinning */}
      <pre
        ref={preRef}
        data-live=""
        className="absolute inset-0 m-0 flex items-center justify-center text-[10px] leading-[1.15]"
      />
    </div>
  );
}
