import { memo } from "react";

// 16×16 pixel art shared by the taskbar and the Start menu. Each icon is one
// string per row, one character per pixel, and "." is transparent.

export const pixelColors: Record<string, string> = {
  k: "#000",
  r: "#c00000",
  w: "#fff",
  b: "#00a0ff",
  d: "#8b5a2b",
  g: "#808080",
  s: "#505050",
  y: "#ffff00",
  e: "#008000",
};

const house = [
  "................",
  ".......kk.......",
  "......krrk......",
  ".....krrrrk.....",
  "....krrrrrrk....",
  "...krrrrrrrrk...",
  "..krrrrrrrrrrk..",
  ".kkkkkkkkkkkkkk.",
  "..kwwwwwwwwwwk..",
  "..kwkkkwwwwwwk..",
  "..kwkbkwkkkkwk..",
  "..kwkkkwkddkwk..",
  "..kwwwwwkddkwk..",
  "..kwwwwwkddkwk..",
  "..kkkkkkkkkkkk..",
  "................",
];

// Clipboard with a gear badge over its bottom-right corner
const clipboard = [
  "......kkkk......",
  "..kkkkggggkkkk..",
  "..kddkkkkkkddk..",
  "..kdwwwwwwwwdk..",
  "..kdwkkkkkkwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwkkkkkwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwkkkkwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kdwwwwwwwwdk..",
  "..kddddddddddk..",
  "..kkkkkkkkkkkk..",
];

const gear7 = [
  ".s.s.s.",
  "sssssss",
  ".ss.ss.",
  "ss...ss",
  ".ss.ss.",
  "sssssss",
  ".s.s.s.",
];

function withOverlay(base: string[], overlay: string[], x: number, y: number) {
  return base.map((row, r) => {
    const over = overlay[r - y];
    if (!over) return row;
    return Array.from(row, (c, col) => {
      const o = over[col - x];
      return o && o !== "." ? o : c;
    }).join("");
  });
}

// The four-pane Windows flag, in the same red / green / blue / yellow order
const windows = [
  "................",
  "................",
  ".kkkkkkkkkkkkk..",
  ".krrrrrkeeeeek..",
  ".krrrrrkeeeeek..",
  ".krrrrrkeeeeek..",
  ".krrrrrkeeeeek..",
  ".krrrrrkeeeeek..",
  ".kkkkkkkkkkkkk..",
  ".kbbbbbyyyyyyk..",
  ".kbbbbbyyyyyyk..",
  ".kbbbbbyyyyyyk..",
  ".kbbbbbyyyyyyk..",
  ".kbbbbbyyyyyyk..",
  ".kkkkkkkkkkkkk..",
  "................",
];

const search = [
  "................",
  ".....kkkk.......",
  "....kwwwwk......",
  "...kwwwwwwk.....",
  "...kwwkkwwk.....",
  "...kwk..kwwk....",
  "...kwk..kwwk....",
  "...kwwkkwwk.....",
  "....kwwwwk......",
  ".....kkkkkk.....",
  "........kkkk....",
  ".........kkkk...",
  "..........kkkk..",
  "...........kkk..",
  "............k...",
  "................",
];

const person = [
  "................",
  "................",
  ".....kkkkkk.....",
  "....kkwwwwkk....",
  "....kwwwwwwk....",
  "....kwwwwwwk....",
  "....kkwwwwkk....",
  ".....kkkkkk.....",
  "...kkkkkkkkkk...",
  "..kwwwwwwwwwwk..",
  "..kwwwwwwwwwwk..",
  "..kwwwwwwwwwwk..",
  "..kwwwwwwwwwwk..",
  "..kwwwwwwwwwwk..",
  "..kkkkkkkkkkkk..",
  "................",
];

const gear = [
  "................",
  "................",
  "......kkkk......",
  "..k...kwwk...k..",
  "..kk.kkwwkk.kk..",
  "...kkkkkkkkkk...",
  "..kkwwwwwwwwkk..",
  ".kkwk......kwkk.",
  ".kkwk......kwkk.",
  "..kkwwwwwwwwkk..",
  "...kkkkkkkkkk...",
  "..kk.kkwwkk.kk..",
  "..k...kwwk...k..",
  "......kkkk......",
  "................",
  "................",
];

