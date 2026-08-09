import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import { bannedReason, BANNED_CONTENT } from "../data/banned-content.mjs";
import { getDefault, isEditable, isLocked, isWellFormedKey, LOCKED_KEYS } from "../data/editable.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);

const collectHtml = async (directory = root, depth = 0) => {
  const skip = new Set(["node_modules", ".git", ".context", ".vercel", "assets", "tests", "scripts", "data", "api"]);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory() && depth < 3) files.push(...(await collectHtml(full, depth + 1)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
};

const files = await collectHtml();
const pages = new Map(
  await Promise.all(files.map(async (file) => [file.slice(root.length + 1), await readFile(file, "utf8")]))
);

const emittedKeys = new Set();
for (const html of pages.values()) {
  for (const match of html.matchAll(/data-copy-key="([^"]+)"/g)) emittedKeys.add(match[1]);
}

test("the site emits editable keys at all", () => {
  // Guards against a generator refactor silently dropping every `ed()` call and
  // leaving the clinic with an editor that can edit nothing.
  assert.ok(emittedKeys.size > 200, `expected a substantial number of keys, found ${emittedKeys.size}`);
});

test("every emitted key resolves to the text actually on the page", () => {
  for (const key of emittedKeys) {
    assert.ok(isWellFormedKey(key), `${key}: malformed`);
    assert.notEqual(getDefault(key), undefined, `${key}: emitted but resolves to nothing`);
  }
});

test("no locked key is ever emitted as editable", () => {
  // Locked keys are compliance positions, not copy. If one reaches the HTML the
  // clinic sees an edit affordance the API will refuse — confusing at best, and
  // a sign the lock list and the generators have drifted apart.
  for (const key of emittedKeys) {
    assert.ok(!isLocked(key), `${key} is locked but was emitted as editable`);
  }
});

test("the lock list still points at real content", () => {
  // A rename in data/team.mjs would otherwise turn a lock into a no-op silently.
  for (const key of LOCKED_KEYS) {
    assert.notEqual(getDefault(key), undefined, `${key} is locked but no longer exists — the lock is now a no-op`);
  }
});

test("reviews and prices cannot be edited", () => {
  // The two categories that must never be runtime-editable: reviews are verbatim
  // third-party statements, and prices are guarded by the freshness and
  // prescription-drug tests that only run at build time.
  assert.equal(isEditable("reviews.0.text.0"), false);
  assert.equal(isEditable("pricing.carbon-laser-peel.amount"), false);
  assert.equal(isEditable("team.ali-komeili.role"), false);
  assert.equal(isEditable("team.peggy-chen.scopeNote"), false);
});

test("key resolution rejects traversal and non-string values", () => {
  for (const key of ["../../etc/passwd", "services.__proto__.intro", "services..intro", ""]) {
    assert.equal(getDefault(key), undefined, `${key} must not resolve`);
  }
  // Objects and arrays are not editable text.
  assert.equal(getDefault("services.botox-dysport.quickFacts"), undefined);
  assert.equal(getDefault("services.botox-dysport.concerns"), undefined);
});

test("the API rejects every phrase the build-time guard bans", () => {
  // content-integrity.test.mjs checks the built HTML; it cannot see a runtime
  // edit. This asserts the same list is enforced on save, so the editor cannot
  // reintroduce anything the rebuild removed.
  for (const [needle] of BANNED_CONTENT) {
    assert.ok(bannedReason(`prefix ${needle} suffix`), `"${needle}" must be rejected on save`);
    assert.ok(bannedReason(needle.toLowerCase()), `"${needle}" must be rejected case-insensitively`);
  }
  assert.equal(bannedReason("A perfectly ordinary sentence about facials."), null);
});

test("the editor bundle is not loaded by ordinary visitors", () => {
  // The whole point of the dynamic import: a public page must reference the
  // editor only inside the cookie-gated branch, never as a <script> tag.
  for (const [file, html] of pages) {
    if (file.startsWith("admin/")) continue;
    assert.ok(!/<script[^>]+editor\.js/.test(html), `${file}: editor.js must not be a page script`);
    assert.ok(!/<link[^>]+editor\.css/.test(html), `${file}: editor.css must not be a page stylesheet`);
  }
});

test("the admin page is noindex", async () => {
  const html = pages.get("admin/index.html");
  assert.ok(html, "admin/index.html is missing");
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
});
