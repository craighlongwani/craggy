import { withBasePath } from "../../lib/site";

// Where to find me: the sidebar lists these on wide screens, and the About
// window lists them on narrower ones.
export const links = [
  { label: "github", href: "https://github.com/craighlongwani", external: true },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/craighlongwani/",
    external: true,
  },
  {
    label: "email",
    href: "mailto:clkhlongwani2@gmail.com",
    external: false,
  },
  {
    label: "Craig_Hlongwani.pdf",
    href: withBasePath("/Craig_Hlongwani.pdf"),
    external: true,
  },
] as const;
