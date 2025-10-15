import type { NextConfig } from "next";

const nextConfig:NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true
  },

  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    cacheComponents: true,
    browserDebugInfoInTerminal: true
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

export default nextConfig;
