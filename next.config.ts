import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages (served from the root of craighlongwani.dev, so
  // no basePath). Redirects aren't supported in a static export; the old
  // /projects routes no longer exist as pages.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
