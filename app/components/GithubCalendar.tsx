'use client';

import dynamic from "next/dynamic";

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
  return (
    <div className="lx-calendar">
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
