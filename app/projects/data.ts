// Shared list of projects for the /projects index. Each one has its own
// write-up page at /projects/<slug>.
export type Project = {
  slug: string;
  name: string;
  logo: string;
  // Fills the space around the logo when its box isn't square; matches the
  // logo's own edge color
  logoBackground: string;
  event: string;
  summary: string;
  // Bento grid spans, as on the home page
  span: string;
};

export const projects: Project[] = [
  {
    slug: "verifai",
    name: "VerifAI",
    logo: "/assets/projects/VerifAI/Logo.png",
    logoBackground: "#061947",
    event: "HackFest GDG Loyola · March 2026",
    summary: "AI-Powered Source Verification for Student Research Papers",
    span: "col-span-1 md:col-span-2 md:row-span-2",
  },
  {
    slug: "revora",
    name: "Revora",
    logo: "/assets/projects/Revora/logo.png",
    logoBackground: "linear-gradient(135deg, #2f9362, #164f37)",
    event: "INFODBM Course Project · August 2026",
    summary: "Verified Onboarding for a Circular Material Exchange",
    span: "col-span-1 lg:col-span-2",
  },
  {
    slug: "barangay",
    name: "Barangay Management System",
    logo: "/assets/projects/BMS/logo.png",
    logoBackground: "#fff",
    event: "Barangay 43, Pasay City · July to August 2026",
    summary: "Digital Records and Services for a Local Government Unit",
    span: "col-span-1 lg:col-span-2",
  },
];
