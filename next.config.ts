import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // RF-5: the proxy must see trailing slashes so it can answer 404 for
  // anomalous paths (>2048 chars) instead of Next redirecting them first.
  skipTrailingSlashRedirect: true,
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
