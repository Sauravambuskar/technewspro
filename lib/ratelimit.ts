// Small in-memory limiter for the public write endpoints (newsletter, contact).
// Enough to blunt casual abuse of a single-instance deployment; swap for a shared
// store if the site is ever scaled horizontally.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, { limit = 5, windowMs = 60_000 } = {}) {
  const current = buckets.get(key);
  const timestamp = Date.now();

  if (!current || current.resetAt < timestamp) {
    buckets.set(key, { count: 1, resetAt: timestamp + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  current.count += 1;
  if (buckets.size > 5000) {
    for (const [id, bucket] of Array.from(buckets.entries())) {
      if (bucket.resetAt < timestamp) buckets.delete(id);
    }
  }
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count) };
}

export function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || request.headers.get("x-real-ip") || "local"}`;
}
