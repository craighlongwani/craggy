// The Skills window: one entry per loop iteration. `proof` is concrete
// evidence or the exact tools and skills listed on the résumé; `usedIn`
// names the projects or résumé sections they came from.
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
    usedIn: "BMS, VerifAI, Revora, Inventory",
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
  {
    name: "Frontend & UI",
    proof:
      "React.js, Next.js 14, TypeScript, JavaScript ES6+, Tailwind CSS, React Query, HTML/CSS, Bootstrap",
    usedIn: "Résumé: Frontend, projects",
  },
  {
    name: "Programming Languages",
    proof: "C#, Java, Python",
    usedIn: "Résumé: Backend, projects",
  },
  {
    name: "Backend & Databases",
    proof:
      "Node.js, NestJS, Express.js, Django, Django REST, Flask, ASP.NET Core MVC, Entity Framework Core, Oracle, PostgreSQL, MongoDB, SQL Server, T-SQL, MySQL, SSMS, REST APIs",
    usedIn: "Résumé: Backend, projects",
  },
  {
    name: "Authentication & Firebase",
    proof:
      "Auth.js v5, Firebase Authentication, Firestore, Firebase Storage, JWT, ASP.NET Identity",
    usedIn: "CareerLaunch-Africa, EngFind, CodeTube",
  },
  {
    name: "AI & LLM",
    proof:
      "OpenAI APIs, Google Vertex AI, Together_API, Gemini API, CrossRef API, streaming responses, prompt engineering",
    usedIn: "Résumé: AI / LLM, VerifAI",
  },
  {
    name: "Cloud & Delivery",
    proof: "Vercel, GCP, Cloudflare R2, AWS, Git, GitHub Actions, CI/CD, Docker",
    usedIn: "Résumé: Cloud & Tools, projects",
  },
  {
    name: "Testing & Developer Tools",
    proof:
      "Playwright, xUnit, Testcontainers, Figma, Visual Studio, VS Code, ESLint, FontAwesome, Draw.io",
    usedIn: "Résumé: Cloud & Tools, projects",
  },
  {
    name: "Mobile & Integrations",
    proof:
      "Capacitor, Android/iOS packaging, Expo WebView wrappers, Formspree",
    usedIn: "CareerLaunch-Africa, EngFind",
  },
  {
    name: "Real-Time Web",
    proof: "WebSockets, AJAX, React + Vite, React Router",
    usedIn: "Glitchy Chats, EngFind",
  },
  {
    name: "Networking & Security",
    proof:
      "Cisco Packet Tracer, networking, IP addressing, MAC recognition, firewalls, SSH, secure Wi-Fi, OPSEC",
    usedIn: "Résumé: Networking project",
  },
  {
    name: "Productivity & Leadership",
    proof:
      "Microsoft Word, Excel, leadership, communication, scheduling, decision-making under pressure",
    usedIn: "Résumé: Professional summary",
  },
  {
    name: "Game Development",
    proof: "Unity, Godot, Fabric mods",
    usedIn: "Portfolio tech stack",
  },
];
