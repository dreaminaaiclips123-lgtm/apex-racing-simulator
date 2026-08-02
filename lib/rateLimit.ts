import { get, put, BlobPreconditionFailedError } from "@vercel/blob";

// A lightweight rate limiter reusing the same Vercel Blob + ETag CAS pattern
// as lib/store.ts / lib/userStore.ts, rather than pulling in a new paid
// service (Upstash/Redis) just for this. Login and signup had zero
// throttling before — unlimited concurrent attempts against any account,
// including the super-admin login.

const PATHNAME = "security/rate-limits.json";
const MAX_RETRIES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 8;

interface AttemptRecord {
  count: number;
  windowStart: number;
}

interface StoreData {
  attempts: Record<string, AttemptRecord>;
}

async function loadStore(): Promise<{ data: StoreData; etag: string | null }> {
  const result = await get(PATHNAME, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) {
    return { data: { attempts: {} }, etag: null };
  }
  const text = await new Response(result.stream).text();
  const data = JSON.parse(text) as StoreData;
  const etag = result.blob.etag.replace(/^W\//, "");
  return { data, etag };
}

function prune(attempts: Record<string, AttemptRecord>, now: number) {
  for (const key of Object.keys(attempts)) {
    if (now - attempts[key].windowStart > WINDOW_MS) delete attempts[key];
  }
}

/**
 * Records one attempt against `key` (e.g. `login:<email>` or `signup:<ip>`)
 * and reports whether the caller is currently rate-limited. Call this before
 * doing the expensive work (password hashing, account creation) — the caller
 * still records failed attempts even when this returns not-limited.
 */
export async function checkRateLimit(
  key: string
): Promise<{ limited: boolean; retryAfterMs: number }> {
  const now = Date.now();
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { data, etag } = await loadStore();
    prune(data.attempts, now);

    const existing = data.attempts[key];
    if (existing && existing.count >= MAX_ATTEMPTS) {
      const retryAfterMs = WINDOW_MS - (now - existing.windowStart);
      if (retryAfterMs > 0) {
        return { limited: true, retryAfterMs };
      }
    }

    data.attempts[key] = existing
      ? { count: existing.count + 1, windowStart: existing.windowStart }
      : { count: 1, windowStart: now };

    try {
      await put(PATHNAME, JSON.stringify(data), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        ...(etag ? { ifMatch: etag } : {}),
      });
      return { limited: false, retryAfterMs: 0 };
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError && attempt < MAX_RETRIES - 1) continue;
      // If the rate-limit store itself is having trouble, fail open rather
      // than locking real users out because of an infra hiccup.
      return { limited: false, retryAfterMs: 0 };
    }
  }
  return { limited: false, retryAfterMs: 0 };
}

/** Clears the counter for `key` — call on a successful login so real users don't get penalized by earlier typos. */
export async function clearRateLimit(key: string): Promise<void> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { data, etag } = await loadStore();
    if (!(key in data.attempts)) return;
    delete data.attempts[key];
    try {
      await put(PATHNAME, JSON.stringify(data), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        ...(etag ? { ifMatch: etag } : {}),
      });
      return;
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError && attempt < MAX_RETRIES - 1) continue;
      return;
    }
  }
}

/** Best-effort client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
