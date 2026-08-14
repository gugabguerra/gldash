/**
 * Minimal in-memory sliding-window rate limiter, keyed by client IP.
 *
 * Sized for a single-instance homelab deployment. For multi-instance or shared
 * reverse-proxy setups prefer a shared store (Redis) or rate limiting at the
 * proxy, and set `ADDRESS_HEADER`/`XFF_DEPTH` so `getClientAddress()` resolves
 * the real client IP.
 */

interface Bucket {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Periodically clears expired buckets so the map does not grow unbounded. */
function pruneExpired(): void {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (now >= bucket.resetAt) buckets.delete(key);
	}
}

interface Limits {
	max: number;
	windowMs: number;
}

const LIMITS: Record<string, Limits> = {
	login: {
		max: Number(process.env.LOGIN_RATE_LIMIT_MAX ?? 10),
		windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 60_000)
	}
};

/** Guards `ip` against exceeding the configured limits for `scope`. */
export function rateLimit(scope: string, ip: string): boolean {
	const limit = LIMITS[scope] ?? { max: 10, windowMs: 60_000 };
	const key = `${scope}:${ip}`;
	const now = Date.now();

	if (buckets.size % 32 === 0) pruneExpired();

	const current = buckets.get(key);
	if (!current || now >= current.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + limit.windowMs });
		return true;
	}

	current.count += 1;
	return current.count <= limit.max;
}
