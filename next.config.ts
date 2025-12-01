import type { NextConfig } from "next";
import nextI18NextConfig from "./next-i18next.config.js";

const nextConfig: NextConfig = {
  i18n: nextI18NextConfig.i18n,

  // Fix Windows “Invalid source map” warnings
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
