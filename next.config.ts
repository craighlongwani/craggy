import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is one page now: the old projects pages are its projects board
  // and the project windows that open over it
  async redirects() {
    return [
      { source: "/projects", destination: "/#projects", permanent: true },
      { source: "/projects/:slug", destination: "/#projects/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