// Two commits joined by a branch, like a source-control graph
const branch = [
  "................",
  "..kkk.....kkk...",
  ".kwwwk...kwwwk..",
  ".kwwwk...kwwwk..",
  "..kkk.....kkk...",
  "...k.......k....",
  "...k.......k....",
  "...kkkkkkkkk....",
  ".......k........",
  ".......k........",
  "......kkk.......",
  ".....kwwwk......",
  ".....kwwwk......",
  "......kkk.......",
  "................",
  "................",
];

const mail = [
  "................",
  "................",
  "..kkkkkkkkkkkk..",
  "..kwwwwwwwwwwk..",
  "..kkwwwwwwwwkk..",
  "..kwkkwwwwkkwk..",
  "..kwwkkwwkkwwk..",
  "..kwwwkkkkwwwk..",
  "..kwwwwkkwwwwk..",
  "..kwwwwwwwwwwk..",
  "..kwwwwwwwwwwk..",
  "..kkkkkkkkkkkk..",
  "................",
  "................",
  "................",
  "................",
];

const clock = [
  "................",
  "....kkkkkkkk....",
  "...kwwwwwwwwk...",
  "..kwwwwwwwwwwk..",
  "..kwwwwkwwwwwk..",
  "..kwwwwkwwwwwk..",
  "..kwwwwkkkwwwk..",
  "..kwwwwwwwwwwk..",
  "..kwwwwwwwwwwk..",
  "..kwwwwwwwwwwk..",
  "...kwwwwwwwwk...",
  "....kkkkkkkk....",
  "................",
  "................",
  "................",
  "................",
];

const document = [
  "................",
  "....kkkkkkkk....",
  "....kwwwwwwkk...",
  "....kwwwwwwkwk..",
  "....kwwwwwwkkwk.",
  "....kwwwwwwwwwk.",
  "....kwwwwwwwwwk.",
  "....kwwkkkkwwwk.",
  "....kwwwwwwwwwk.",
  "....kwwkkkkkwwk.",
  "....kwwwwwwwwwk.",
  "....kwwkkkkwwwk.",
  "....kwwwwwwwwwk.",
  "....kkkkkkkkkkk.",
  "................",
  "................",
];

const power = [
  "................",
  "......kkkk......",
  "....kk....kk....",
  "...k..kkkk..k...",
  "..k...kkkk...k..",
  "..k...kkkk...k..",
  ".k....kkkk....k.",
  ".k....kkkk....k.",
  ".k............k.",
  "..k..........k..",
  "..k..........k..",
  "...k........k...",
  "....kk....kk....",
  "......kkkk......",
  "................",
  "................",
];

const folder = [
  "................",
  "................",
  "..kkkkk.........",
  "..kyyyyykkkkkk..",
  "..kyyyyyyyyyyk..",
  "..kyyyyyyyyyyk..",
  "..kyyyyyyyyyyk..",
  "..kyyyyyyyyyyk..",
  "..kyyyyyyyyyyk..",
  "..kyyyyyyyyyyk..",
  "..kyyyyyyyyyyk..",
  "..kkkkkkkkkkkk..",
  "................",
  "................",
  "................",
  "................",
];

export const icons = {
  home: house,
  projects: withOverlay(clipboard, gear7, 9, 9),
  windows,
  search,
  person,
  gear,
  branch,
  mail,
  clock,
  document,
  power,
  folder,
};

export type IconName = keyof typeof icons;

function pixelPath(rows: string[], color: string) {
  let d = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] === color) d += `M${x} ${y}h1v1h-1z`;
    }
  });
  return d;
}

function PixelIcon({
  rows,
  size = 24,
  className = "",
}: {
  rows: string[];
  size?: number;
  className?: string;
}) {
  // One path per color instead of one <rect> per pixel: a 16×16 icon drops
  // from ~100 SVG nodes to a handful, so the menu stays cheap to paint.
  const colors = new Set<string>();
  for (const row of rows) {
    for (const c of row) {
      if (c !== ".") colors.add(c);
    }
  }

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
    >
      {Array.from(colors, (c) => (
        <path key={c} d={pixelPath(rows, c)} fill={pixelColors[c]} />
      ))}
    </svg>
  );
}

export default memo(PixelIcon);
