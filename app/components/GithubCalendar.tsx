'use client';

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// One color per contribution level (0 = none, 4 = most). They're CSS variables
// (--lx-cal-0 to --lx-cal-4 in globals.css, one set per theme), so switching
// themes recolors the calendar in place: the component isn't re-rendered, so
// it can't flicker, lose its scroll position or redraw.
type ColorPalette = [string, string, string, string, string];

interface ThemeInput {
  light: ColorPalette;
  dark: ColorPalette;
}

const palette: ColorPalette = [
  'var(--lx-cal-0)',
  'var(--lx-cal-1)',
  'var(--lx-cal-2)',
  'var(--lx-cal-3)',
  'var(--lx-cal-4)',
];

const theme: ThemeInput = {
  light: palette,
  dark: palette,
};

const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then(mod => mod.GitHubCalendar),
  {
    ssr: false,
    loading: () => <p className="lx-dim">fetching contributions…</p>,
  },
);

// Module-level so the calendar's props stay identical between renders
const labels = {
  totalCount: '{{count}} contributions in the last year',
};
const style = { color: 'var(--lx-dim)' };

// The whole year, always. The calendar is drawn at one fixed size and the
// stylesheet (`.lx-calendar`) scales it to its box: the box's width below
// 1024px, and from there up, when the box has a fixed height, pinned to all
// four corners of it. Because the scaling is CSS alone, the calendar follows
// the box exactly as the window resizes, with no measuring or re-rendering.
export default function GithubCalendar() {
  const ref = useRef<HTMLDivElement>(null);

  // From 1024px the calendar is as tall as its box and as wide as that makes
  // it, so it can be wider than the box and scroll sideways. Its size is set
  // here in pixels (--lx-cal-w and --lx-cal-h, used by globals.css) instead of
  // being left to percentage and aspect-ratio rules, so it never depends on
  // how many layout passes the browser needs to settle them. The scroll
  // starts at the right edge (the newest weeks, so the left is what's
  // cropped), and keeps the same distance from that edge as the box resizes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fromRight = 0;
    const scroller = () =>
      el.querySelector<HTMLElement>(".react-activity-calendar__scroll-container");
    const onScroll = (e: Event) => {
      const s = e.target as HTMLElement;
      fromRight = s.scrollWidth - s.clientWidth - s.scrollLeft;
    };
    const place = () => {
      const s = scroller();
      if (s) s.scrollLeft = s.scrollWidth - s.clientWidth - fromRight;
    };
    const size = () => {
      const s = scroller();
      const box = s
        ?.querySelector("svg")
        ?.getAttribute("viewBox")
        ?.split(" ");
      if (!s || !box || !s.clientHeight) return;
      const height = s.clientHeight;
      el.style.setProperty("--lx-cal-h", `${height}px`);
      el.style.setProperty(
        "--lx-cal-w",
        `${(height * Number(box[2])) / Number(box[3])}px`,
      );
      place();
    };
    el.addEventListener("scroll", onScroll, true);
    // The scrollbar is hidden, so let the mouse wheel scroll it sideways
    const onWheel = (e: WheelEvent) => {
      const s = scroller();
      if (!s || s.scrollWidth <= s.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      s.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const resize = new ResizeObserver(size);
    resize.observe(el);
    // The calendar is loaded lazily: place it once its SVG appears
    const appear = new MutationObserver(() => {
      if (scroller()?.querySelector("svg")) {
        size();
        appear.disconnect();
      }
    });
    appear.observe(el, { childList: true, subtree: true });
    size();
    return () => {
      el.removeEventListener("scroll", onScroll, true);
      el.removeEventListener("wheel", onWheel);
      resize.disconnect();
      appear.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="lx-calendar">
      <GitHubCalendar
        username="renzoboyy"
        theme={theme}
        colorScheme="dark"
        blockSize={12}
        blockMargin={3}
        blockRadius={0}
        fontSize={14}
        labels={labels}
        style={style}
      />
    </div>
  );
}
