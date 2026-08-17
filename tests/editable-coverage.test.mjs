import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import { FONT_THEMES, getDefault, isAllowedValue, isEditable } from "../data/editable.mjs";
import { GENERATED_COPY } from "../data/site-copy.generated.mjs";
import { formatPrice, membershipPrice, prices } from "../data/pricing.mjs";
import { reviews } from "../data/reviews.mjs";
import { keyFor } from "../scripts/annotate-editable.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);

const collectHtml = async (directory = root, depth = 0) => {
  const skip = new Set(["node_modules", ".git", ".context", ".vercel", "assets", "tests", "scripts", "data", "api", "admin"]);
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory() && depth < 3) files.push(...(await collectHtml(full, depth + 1)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
};

const pages = new Map(
  await Promise.all(
    (await collectHtml()).map(async (file) => [file.slice(root.length + 1), await readFile(file, "utf8")])
  )
);

const keysIn = (html) => [...html.matchAll(/data-copy-key="([^"]+)"/g)].map((match) => match[1]);

test("every page is editable, not just the generated ones", () => {
  // The failure this exists for: the clinic signs in, clicks a headline on the
  // homepage and nothing happens, because only the service pages were annotated.
  // The floor is deliberately low — thank-you is a nine-line confirmation page
  // and fully covered at 16 — so this catches "nothing was annotated", not size.
  for (const [page, html] of pages) {
    assert.ok(keysIn(html).length >= 12, `${page} exposes only ${keysIn(html).length} editable strings`);
  }
});

test("a hashed key always matches the copy it was minted from", () => {
  // This is what makes reordering a page safe. If a key could drift from its
  // text, an override would land on whichever element inherited the key.
  for (const [key, value] of Object.entries(GENERATED_COPY)) {
    assert.equal(key, keyFor(value), `${key} no longer hashes its own default`);
  }
});

test("every hashed key on a page resolves to a default", () => {
  for (const [page, html] of pages) {
    for (const key of keysIn(html)) {
      if (!key.startsWith("text.")) continue;
      assert.notEqual(getDefault(key), undefined, `${page}: ${key} is on the page but resolves to nothing`);
    }
  }
});

test("locked content is never annotated, whatever tag it renders in", () => {
  // The key-based lock in data/editable.mjs cannot see a hashed key, so the
  // annotator excludes this content structurally. This checks it actually did.
  const guarded = [
    ...reviews.map((review) => review.quote),
    ...[...prices, membershipPrice].map(formatPrice),
    getDefault("team.ali-komeili.credentials"),
    getDefault("team.peggy-chen.scopeNote"),
  ].filter(Boolean);

  for (const value of guarded) {
    assert.equal(
      Object.hasOwn(GENERATED_COPY, keyFor(value)),
      false,
      `protected content was made editable: "${value.slice(0, 60)}…"`
    );
  }
});

test("the font setting accepts its own themes and nothing else", () => {
  assert.ok(isEditable("site.theme.fonts"));
  for (const theme of Object.keys(FONT_THEMES)) {
    assert.ok(isAllowedValue("site.theme.fonts", theme), `${theme} should be selectable`);
  }
  for (const bogus of ['"><script>alert(1)</script>', "helvetica", ""]) {
    assert.equal(isAllowedValue("site.theme.fonts", bogus), false, `${bogus} must be refused`);
  }
  // The constraint is on settings keys only — prose stays prose.
  assert.ok(isAllowedValue("site.home.hero.eyebrow", "Anything the clinic likes"));
});

test("the editor starts idle and has to be switched on", async () => {
  // Signing in must not arm the page. With every heading now editable, an
  // editor that starts live turns any stray click into a text field.
  const editor = await readFile(join(root, "assets/js/editor.js"), "utf8");

  assert.match(editor, /editing:\s*false/, "state must start with editing off");
  assert.doesNotMatch(
    editor,
    /classList\.add\("anima-editing"\)/,
    "nothing may switch editing on directly — go through setEditing"
  );
  assert.match(editor, /setEditing\(false\)/, "init must leave the editor idle");
});

test("every font theme is styled and allowlisted, with no picker in the toolbar", async () => {
  const css = await readFile(join(root, "assets/css/medspa.css"), "utf8");
  const editor = await readFile(join(root, "assets/js/editor.js"), "utf8");
  const runtime = await readFile(join(root, "assets/js/medspa.js"), "utf8");

  for (const theme of Object.keys(FONT_THEMES)) {
    // `classic` is the :root default and needs no block of its own.
    if (theme !== "classic") {
      assert.match(css, new RegExp(`\\[data-font-theme="${theme}"\\]`), `${theme} has no CSS`);
    }
    // The runtime still honours a stored theme even though nothing in the UI
    // can set one, so an unrecognised value must still be refused.
    assert.ok(runtime.includes(`"${theme}"`), `${theme} is missing from the runtime allowlist`);
  }

  // Typography is a design decision, not day-to-day copy — the clinic has no
  // control for it, and putting one back is a deliberate act, not a slip.
  assert.doesNotMatch(editor, /data-editor-fonts/, "the toolbar must not offer a font picker");
});
