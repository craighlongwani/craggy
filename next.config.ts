import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The projects page is now a board of the home page
  async redirects() {
    return [{ source: "/projects", destination: "/#projects", permanent: true }];
  },
};

export default nextConfig;
