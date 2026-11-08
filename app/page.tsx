import HomePage from "./HomePage";
import { getContributions } from "./lib/github";
import { projects } from "./projects/data";
import ProjectContent from "./projects/ProjectContent";

// Rebuilt in the background at most once an hour, for the GitHub calendar
// (lib/github.ts; keep in step with CONTRIBUTIONS_REVALIDATE there)
export const revalidate = 3600;

// The whole site is this one page: boards in one scroll, and each project's
// write-up as a window that opens over them (/#projects/<slug>). The write-ups
// and the GitHub calendar's data are fetched and rendered here on the server
// and handed to the page.
export default async function Home() {
  const contributions = await getContributions();
  return (
    <HomePage
      contributions={contributions}
      projectViews={projects.map((p) => ({
        slug: p.slug,
        title: p.name,
        content: <ProjectContent project={p} />,
      }))}
    />
  );
}
