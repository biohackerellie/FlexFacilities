import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["facilities_db"],
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
