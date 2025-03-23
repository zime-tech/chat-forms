import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
    ssl: {
      rejectUnauthorized: false,
    },
  },
  verbose: true,
  strict: true,
});
