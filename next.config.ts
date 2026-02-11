import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Webpack from bundling these server-side native modules
  serverExternalPackages: ["pdfjs-dist", "canvas"],

  // Optional: Image config if needed later
  images: {
    domains: [],
  },
};

export default nextConfig;
