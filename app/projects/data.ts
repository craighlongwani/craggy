// Shared list of projects for the /projects index. Each one has its own
// write-up page at /projects/<slug>.
export type Project = {
  slug: string;
  name: string;
  logo: string;
  event: string;
  summary: string;
};

export const projects: Project[] = [
  {
    slug: "verifai",
    name: "VerifAI",
    logo: "/assets/projects/VerifAI/Logo.png",
    event: "HackFest GDG Loyola · March 2026",
    summary: "AI-Powered Source Verification for Student Research Papers",
  },
  {
    slug: "revora",
    name: "Revora",
    logo: "/assets/projects/Revora/logo.png",
    event: "INFODBM Course Project · August 2026",
    summary: "Verified Onboarding for a Circular Material Exchange",
  },
  {
    slug: "barangay",
    name: "Barangay Management System",
    logo: "/assets/projects/BMS/logo.png",
    event: "Barangay 43, Pasay City · July to August 2026",
    summary: "Digital Records and Services for a Local Government Unit",
  },
];
