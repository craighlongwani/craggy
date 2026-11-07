'use client';

import dynamic from "next/dynamic";
import { memo, useEffect, useRef, useState } from "react";

// One color per contribution level (0 = none, 4 = most): five grays, dark to
// bright, for the dark window background.
type ColorPalette = [string, string, string, string, string];

interface ThemeInput {
  light: ColorPalette;
  dark: ColorPalette;
}

const palette: ColorPalette = [
  '#1f1f1f',
  '#434343',
  '#7a7a7a',
  '#b4b4b4',
  '#f2f2f2',
];

const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then(mod => mod.GitHubCalendar),
  {
    ssr: false,
    loading: () => <p className="lx-dim">fetching contributions…</p>,
  },
);

const githubTheme: ThemeInput = {
  light: palette,
  dark: palette,
}

// Module-level so the calendar's props stay identical between renders
const labels = {
  totalCount: '{{count}} contributions in the last year',
};
const style = { color: 'var(--lx-dim)' };

const BLOCK_MARGIN = 3;
const DEFAULT_BLOCK_SIZE = 12;
const MIN_BLOCK_SIZE = 6;
const MAX_BLOCK_SIZE = 28;

// From this width the bento grid gives every window a fixed height
const TILED = '(min-width: 1024px)';

// With `fit`, the squares are sized to the window. They grow until the whole
// year spans its width, as long as that keeps them at least MIN_BLOCK_SIZE
// (otherwise only the latest weeks show, scrolled to the end). Where the
// window has a fixed height, they are also kept short enough for all seven
// rows. There the calendar is laid out absolutely, so its size can't feed
// back into the grid row's height; the parent must be positioned.
// Memoized: the calendar draws ~370 squares, so it should only re-render
// when its own size changes, not whenever the home page does
export default memo(function GithubCalendar({ fit = false }: { fit?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = useState(DEFAULT_BLOCK_SIZE);

  // The calendar is wider than its card and starts scrolled to the oldest
  // week, hiding recent activity. Once the data loads, jump to the newest.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const scrollToNewest = () => {
      const scroller = wrapper.querySelector<HTMLElement>(
        '.react-activity-calendar__scroll-container'
      );
      if (!scroller || !scroller.querySelector('rect[data-date]')) return false;
      scroller.scrollLeft = scroller.scrollWidth;
      return true;
    };

    if (scrollToNewest()) return;
    const observer = new MutationObserver(() => {
      if (scrollToNewest()) observer.disconnect();
    });
    observer.observe(wrapper, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [blockSize]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!fit || !wrapper) return;
    const tiled = window.matchMedia(TILED);

    const resize = () => {
      const calendar = wrapper.querySelector<HTMLElement>('.react-activity-calendar');
      if (!calendar) return;
      const days = calendar.querySelectorAll('rect[data-date]').length;
      if (!days) return;
      const weeks = Math.ceil(days / 7);

      setBlockSize((current) => {
        // Widest square that still fits every week across
        let next =
          Math.floor((wrapper.clientWidth + BLOCK_MARGIN) / weeks) - BLOCK_MARGIN;
        if (tiled.matches) {
          // The labels above and below the grid don't scale with the squares,
          // so their height is measured from the rendered calendar and
          // subtracted first. A pixel of slack keeps sub-pixel rounding from
          // adding a vertical scrollbar to the surrounding frame.
          const grid = 7 * current + 6 * BLOCK_MARGIN;
          const labels = calendar.offsetHeight - grid;
          const available = wrapper.clientHeight - labels - 1;
          next = Math.min(
            next,
            Math.floor((available - 6 * BLOCK_MARGIN) / 7),
          );
        }
        next = Math.min(MAX_BLOCK_SIZE, Math.max(MIN_BLOCK_SIZE, next));
        // Once the loaded calendar already fits, stop watching its DOM: every
        // later change would only re-measure the same size. Window resizes
        // still come through the ResizeObserver.
        if (next === current) mutationObserver.disconnect();
        return next;
      });
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);
    const mutationObserver = new MutationObserver(resize);
    mutationObserver.observe(wrapper, { childList: true, subtree: true });
    tiled.addEventListener('change', resize);
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      tiled.removeEventListener('change', resize);
    };
  }, [fit]);

  return (
    <div
      ref={wrapperRef}
      className={fit ? 'lg:absolute lg:inset-3 lg:flex lg:items-center' : undefined}
    >
      <GitHubCalendar
        username="renzoboyy"
        theme={githubTheme}
        colorScheme="dark"
        blockSize={blockSize}
        blockMargin={BLOCK_MARGIN}
        blockRadius={0}
        fontSize={12}
        labels={labels}
        style={style}
      />
    </div>
  );
});
