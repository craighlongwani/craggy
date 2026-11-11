import "server-only";

// GitHub's contribution calendar for the GitHub window, straight from GitHub's
// GraphQL API (the same numbers as the profile page). It runs at build time
// for the static export. GH_CONTRIBUTIONS_TOKEN must belong to USER and have
// permission to read that account's profile; it never reaches the browser.

export type Contributions = {
  total: number;
  days: { date: string; count: number; level: number }[];
};

const USER = "craighlongwani";

const QUERY = `query($login: String!) {
  viewer { login }
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

type Response = {
  data?: {
    viewer: { login: string };
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
    } | null;
  };
  errors?: { message: string }[];
};

async function load(token: string): Promise<Contributions> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL: HTTP ${res.status}`);
  const json = (await res.json()) as Response;
  const viewer = json.data?.viewer?.login;
  if (viewer?.toLowerCase() !== USER.toLowerCase()) {
    throw new Error(
      `GitHub GraphQL: expected token for ${USER}, got ${viewer ?? "unknown user"}`,
    );
  }
  const calendar = json.data?.user?.contributionsCollection.contributionCalendar;
  if (!calendar) {
    throw new Error(`GitHub GraphQL: ${json.errors?.[0]?.message ?? "no calendar"}`);
  }
  return {
    total: calendar.totalContributions,
    days: calendar.weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVELS[d.contributionLevel] ?? 0,
      })),
    ),
  };
}

// Without a token or a successful GitHub response, the static page shows that
// contributions are unavailable and the build log records the failure.
export async function getContributions(): Promise<Contributions | null> {
  const token = process.env.GH_CONTRIBUTIONS_TOKEN;
  if (!token) {
    if (process.env.GITHUB_ACTIONS === "true") {
      throw new Error(
        `GitHub contributions unavailable: set the GH_CONTRIBUTIONS_TOKEN Actions secret to a read:user token for ${USER}.`,
      );
    }
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `GitHub contributions unavailable: set the GH_CONTRIBUTIONS_TOKEN Actions secret to a read:user token for ${USER}.`,
      );
    }
    return null;
  }
  try {
    return await load(token);
  } catch (err) {
    if (process.env.GITHUB_ACTIONS === "true") throw err;
    console.error(err);
    return null;
  }
}
