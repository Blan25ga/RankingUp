type RateLimitResult = {
  allowed: boolean;
  retryAfterMs?: number;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 20,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const key = identifier || "unknown";
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  return { allowed: true };
}
