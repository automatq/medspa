/**
 * Override storage on Upstash Redis, reached through its REST API with plain
 * `fetch` — no client library, keeping the project's zero-runtime-dependency
 * character intact.
 *
 * Everything lives in one hash so a page load is a single HGETALL rather than N
 * round trips. Values are strings, exactly like preet's `site_copy` table.
 *
 * Env (set by the Vercel KV / Upstash integration):
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 */

const HASH = "anima:copy";

const config = () => {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("KV_REST_API_URL / KV_REST_API_TOKEN are not set");
  return { url: url.replace(/\/$/, ""), token };
};

/**
 * Exported so api/_lib/posts.mjs can drive its own hash without duplicating the
 * auth, timeout and error handling below.
 */
export const command = async (parts) => {
  const { url, token } = config();
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(parts),
    // A slow store must not hold a page load open indefinitely.
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`store ${parts[0]} failed: ${response.status}`);
  }
  const body = await response.json();
  if (body.error) throw new Error(`store ${parts[0]} failed: ${body.error}`);
  return body.result;
};

/** Upstash returns HGETALL as a flat [k, v, k, v] array. */
export const readHash = async (hash) => {
  const flat = (await command(["HGETALL", hash])) || [];
  const map = {};
  for (let index = 0; index < flat.length; index += 2) map[flat[index]] = flat[index + 1];
  return map;
};

/** The whole override map. */
export const readAll = () => readHash(HASH);

export const writeKey = (key, value) => command(["HSET", HASH, key, value]);

export const deleteKey = (key) => command(["HDEL", HASH, key]);

/**
 * Fixed-window rate limit, used on login only. preet has none, which leaves its
 * single shared password open to unlimited guessing.
 */
export const rateLimit = async (bucket, { limit, windowSeconds }) => {
  const key = `anima:rl:${bucket}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;
  const count = await command(["INCR", key]);
  if (count === 1) await command(["EXPIRE", key, windowSeconds]);
  return { allowed: count <= limit, count };
};
