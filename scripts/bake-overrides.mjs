import { readFile, writeFile } from "node:fs/promises";
import { getDefault, isLocked, SITE_COPY } from "../data/editable.mjs";

/**
 * Folds live clinic edits back into the source, so they become part of the next
 * build.
 *
 * Why this exists: overrides are applied in the browser, which means a crawler
 * that does not run JavaScript sees the last *deployed* copy. Left alone, a
 * headline the clinic rewrote would never reach Google. Running this before a
 * deploy makes every edit static, crawlable, and visible with JavaScript off.
 *
 *   node scripts/bake-overrides.mjs            # report only
 *   node scripts/bake-overrides.mjs --write    # rewrite the data modules
 *
 * Values are matched by their exact current text and only rewritten when that
 * text appears exactly once in the file. Anything ambiguous is reported rather
 * than guessed — a wrong replacement here would silently corrupt page content.
 */

const FILES = {
  services: "data/services.mjs",
  team: "data/team.mjs",
  blog: "data/blog.mjs",
  pages: "data/pages.mjs",
  campaigns: "data/campaigns.mjs",
};

const write = process.argv.includes("--write");

const fetchOverrides = async () => {
  const url = process.env.COPY_API_URL || "https://anima-medspa.vercel.app/api/copy";
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
};

const overrides = await fetchOverrides();
const keys = Object.keys(overrides);

if (keys.length === 0) {
  console.log("No overrides to bake — the live site matches this build.");
  process.exit(0);
}

const edits = new Map(); // file -> [{ key, from, to }]
const skipped = [];

for (const key of keys) {
  const value = overrides[key];
  const current = getDefault(key);

  if (isLocked(key)) {
    skipped.push([key, "locked — should never have been stored"]);
    continue;
  }
  if (current === undefined) {
    skipped.push([key, "no longer exists in the data"]);
    continue;
  }
  if (current === value) continue; // already baked

  if (key in SITE_COPY) {
    skipped.push([key, "hand-written page copy — update the HTML and SITE_COPY by hand"]);
    continue;
  }

  const file = FILES[key.split(".")[0]];
  if (!file) {
    skipped.push([key, "unknown data module"]);
    continue;
  }
  if (!edits.has(file)) edits.set(file, []);
  edits.get(file).push({ key, from: current, to: value });
}

let applied = 0;

for (const [file, list] of edits) {
  let source = await readFile(file, "utf8");

  for (const { key, from, to } of list) {
    const needle = JSON.stringify(from);
    const occurrences = source.split(needle).length - 1;

    if (occurrences === 0) {
      skipped.push([key, `current text not found verbatim in ${file}`]);
      continue;
    }
    if (occurrences > 1) {
      skipped.push([key, `text appears ${occurrences}× in ${file} — too ambiguous to rewrite safely`]);
      continue;
    }

    source = source.replace(needle, JSON.stringify(to));
    applied += 1;
    console.log(`  ${write ? "baked" : "would bake"}  ${key}`);
  }

  if (write) await writeFile(file, source);
}

if (skipped.length) {
  console.log("\nNeeds a human:");
  for (const [key, reason] of skipped) console.log(`  ${key} — ${reason}`);
}

console.log(
  `\n${write ? "Baked" : "Would bake"} ${applied} of ${keys.length} override(s).` +
    (write
      ? "\nNow run: npm run verify, commit, deploy, then clear the overrides so the store and the build agree."
      : "\nRe-run with --write to apply.")
);
