import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// A recreation of Chicago, the classic Mac OS system font
const chicago = localFont({
  src: "../public/fonts/chicago-12-1.otf",
  variable: "--font-chicago",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const siteTitle = "Jed Lawrence Engbino · Information Systems";
const siteDescription =
  "Portfolio of Jed Lawrence Engbino, an Information Systems student at De La Salle-College of Saint Benilde building database-driven systems, from SQL Server back ends to full-stack web apps.";

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
      className={`${geistSans.variable} ${geistMono.variable} ${chicago.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body>{children}</body>
    </html>
  );
}


