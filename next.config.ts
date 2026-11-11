import type { NextConfig } from "next";
import { BASE_PATH } from "./app/lib/site";

const nextConfig: NextConfig = {
  // The default GitHub Pages project site is hosted under /craggy.
  // Redirects aren't supported in a static export.
  output: "export",
  basePath: BASE_PATH,
  images: { unoptimized: true },
};

export default nextConfig;
