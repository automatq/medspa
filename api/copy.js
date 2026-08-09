import { readAll } from "./_lib/store.mjs";

/**
 * Public override map, read by every visitor.
 *
 * Cached at the edge so this is normally not a cold round trip to the store, and
 * `stale-while-revalidate` means a slow store never blocks a page — the previous
 * map is served while a fresh one is fetched behind it.
 *
 * On failure this returns an empty map rather than an error: the pages already
 * contain the build-time defaults, so the correct degraded behaviour is
 * "visitor sees the last deployed copy", never a broken page.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const map = await readAll();
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=300");
    return res.status(200).json(map);
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({});
  }
}
