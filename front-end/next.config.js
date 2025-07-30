import dns from "dns";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import createJiti from "jiti";

/** @type {import('next').NextConfig} */

dns.setDefaultResultOrder("ipv4first");
createJiti(fileURLToPath(import.meta.url))("./src/env");

const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ["bcryptjs", "googleapis"],
    ppr: true,
    reactCompiler: true,
  },
  transpilePackages: [
    "@local/auth",
    "@local/api",
    "@local/db",
    "@local/validators",
  ],
  serverExternalPackages: [],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

export default nextConfig;
