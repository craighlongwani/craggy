import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BootIntro from "./components/BootIntro";
import { SITE_BASE_PATH } from "./lib/site";

// The site's only font (the linux skin uses it everywhere, globals.css)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const siteTitle = "Craig Hlongwani";
const siteDescription =
  "Craig Hlongwani · Computer Science student and full-stack developer";

export const metadata: Metadata = {
  metadataBase: new URL("https://craighlongwani.github.io/craggy/"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "craggy",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={jetbrainsMono.variable}
      suppressHydrationWarning
    >
      <head>
        <meta name="darkreader-lock" />
        {/* The site is one page, so Back/Forward only ever moves between its
            hashes (#projects, #projects/<slug>): the page follows those
            itself (an "lx-popstate" event), and Next's router, which would
            refetch and re-render the page, never sees them. Registered here
            so it runs before Next's own listener. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `addEventListener("popstate",function(e){if(location.pathname==="${SITE_BASE_PATH}/"){e.stopImmediatePropagation();dispatchEvent(new Event("lx-popstate"))}});` +
              // A refresh always starts over on the home board: the hash
              // (an open project, another board) is dropped before anything
              // reads it, so it boots like a fresh visit. Shared links
              // (not a reload) still open where they point.
              `try{var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"&&location.pathname==="${SITE_BASE_PATH}/"&&location.hash){history.replaceState(null,"","${SITE_BASE_PATH}/"+location.search)}history.scrollRestoration="manual"}catch(e){}`,
          }}
        />
        {/* Applies the saved theme before first paint, so light mode never
            flashes dark */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `try{var d=document.documentElement;if(localStorage.getItem("theme")==="light")d.dataset.theme="light";if(localStorage.getItem("palette")==="mono")d.dataset.palette="mono";if(location.pathname==="${SITE_BASE_PATH}/"&&!location.hash&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.boot="1";if(sessionStorage.getItem("booted"))d.dataset.bootQuick="1";setTimeout(function(){delete d.dataset.boot},20000)}}catch(e){}`,
          }}
        />
      </head>
      {/* The Linux skin (globals.css) covers every page */}
      <body data-skin="linux">
        {children}
        <BootIntro />
      </body>
    </html>
  );
}
