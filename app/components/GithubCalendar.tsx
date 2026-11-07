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

const BLOCK_MARGIN = 4;
const DEFAULT_BLOCK_SIZE = 12;
const MIN_BLOCK_SIZE = 8;
const MAX_BLOCK_SIZE = 28;

// With `fit`, the calendar fills its parent's height (on md+ screens, where
// the bento grid gives the window a fixed height): the squares grow until the
// seven rows reach the bottom, and the weeks that no longer fit scroll
// horizontally. The parent must be positioned, since the calendar is laid
// out absolutely so its size can't feed back into the grid row's height.
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

  // Size the squares to the available height. The labels above and below
  // the grid don't scale with the squares, so their height is measured from
  // the rendered calendar and subtracted first.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!fit || !wrapper) return;
    const desktop = window.matchMedia('(min-width: 768px)');

    const resize = () => {
      if (!desktop.matches) {
        setBlockSize(DEFAULT_BLOCK_SIZE);
        return;
      }
      const calendar = wrapper.querySelector<HTMLElement>('.react-activity-calendar');
      if (!calendar || !calendar.querySelector('rect[data-date]')) return;
      setBlockSize((current) => {
        const grid = 7 * current + 6 * BLOCK_MARGIN;
        const labels = calendar.offsetHeight - grid;
        // Leave a pixel of slack so sub-pixel rounding can't add a vertical
        // scrollbar to the surrounding frame.
        const available = wrapper.clientHeight - labels - 1;
        const next = Math.min(
          MAX_BLOCK_SIZE,
          Math.max(MIN_BLOCK_SIZE, Math.floor((available - 6 * BLOCK_MARGIN) / 7)),
        );
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
    desktop.addEventListener('change', resize);
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      desktop.removeEventListener('change', resize);
    };
  }, [fit]);

  return (
    <div
      ref={wrapperRef}
      className={fit ? 'md:absolute md:inset-3 md:flex md:items-center' : undefined}
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
