/**
 * Override storage on Neon Postgres, reached over HTTP with the serverless
 * driver. Each call is a single request — no pool to keep warm and nothing to
 * tear down, which is what a serverless function wants.
 *
 * Both maps the site needs (copy overrides and composer posts) share one table
 * keyed by (hash, key), so they cannot collide and a page load stays a single
 * SELECT rather than N round trips. Values are strings, exactly like preet's
 * `site_copy` table.
 *
 * Env (Neon connection string):
 *   DATABASE_URL
 *
 * Schema lives in scripts/init-db.mjs — run it once against a new database.
 */

import { neon } from "@neondatabase/serverless";

const HASH = "anima:copy";
const TIMEOUT_MS = 5000;

let client;
const sql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Cached across invocations on a warm function; the driver holds no socket,
  // so this is just avoiding re-parsing the connection string.
  if (!client) client = neon(url);
  return client;
};

/**
 * A slow store must not hold a page load open indefinitely. The HTTP driver has
 * no per-query deadline, so the race supplies one.
 */
const withTimeout = async (promise, label) => {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`store ${label} timed out`)), TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

/** Every key in one map, as a plain object. */
export const readHash = async (hash) => {
  const rows = await withTimeout(
    sql()`SELECT key, value FROM kv WHERE hash = ${hash}`,
    "read"
  );
  const map = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
};

/** One key, or null when nothing is stored under it. */
export const readField = async (hash, key) => {
  const rows = await withTimeout(
    sql()`SELECT value FROM kv WHERE hash = ${hash} AND key = ${key}`,
    "read"
  );
  return rows.length ? rows[0].value : null;
};

export const writeField = (hash, key, value) =>
  withTimeout(
    sql()`INSERT INTO kv (hash, key, value, updated_at) VALUES (${hash}, ${key}, ${value}, now())
          ON CONFLICT (hash, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    "write"
  );

export const deleteField = (hash, key) =>
  withTimeout(sql()`DELETE FROM kv WHERE hash = ${hash} AND key = ${key}`, "delete");

/** The whole override map. */
export const readAll = () => readHash(HASH);

export const writeKey = (key, value) => writeField(HASH, key, value);

export const deleteKey = (key) => deleteField(HASH, key);

/**
 * Fixed-window rate limit, used on login only. preet has none, which leaves its
 * single shared password open to unlimited guessing.
 *
 * Redis got expiry for free via EXPIRE; here the window is part of the key and
 * expired rows are swept on the way past, so the table cannot grow without
 * bound even though nothing runs on a schedule.
 */
export const rateLimit = async (bucket, { limit, windowSeconds }) => {
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `${bucket}:${window}`;
  const expiresAt = new Date((window + 1) * windowSeconds * 1000);

  const rows = await withTimeout(
    sql()`INSERT INTO rate_limit (bucket, count, expires_at) VALUES (${key}, 1, ${expiresAt})
          ON CONFLICT (bucket) DO UPDATE SET count = rate_limit.count + 1
          RETURNING count`,
    "rate-limit"
  );
  const count = Number(rows[0].count);

  // Cheap at login volume, and it keeps the sweep next to the only writer.
  if (count === 1) {
    try {
      await withTimeout(sql()`DELETE FROM rate_limit WHERE expires_at < now()`, "sweep");
    } catch {
      // A failed sweep must never block a sign-in.
    }
  }

  return { allowed: count <= limit, count };
};
