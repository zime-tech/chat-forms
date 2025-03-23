import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

// Destructure Pool from pg for ES modules
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Connection timeouts and retry settings
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000, // 30 seconds
});

// Database health check function
export async function checkDbHealth() {
  try {
    // Simple query to test connectivity
    const result = await pool.query("SELECT 1 as health_check");
    console.log("Database health check passed", {
      status: "healthy",
      connected: true,
      timestamp: new Date().toISOString(),
      message: "Database connection is healthy",
      details: {
        poolSize: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Database health check failed", {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    throw new Error("Database connection failed " + errorMessage);
  }
}

// Create a function to initialize the database connection
export function createDbConnection() {
  // Check required environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error("database credentials must be set");
  }

  // Pool error handling
  pool.on("error", (err) => {
    console.error("Unexpected database pool error:", err);
    // Don't crash the application on pool errors
  });

  // Check database health
  checkDbHealth();

  // Initialize Drizzle with the pool
  // @ts-ignore
  return drizzle(pool, { schema });
}

// Use a lazy-loading pattern for the database connection
let dbInstance: ReturnType<typeof createDbConnection> | null = null;
// Export a getter function that initializes the connection only when needed
export function getDb() {
  // Skip database initialization during build time
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    console.log("Skipping database initialization during build");
    return null;
  }
  // Initialize the database connection if it doesn't exist yet
  if (!dbInstance) {
    try {
      dbInstance = createDbConnection();
    } catch (error) {
      // During development, we might want to see this error
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to initialize database:", error);
      }
      return null;
    }
  }
  return dbInstance;
}
// For backward compatibility
export const db = typeof window === "undefined" ? getDb() : null;
