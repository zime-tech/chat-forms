/**
 * In-memory sliding-window rate limiter.
 * Each key (typically an IP) gets a fixed number of requests per window.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Clean up expired entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL).unref();

export function rateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetIn = entry.resetAt - now;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining, resetIn };
}
