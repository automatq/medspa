import { bannedReason } from "../../data/banned-content.mjs";
import { THEME_KEYS, getDefault, isAllowedValue, isLocked, isWellFormedKey } from "../../data/editable.mjs";
import { requireAdmin } from "../_lib/auth.mjs";
import { deleteKey, writeKey } from "../_lib/store.mjs";

const MAX_LENGTH = 5000;

/**
 * Save or reset one key.
 *
 * Four gates, in order, and each one exists because of a specific failure:
 *   1. signed-in            — anyone could otherwise rewrite the site
 *   2. key resolves         — preet accepts any regex-shaped key and accumulates
 *                             orphan rows nothing renders
 *   3. key is not locked    — reviews, prices and the compliance wording on the
 *                             team are decisions, not copy (see data/editable.mjs)
 *   4. value is not banned  — the build-time content-integrity test cannot see a
 *                             runtime edit, so the same list is enforced here
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const key = String(req.query.key || "");

  if (!isWellFormedKey(key)) return res.status(400).json({ error: "Invalid key" });
  // Locked before resolvable: reviews and prices have no resolver entry at all,
  // so checking existence first would answer "nothing uses this" for something
  // that is in fact deliberately protected.
  if (isLocked(key)) {
    return res.status(403).json({
      error:
        "This text is locked. Reviews, prices, and professional titles are held fixed for accuracy and compliance — ask a developer if it genuinely needs to change.",
    });
  }
  if (getDefault(key) === undefined) {
    return res.status(404).json({ error: `Nothing on the site uses "${key}"` });
  }

  if (req.method === "DELETE") {
    try {
      await deleteKey(key);
      return res.status(200).json({ key, value: getDefault(key), reset: true });
    } catch (error) {
      return res.status(502).json({ error: `Could not reset: ${error.message}` });
    }
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const value = req.body?.value;
  if (typeof value !== "string") return res.status(400).json({ error: "value must be a string" });
  if (value.length > MAX_LENGTH) {
    return res.status(413).json({ error: `Too long — ${MAX_LENGTH} characters maximum` });
  }

  // A settings key lands in a DOM attribute rather than a text node, so it is
  // held to its enumerated values instead of the prose rules below.
  if (!isAllowedValue(key, value)) {
    return res.status(422).json({
      error: `"${value}" is not one of: ${Object.keys(THEME_KEYS[key]).join(", ")}`,
    });
  }

  const banned = bannedReason(value);
  if (banned) {
    return res.status(422).json({
      error: `"${banned.needle}" cannot be published here — ${banned.reason}. This was removed from the site deliberately.`,
    });
  }

  try {
    await writeKey(key, value);
    return res.status(200).json({ key, value });
  } catch (error) {
    return res.status(502).json({ error: `Could not save: ${error.message}` });
  }
}
