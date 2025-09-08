import dns from "dns";
import {createJiti} from "jiti"
import type { NextConfig } from "next";
const jiti = createJiti(import.meta.url)
await jiti.import("./src/env")

dns.setDefaultResultOrder("ipv4first");

const nextConfig:NextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    ppr: true,
    reactCompiler: true,
    useCache: true
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

export default nextConfig;
