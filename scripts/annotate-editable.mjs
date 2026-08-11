import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { LOCKED_KEYS, getDefault } from "../data/editable.mjs";
import { formatPrice, membershipPrice, prices } from "../data/pricing.mjs";
import { reviews } from "../data/reviews.mjs";

/**
 * Makes every page editable, without hand-annotating 400 call sites.
 *
 * The generators already stamp semantic keys (`services.botox-dysport.intro`)
 * wherever a data module backs the text. Everything else — the hand-written root
 * pages, the shell, the prose the generators emit inline — had no key at all, so
 * the clinic could sign in, click a headline, and nothing happened.
 *
 * This runs after the build and annotates what is left. A key is the hash of the
 * text itself, `text.<hash>`, which buys three things a positional key cannot:
 *
 *   - Reordering a page cannot make an override land on the wrong element. A key
 *     only ever matches the text it was minted from.
 *   - Rewriting the source text in a deploy retires the old key, so the stale
 *     override falls away instead of masking the new copy.
 *   - Identical labels share a key, so renaming "Book now" renames all of them.
 *
 * Defaults are written to data/site-copy.generated.mjs rather than duplicated by
 * hand, so what the API calls "the original" is by construction what the page
 * actually shipped with.
 *
 *   node scripts/annotate-editable.mjs
 */

const SKIP_DIRS = new Set(["node_modules", ".git", ".context", "admin", "assets", "scripts", "data", "api", "tests"]);

/** Elements whose text is prose a human would want to reword. */
const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "a", "button", "dd", "dt", "figcaption", "summary", "label", "strong"];

/**
 * Regions the editor must never reach into. Reviews and prices are locked in
 * data/editable.mjs, but that guard keys off the *key*, and a hash key would
 * sail straight past it — so they are excluded here, structurally, as well.
 */
const EXCLUDED_BLOCKS = [
  /<head\b[\s\S]*?<\/head>/gi,
  /<script\b[\s\S]*?<\/script>/gi,
  /<style\b[\s\S]*?<\/style>/gi,
  /<svg\b[\s\S]*?<\/svg>/gi,
  /<noscript\b[\s\S]*?<\/noscript>/gi,
  // Verbatim Google reviews — editing one is falsification.
  /<figure class="review-quote"[\s\S]*?<\/figure>/gi,
  /<blockquote\b[\s\S]*?<\/blockquote>/gi,
  // Published prices carry a freshness check and a drug-advertising prohibition.
  /<[a-z]+[^>]*class="[^"]*\bprice-amount\b[^"]*"[\s\S]*?<\/[a-z]+>/gi,
  /<[a-z]+[^>]*class="[^"]*\btreatment-pricing-notice\b[^"]*"[\s\S]*?<\/[a-z]+>/gi,
];

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–" };

/** The browser hands the editor `node.textContent`, so defaults must match that. */
const decodeEntities = (value) =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);

export const keyFor = (text) => `text.${createHash("sha256").update(text).digest("hex").slice(0, 12)}`;

/**
 * Strings that must stay exactly as deployed, gathered from the data modules
 * rather than guessed from markup — a review quote is protected because it is a
 * review, not because of the tag it happens to render in.
 */
const protectedText = () => {
  const guarded = new Set();
  for (const review of reviews) {
    guarded.add(review.quote);
    guarded.add(review.author);
  }
  for (const price of [...prices, membershipPrice]) {
    guarded.add(formatPrice(price));
    guarded.add(String(price.amount));
  }
  for (const key of LOCKED_KEYS) {
    const value = getDefault(key);
    if (value) guarded.add(value);
  }
  return guarded;
};

const rangesToSkip = (html) => {
  const ranges = [];
  for (const pattern of EXCLUDED_BLOCKS) {
    for (const match of html.matchAll(pattern)) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }
  return ranges;
};

const inRange = (ranges, index) => ranges.some(([start, end]) => index >= start && index < end);

/** Text worth an editing affordance: real words, not a lone "↗" or a bare number. */
const isProse = (text) => text.length >= 2 && /[a-z]/i.test(text);

const annotate = (html, guarded, collected) => {
  const skip = rangesToSkip(html);
  // `[^<]*` keeps this to leaf elements on purpose. The editor commits
  // `textContent`, which would flatten any nested markup — a link wrapping an
  // arrow span would lose the span the first time it was edited.
  const pattern = new RegExp(`<(${TAGS.join("|")})\\b([^>]*)>([^<]*)<\\/\\1>`, "gi");

  return html.replace(pattern, (match, tag, attributes, inner, index) => {
    if (inRange(skip, index)) return match;

    const existing = attributes.match(/\bdata-copy-key="([^"]*)"/i)?.[1];
    // A generator already claimed this one with a key a data module resolves.
    if (existing && !existing.startsWith("text.")) return match;

    const text = decodeEntities(inner).trim();
    if (!isProse(text) || guarded.has(text)) return match;

    // Every run re-derives the key from the text on the page, so editing copy at
    // source retires the old key instead of leaving it pointing at wording that
    // no longer exists — and so a re-run never drops defaults it did not mint.
    const key = keyFor(text);
    collected.set(key, text);
    if (existing === key) return match;

    const cleaned = attributes.replace(/\s*\bdata-copy-key="[^"]*"/i, "");
    return `<${tag}${cleaned} data-copy-key="${key}">${inner}</${tag}>`;
  });
};

const htmlFiles = async (dir, found = []) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await htmlFiles(path, found);
    else if (entry.name.endsWith(".html")) found.push(path);
  }
  return found;
};

const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

export const annotateSite = async () => {
  const files = (await htmlFiles(root)).sort();
  const guarded = protectedText();
  const collected = new Map();
  let touched = 0;

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const next = annotate(html, guarded, collected);
    if (next !== html) {
      await writeFile(file, next);
      touched += 1;
    }
  }

  const entries = [...collected].sort(([a], [b]) => a.localeCompare(b));
  const module = `// Generated by scripts/annotate-editable.mjs — do not edit by hand.
//
// Every \`text.<hash>\` key the pages carry, mapped to the copy that shipped with
// this build. data/editable.mjs resolves keys through here, so the API can tell
// a real key from an invented one and "reset" can put the original back.

export const GENERATED_COPY = {
${entries.map(([key, value]) => `  "${key}": ${JSON.stringify(value)},`).join("\n")}
};
`;

  await writeFile(`${root}/data/site-copy.generated.mjs`, module);
  return { touched, files: files.length, strings: entries.length };
};

// Importing this from the tests must not rewrite the site as a side effect.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { touched, files, strings } = await annotateSite();
  console.log(`Annotated ${touched} of ${files} pages; ${strings} editable strings.`);
}
