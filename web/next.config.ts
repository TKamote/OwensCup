import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles builds automatically, no need for export config
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
