import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove i18n — unsupported in App Router
  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: [],
    optimizeCss: false, // ⛔ disables lightningcss
  },
};

export default nextConfig;
