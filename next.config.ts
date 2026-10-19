import type { NextConfig } from "next";

// Static export => deployable for free on GitHub Pages.
// BASE_PATH is set by the GitHub Action (e.g. "/portfolio") for project pages.
const basePath = process.env.BASE_PATH ?? "";

const config: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["three"],
};

export default config;
