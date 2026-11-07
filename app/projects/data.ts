// Every project, in one place. Each entry drives both its window on the
// /projects bento grid and its own page at /projects/<slug>; to add a
// project, add an entry here (and its assets under public/assets/projects).
export type Project = {
  slug: string;
  name: string;
  logo: string;
  // Fills the space around the logo when its box isn't square; matches the
  // logo's own edge color
  logoBackground: string;
  event: string;
  // Short context shown beside the project on the home page
  badge: string;
  // One-line pitch; the page title is "<name>: <summary>"
  summary: string;
  // Bento grid spans on /projects
  span: string;

  // ── The project page ──
  role: string;
  video: { src: string; label: string };
  // Paragraphs beside the highlights
  description: string[];
  highlights: string[];
  // Three cards under a heading, e.g. "How it works"
  steps: { heading: string; items: { step: string; text: string }[] };
  tech: string[];
  closing: string;
  // Public repo, or a note when there isn't one
  source: { href: string; label: string } | { note: string };
};

export const projects: Project[] = [
  {
    slug: "verifai",
    name: "VerifAI",
    logo: "/assets/projects/VerifAI/Logo.png",
    logoBackground: "#061947",
    event: "HackFest GDG Loyola 2026 · Ateneo De Manila University · March 2026",
    badge: "HackFest GDG Loyola 2026",
    summary: "AI-Powered Source Verification for Student Research Papers",
    span: "col-span-1 md:col-span-2 md:row-span-2",
    role: "Lead Developer · Backend & AI Integration",
    video: {
      src: "/assets/projects/VerifAI/VerifAI-demo-loop.mp4",
      label: "VerifAI demo",
    },
    description: [
      "At HackFest GDG Loyola, my team built VerifAI, a research assistant prototype set inside a Google Docs style editor. A student highlights a claim in their paper, and the tool finds related peer-reviewed literature, checks that each source exists, and shows where the paper supports or contradicts the claim.",
      "I led development of the backend and AI integration, covering the Flask server, the Gemini and CrossRef pipeline, and the credibility rubric. My teammates focused on the interface and visual design.",
    ],
    highlights: [
      "Built the Flask backend and a server-side proxy for the Gemini API, so the API key never reaches the browser",
      "Designed a two-step source check: Gemini suggests papers, then parallel CrossRef lookups confirm each DOI, title, and author list",
      "Developed the 100-point credibility rubric, which scores each source on recency and relevance",
      "Wrote the technical documentation, including data flow diagrams, use cases, and the SRS",
    ],
    steps: {
      heading: "How it works",
      items: [
        {
          step: "Discover",
          text: "Gemini returns candidate papers for the highlighted claim. The backend verifies each one against CrossRef and falls back to a Google Scholar search when no match is found.",
        },
        {
          step: "Ground",
          text: "The student pastes the paper's text. Gemini labels the result as an exact match, a related passage, or a contradiction of the claim.",
        },
        {
          step: "Review",
          text: "Relevant passages are highlighted in the paper by color, alongside the rubric verdict, an APA citation, and a synthesis paragraph.",
        },
      ],
    },
    tech: [
      "Python",
      "Flask",
      "Gemini 2.5 Flash",
      "CrossRef API",
      "JavaScript",
      "HTML/CSS",
    ],
    closing:
      "The main lesson I took from this project was how to make LLM output dependable: rather than trusting the model's answers directly, I validated them against an authoritative source before showing them to the user.",
    source: {
      href: "https://github.com/renzoboyy/Verifork",
      label: "View on GitHub",
    },
  },
  {
    slug: "revora",
    name: "Revora",
    logo: "/assets/projects/Revora/logo.png",
    logoBackground: "linear-gradient(135deg, #2f9362, #164f37)",
    event: "Database Management Course Project · May to August 2026",
    badge: "Database Management course project",
    summary: "Verified Onboarding for a Circular Material Exchange",
    span: "col-span-1 lg:col-span-2",
    role: "Lead Developer · Database & Backend",
    video: {
      src: "/assets/projects/Revora/Revora-ssms-demo.mp4",
      label: "Revora database and admin dashboard demo",
    },
    description: [
      "Revora was envisioned as a platform that connects waste generators with upcyclers, so surplus materials like plastics, paper, and fabric scraps go back into production instead of landfills. The material exchange itself was planned for a later phase and was not built.",
      "What was built is the verified onboarding it depends on: a registration portal where people and businesses prove their identity with a government ID or TIN, a user dashboard, and an admin dashboard for approving accounts. I designed and built nearly all of it, focusing on putting the business rules and security in the SQL Server database itself.",
    ],
    highlights: [
      "Designed a normalized 14-table schema and ER diagram with six reporting views, including a Region, Province, City, and Barangay address hierarchy",
      "Wrote registration as a single T-SQL transaction that saves the address, ID, branch, entity, and user records together or not at all",
      "Used triggers to hash passwords and write an audit log entry for every submission and status change",
      "Built a least-privilege security model with three SQL Server logins, explicit DENY rules, and Dynamic Data Masking on personal data",
      "Built the admin dashboard, with an approval queue, SLA flags, a review panel, and live counters",
    ],
    steps: {
      heading: "How it works",
      items: [
        {
          step: "Register",
          text: "A seven-step form submits to sp_RegisterUser, which only the revora_api login can run. In one transaction it finds or creates the address and inserts the ID, branch, entity, and user rows, while triggers hash the password and log the submission.",
        },
        {
          step: "Review",
          text: "Administrators work through a pending queue where a SQL function flags each application as On Track, Due Soon, or Overdue. Only the revora_staff login can run the approval procedures, and every decision and note is written to the audit log.",
        },
        {
          step: "Secure",
          text: "Each login gets only the access it needs. An attempted DELETE as revora_api fails with SQL Server error 229, and the staff and API logins see masked emails, phone numbers, and ID numbers.",
        },
      ],
    },
    tech: [
      "SQL Server",
      "T-SQL",
      "SSMS",
      "Node.js",
      "Express",
      "JavaScript",
      "HTML/CSS",
    ],
    closing:
      "My biggest takeaway was treating the database as the last line of defense. Constraints, transactions, and permissions keep the data correct and private even if the application layer gets something wrong.",
    source: {
      href: "https://github.com/renzoboyy/INFODBM_REVORA",
      label: "View on GitHub",
    },
  },
  {
    slug: "barangay",
    name: "Barangay Management System",
    logo: "/assets/projects/BMS/logo.png",
    logoBackground: "#fff",
    event: "Barangay 43, Pasay City · May to August 2026",
    badge: "Barangay 43, Pasay City",
    summary: "Digital Records and Services for a Local Government Unit",
    span: "col-span-1 lg:col-span-2",
    role: "Backend Developer · Documents, Households & Security",
    video: {
      src: "/assets/projects/BMS/BMS-contributions-demo.mp4",
      label: "Demo of my contributions to the Barangay Management System",
    },
    description: [
      "A web system for Barangay 43, Zone 06 in Pasay City that replaces paper records with one place to manage residents, households, document requests, duty schedules, announcements, and reports. Staff sign in with role-based accounts, and every action is recorded in an audit trail.",
      "I joined once the first version of the modules was in place and built the next phase on top of it: the official certificates and reports, the household succession rules, and fixes to security and the audit trail.",
    ],
    highlights: [
      "Designed five official certificate templates, from Barangay Clearance to Certificate of Guardianship, each rendered as a branded PDF",
      "Added an optional Punong Barangay e-signature, with a name and signature image that staff can update from the app",
      "Implemented household succession rules, promoting the secondary head automatically when the primary head is deactivated",
      "Fixed the audit trail so every change, login, and report export records the correct staff member",
      "Tightened access with admin-only pages, two role tiers, duplicate resident checks, and a 10-minute idle timeout",
    ],
    steps: {
      heading: "Key features I built",
      items: [
        {
          step: "Certificates & Reports",
          text: "Each document type has its own template with the barangay seal and details like the resident's relationship or years of cohabitation. I also built the cleanup drive attendance sheet and added the barangay header to the other report PDFs.",
        },
        {
          step: "Household Succession",
          text: "When a primary head is deactivated, the secondary head takes over automatically. Reactivated residents return as regular members, and a household left without a head shows a warning with a dialog to assign new heads.",
        },
        {
          step: "Security & Audit",
          text: "The audit log could not see users signed in with JWT, so I attached the signed-in user to every request and added login and export logging. Admin-only pages are now blocked, and admins cannot change their own role.",
        },
      ],
    },
    tech: [
      "Python",
      "Django",
      "Django REST Framework",
      "MySQL",
      "React",
      "WeasyPrint",
      "django-auditlog",
    ],
    closing:
      "This project taught me to extend a system someone else started. Most of my work came from barangay stakeholder feedback, like the official certificate layouts and the rules for who heads a household, so I had to fit new requirements into models and screens that were already in use.",
    source: { note: "Source code available on request" },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
