import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

const { Pool } = pg;

const isLocalDb =
  process.env.DATABASE_URL?.includes("localhost") ||
  process.env.DATABASE_URL?.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

// Drizzle's type inference is too deep for TypeScript with complex schemas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: any = null;

function getDb() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return null;
  }

  if (!dbInstance && process.env.DATABASE_URL) {
    // @ts-expect-error drizzle type inference is too deep for TS
    dbInstance = drizzle(pool, { schema });
  }

  return dbInstance;
}

export const db = typeof window === "undefined" ? getDb() : null;
