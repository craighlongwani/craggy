// The Skills window: one entry per loop iteration. `proof` is the concrete
// evidence (tools and numbers from the project pages), not a description;
// `usedIn` names the projects it came from.
export type Skill = { name: string; proof: string; usedIn: string };

export const skills: Skill[] = [
  {
    name: "Database Design & SQL",
    proof: "15 tables, 6 views, one-transaction signup",
    usedIn: "Revora, BMS",
  },
  {
    name: "Security & Access Control",
    proof: "Least-privilege logins, masked data, audit log",
    usedIn: "Revora, BMS",
  },
  {
    name: "AI & API Integration",
    proof: "Gemini via server proxy, CrossRef-verified sources",
    usedIn: "VerifAI",
  },
  {
    name: "Full-Stack Development",
    proof: "Django REST, React, ASP.NET MVC, PDF certificates",
    usedIn: "BMS, VerifAI, Revora",
  },
  {
    name: "Testing & DevOps",
    proof: "Playwright, xUnit, Testcontainers, Docker, CI",
    usedIn: "this portfolio",
  },
  {
    name: "Systems Analysis & Design",
    proof: "SRS, use cases, DFDs and ER diagrams first",
    usedIn: "VerifAI, Revora",
  },
];
