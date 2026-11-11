import HomePage from "./HomePage";
import { getContributions } from "./lib/github";
import { projects } from "./projects/data";
import ProjectContent from "./projects/ProjectContent";

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
