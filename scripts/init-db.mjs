/**
 * One-off schema setup for the override store (api/_lib/store.mjs).
 *
 * Run once against a new database, and again after changing the schema — every
 * statement is idempotent, so a second run is a no-op rather than an error:
 *
 *   DATABASE_URL='postgres://…' node scripts/init-db.mjs
 *
 * Deliberately not part of `npm run build`: the build runs on every deploy and
 * has no business holding credentials or touching a live database.
 */

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);

/**
 * One table for both maps. `hash` is the map name ("anima:copy", "anima:posts")
 * and the composite primary key is what makes an upsert a single statement.
 */
await sql`
  CREATE TABLE IF NOT EXISTS kv (
    hash       text        NOT NULL,
    key        text        NOT NULL,
    value      text        NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (hash, key)
  )
`;

/** Login throttling. `bucket` already carries the window, so rows expire by time. */
await sql`
  CREATE TABLE IF NOT EXISTS rate_limit (
    bucket     text        PRIMARY KEY,
    count      integer     NOT NULL,
    expires_at timestamptz NOT NULL
  )
`;

await sql`CREATE INDEX IF NOT EXISTS rate_limit_expires_at_idx ON rate_limit (expires_at)`;

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN ('kv', 'rate_limit')
  ORDER BY table_name
`;

console.log(`Ready: ${tables.map((row) => row.table_name).join(", ")}`);
