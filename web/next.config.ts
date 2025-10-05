import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use export settings for production builds
  ...(process.env.NODE_ENV === "production" && {
    output: "export",
    trailingSlash: true,
    basePath: "/OwensCup",
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
