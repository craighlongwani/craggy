import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BootIntro from "./components/BootIntro";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const siteTitle = "Jed Lawrence Engbino · Information Systems";
const siteDescription =
  "Portfolio of Jed Lawrence Engbino, an Information Systems student at De La Salle – College of Saint Benilde building database-driven systems, from SQL Server back ends to full-stack web apps.";

export const metadata: Metadata = {
  metadataBase: new URL("https://renzo-dev.vercel.app"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "renzo",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="darkreader-lock" />
        {/* Applies the saved theme before first paint, so light mode never
            flashes dark */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var d=document.documentElement;if(localStorage.getItem("theme")==="light")d.dataset.theme="light";if(localStorage.getItem("palette")==="mono")d.dataset.palette="mono";if(location.pathname==="/"&&!location.hash&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.boot="1";if(sessionStorage.getItem("booted"))d.dataset.bootQuick="1";setTimeout(function(){delete d.dataset.boot},20000)}}catch(e){}',
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


