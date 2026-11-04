'use client';

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// One color per contribution level (0 = none, 4 = most): GitHub's own
// contribution-graph greens.
type ColorPalette = [string, string, string, string, string];

interface ThemeInput {
  light: ColorPalette;
  dark: ColorPalette;
}

const palette: ColorPalette = [
  '#ebedf0',
  '#9be9a8',
  '#40c463',
  '#30a14e',
  '#216e39',
];

const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then(mod => mod.GitHubCalendar),
  { ssr: false }
);

const githubTheme: ThemeInput = {
  light: palette,
  dark: palette,
}

const BLOCK_MARGIN = 4;
const DEFAULT_BLOCK_SIZE = 12;
const MIN_BLOCK_SIZE = 10;
const MAX_BLOCK_SIZE = 28;

// With `fit`, the calendar fills its parent's height (on md+ screens, where
// the bento grid gives the window a fixed height): the squares grow until the
// seven rows reach the bottom, and the weeks that no longer fit scroll
// horizontally. The parent must be positioned, since the calendar is laid
// out absolutely so its size can't feed back into the grid row's height.
export default function GithubCalendar({ fit = false }: { fit?: boolean }) {
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
        const available = wrapper.clientHeight - labels;
        const next = Math.floor((available - 6 * BLOCK_MARGIN) / 7);
        return Math.min(MAX_BLOCK_SIZE, Math.max(MIN_BLOCK_SIZE, next));
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
    <div ref={wrapperRef} className={fit ? 'md:absolute md:inset-3' : undefined}>
      <GitHubCalendar
        username="renzoboyy"
        theme={githubTheme}
        blockSize={blockSize}
        blockMargin={BLOCK_MARGIN}
        labels={{
          totalCount: '{{count}} contributions in the last year',
        }}
      />
    </div>
  );
}
