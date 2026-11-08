import HomeClient from "./HomeClient";
import { projects } from "./projects/data";
import ProjectContent from "./projects/ProjectContent";

// The whole site is this one page: boards in one scroll, and each project's
// write-up as a window that opens over them (/#projects/<slug>). The write-ups
// are rendered here on the server and handed to the page.
export default function Home() {
  return (
    <HomeClient
      projectViews={projects.map((p) => ({
        slug: p.slug,
        title: p.name,
        content: <ProjectContent project={p} />,
      }))}
    />
  );
}
