"use client";
import { switchTo, usePalette } from "./theme";

// Switches between the gruvbox palette (the default) and monochrome. Unlike
// the mode toggle beside it, the label names the palette in use.
export default function PaletteToggle() {
  const palette = usePalette();
  const next = palette === "gruv" ? "mono" : "gruv";

  return (
    <button
      type="button"
      onClick={() => switchTo({ palette: next })}
      aria-label={`Switch to the ${next === "mono" ? "monochrome" : "gruvbox"} palette`}
      title={`Switch to the ${next === "mono" ? "monochrome" : "gruvbox"} palette`}
      className="lx-btn"
      data-palette-toggle
    >
      {palette}
    </button>
  );
}
