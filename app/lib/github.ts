import "server-only";

// GitHub's contribution calendar for the GitHub window, straight from GitHub's
// GraphQL API (the same numbers as the profile page). It runs on the server
// only: the token (GITHUB_TOKEN in .env.local and on the host; a fine-grained
// token with no permissions is enough) never reaches the browser.
//
// The response is cached and refreshed at most once an hour, in the
// background. If GitHub is down when a refresh is due, the error is thrown in
// production so Next keeps serving the last good page instead of replacing it
// with an empty calendar.

export type Contributions = {
  total: number;
  days: { date: string; count: number; level: number }[];
};

const USER = "renzoboyy";
export const CONTRIBUTIONS_REVALIDATE = 3600;

const QUERY = `query($login: String!) {
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
    next: { revalidate: CONTRIBUTIONS_REVALIDATE },
  });
  if (!res.ok) throw new Error(`GitHub GraphQL: HTTP ${res.status}`);
  const json = (await res.json()) as Response;
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

// null when there's no token, or GitHub fails while building or in dev (the
// window then says the contributions are unavailable)
export async function getContributions(): Promise<Contributions | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    return await load(token);
  } catch (err) {
    const regenerating =
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE !== "phase-production-build";
    if (regenerating) throw err;
    console.error(err);
    return null;
  }
}
