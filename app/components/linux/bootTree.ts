// The directory listing the boot sequence types out (BootIntro.tsx): this
// project's own folders, one line per entry, in `tree` style. Each entry is
// [name, note, children]; a trailing slash marks a folder.
type Entry = [name: string, note?: string, children?: Entry[]];

const tree: Entry[] = [
  [
    "app/",
    "Next.js app router",
    [
      [
        "components/",
        "windows and widgets",
        [
          [
            "linux/",
            "footer bar, themes, skills",
            [
              ["Header.tsx", "prompt, pages, links"],
              ["ThemeToggle.tsx", "dark / light"],
              ["PaletteToggle.tsx", "gruv / mono"],
              ["LinksMenu.tsx"],
              ["ResumeButton.tsx"],
              ["SkillsLoop.tsx", "for skill in skills"],
              ["Status.tsx", "systemctl status jed"],
              ["Cat.tsx", "cat.c"],
              ["Clock.tsx"],
              ["Uptime.tsx"],
              ["theme.ts", "the cursor-drag reveal"],
              ["skills.ts"],
              ["stack.ts"],
              ["links.ts"],
            ],
          ],
          ["GithubCalendar.tsx", "a year of commits"],
          ["HashSync.tsx"],
          ["OpenWindows.tsx"],
          ["ProjectView.tsx", "a project's window"],
          ["Window.tsx"],
        ],
      ],
      [
        "lib/",
        "",
        [
          ["curtain.ts", "windows drag open"],
          ["github.ts", "GitHub's GraphQL API"],
          ["project.ts"],
          ["windowScroll.ts"],
        ],
      ],
      [
        "projects/",
        "case studies",
        [
          ["data.ts", "VerifAI, Revora, BMS, Inventory"],
          ["ProjectsBoard.tsx"],
          ["ProjectCard.tsx"],
          ["ProjectContent.tsx"],
          ["ProjectLink.tsx"],
        ],
      ],
      [
        "education/",
        "schools, coursework",
        [
          ["data.ts"],
          ["EducationBoard.tsx"],
        ],
      ],
      ["HomePage.tsx", "the home page"],
      ["globals.css"],
      ["layout.tsx"],
      ["page.tsx"],
    ],
  ],
  [
    "public/",
    "static files",
    [
      [
        "assets/",
        "",
        [
          ["icons/", "", [["GitHub.png"]]],
          ["projects/", "screenshots", [["VerifAI/"], ["Revora/"], ["BMS/"], ["Inventory/"]]],
          ["me.png"],
        ],
      ],
      ["Craig_Hlongwani.pdf"],
    ],
  ],
  [".claude/", "", [["launch.json"]]],
  ["AGENTS.md"],
  ["CLAUDE.md"],
  ["README.md"],
  ["eslint.config.mjs"],
  ["next.config.ts"],
  ["package.json", "next 16, react 19, tailwind 4"],
  ["postcss.config.mjs"],
  ["tsconfig.json"],
];

export interface BootLine {
  // The text left of the note, and the note itself (shown dim)
  head: string;
  note: string;
  // Index of the line this one is listed under (-1 for the root), and of the
  // entry just above it in the same folder (-1 for a folder's first entry):
  // together they set when it starts typing
  parent: number;
  prev: number;
}

function flatten(): BootLine[] {
  const lines: BootLine[] = [{ head: "craggy/", note: "", parent: -1, prev: -1 }];
  const walk = (entries: Entry[], prefix: string, parent: number) => {
    let prev = -1;
    entries.forEach(([name, note = "", children], i) => {
      const last = i === entries.length - 1;
      const index = lines.length;
      lines.push({
        head: `${prefix}${last ? "└── " : "├── "}${name}`,
        note,
        parent,
        prev,
      });
      prev = index;
      if (children) walk(children, prefix + (last ? "    " : "│   "), index);
    });
  };
  walk(tree, "", 0);

  // Line the notes up in one column
  const width = Math.max(...lines.map((l) => l.head.length)) + 2;
  return lines.map((l) => ({
    ...l,
    head: l.note ? l.head.padEnd(width) : l.head,
    note: l.note ? `# ${l.note}` : "",
  }));
}

export const bootLines = flatten();
