// import dns from "dns";
// import {createJiti} from "jiti"
import type { NextConfig } from "next";
// const jiti = createJiti(import.meta.url)
// await jiti.import("./src/env")

// dns.setDefaultResultOrder("ipv4first");

const nextConfig:NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true
  },

  experimental: {
    reactCompiler: true,
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

export default nextConfig;
