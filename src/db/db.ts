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
export async function checkDbHealth(maxRetries = 3, retryDelay = 100) {
  let retries = 0;
  let lastError: unknown;

  while (retries <= maxRetries) {
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
        retryAttempts: retries,
      });
      return; // Success, exit the function
    } catch (error) {
      lastError = error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn(
        `Database health check failed (attempt ${retries + 1}/${
          maxRetries + 1
        })`,
        {
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }
      );

      if (retries < maxRetries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retries++;
      } else {
        // All retries exhausted
        console.error("Database health check failed after all retry attempts", {
          error: errorMessage,
          timestamp: new Date().toISOString(),
          totalAttempts: maxRetries + 1,
        });
        throw new Error(
          "Database connection failed after multiple attempts: " + errorMessage
        );
      }
    }
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
