'use client';

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// One color per contribution level (0 = none, 4 = most). With only two
// colors the library blends the middle levels, which left 1-commit days
// nearly indistinguishable from empty ones.
type ColorPalette = [string, string, string, string, string];

interface ThemeInput {
  light: ColorPalette;
  dark: ColorPalette;
}

const palette: ColorPalette = [
  '#dcdcdc',
  '#6e1414',
  '#8b0000',
  '#b01818',
  '#d42020',
];

const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then(mod => mod.GitHubCalendar),
  { ssr: false }
);

const githubTheme: ThemeInput = {
  light: palette,
  dark: palette,
}

export default function GithubCalendar() {
  const wrapperRef = useRef<HTMLDivElement>(null);

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
  }, []);

  return (
    <div ref={wrapperRef}>
      <GitHubCalendar
        username="renzoboyy"
        theme={githubTheme}
        labels={{
          totalCount: '{{count}} contributions in the last year',
        }}
      />
    </div>
  );
}