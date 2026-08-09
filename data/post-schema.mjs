/**
 * One definition of what a journal post is, shared by the static build and the
 * browser composer.
 *
 * `data/blog.mjs` holds the six ported posts and is authored by hand; the
 * composer at /admin/posts/ writes records into the store at runtime. Both go
 * through `normalizePost`, so a post written in the browser renders through the
 * exact same code path as one committed to the repo — there is no second-class
 * post type and no second renderer to keep in sync.
 *
 * The body vocabulary is the closed set `renderBlocks` already understands
 * (p, h2, h3, ul, ol, note, quote) with the three inline markers
 * `[label](/href)`, `**bold**` and `*italic*`. Composer input is plain text and
 * is *parsed* into that vocabulary rather than accepted as markup, which is why
 * a pasted `<script>` can only ever become paragraph text: `inline()` escapes
 * first and re-enables exactly three constructs afterwards.
 */
import { bannedReason } from "./banned-content.mjs";

export const BLOCK_TYPES = new Set(["p", "h2", "h3", "ul", "ol", "note", "quote"]);
const LIST_TYPES = new Set(["ul", "ol"]);

/** Slugs the composer may not take, because a static page already owns the URL. */
export const RESERVED_SLUGS = new Set(["index", "new", "admin", "api"]);

export const MAX = {
  title: 160,
  deck: 400,
  heroAlt: 300,
  slug: 80,
  blocks: 200,
  body: 40000,
  readMinutes: 60,
};

export const slugify = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX.slug)
    .replace(/-+$/g, "");

/**
 * Fills in everything derivable so callers never branch on shape. Mirrors the
 * defaults `data/blog.mjs` used to apply inline — that module now calls this.
 *
 * `imageStem` names a build-time image set under /assets/img/blog/; `image`
 * holds an absolute URL from an upload. A post has one or the other, and
 * `postImage()` in components.mjs is the single place that decides which.
 */
export const normalizePost = (record) => ({
  category: "tips-tricks",
  relatedServiceSlugs: [],
  readMinutes: 4,
  pinned: false,
  status: "published",
  ...record,
  updated: record.updated || record.published,
  imageStem: record.imageStem || record.slug,
  seoTitle: record.seoTitle || `${record.title} | Anima Med Spa`,
  metaDescription: record.metaDescription || record.deck,
});

/* ------------------------------------------------------------------- body */

const LIST_ITEM = /^[-*]\s+(.*)$/;
const ORDERED_ITEM = /^\d+[.)]\s+(.*)$/;

/**
 * Plain text in, blocks out. Blank lines separate blocks; a leading marker
 * picks the type. Deliberately small — the composer shows this legend verbatim,
 * so anything added here has to be explainable in one line.
 */
export const parseBody = (text) => {
  const chunks = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk) => {
    const lines = chunk.split("\n").map((line) => line.trim());

    if (lines.every((line) => LIST_ITEM.test(line))) {
      return { type: "ul", items: lines.map((line) => line.match(LIST_ITEM)[1].trim()) };
    }
    if (lines.every((line) => ORDERED_ITEM.test(line))) {
      return { type: "ol", items: lines.map((line) => line.match(ORDERED_ITEM)[1].trim()) };
    }

    const joined = lines.join(" ").trim();
    if (joined.startsWith("### ")) return { type: "h3", text: joined.slice(4).trim() };
    if (joined.startsWith("## ")) return { type: "h2", text: joined.slice(3).trim() };
    if (joined.startsWith("!> ")) return { type: "note", text: joined.slice(3).trim() };
    if (joined.startsWith("> ")) return { type: "quote", text: joined.slice(2).trim() };
    return { type: "p", text: joined };
  });
};

/** Inverse of `parseBody`, so the composer can reopen a saved post for editing. */
export const serializeBody = (blocks = []) =>
  blocks
    .map((block) => {
      switch (block.type) {
        case "h2":
          return `## ${block.text}`;
        case "h3":
          return `### ${block.text}`;
        case "note":
          return `!> ${block.text}`;
        case "quote":
          return `> ${block.text}`;
        case "ul":
          return block.items.map((item) => `- ${item}`).join("\n");
        case "ol":
          return block.items.map((item, index) => `${index + 1}. ${item}`).join("\n");
        default:
          return block.text;
      }
    })
    .join("\n\n");

/** Every human-readable string in a post, for the banned-content sweep. */
const textOf = (post) => [
  post.title,
  post.deck,
  post.heroAlt,
  post.seoTitle,
  post.metaDescription,
  ...(post.body ?? []).flatMap((block) => (LIST_TYPES.has(block.type) ? block.items ?? [] : [block.text])),
];

/* -------------------------------------------------------------- validation */

const isIsoDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/**
 * Returns `null` when the record may be stored, or a message explaining why not.
 *
 * The banned-content sweep is the reason this runs on the server and not only in
 * the composer: `tests/content-integrity.test.mjs` can only see the generated
 * HTML, and a runtime post never passes through a build.
 */
export const validatePost = (record, { reservedSlugs = new Set() } = {}) => {
  if (!record || typeof record !== "object") return "Post data is missing";

  const string = (field, limit, label) => {
    const value = record[field];
    if (typeof value !== "string" || !value.trim()) return `${label} is required`;
    if (value.length > limit) return `${label} is too long — ${limit} characters maximum`;
    return null;
  };

  const problem =
    string("title", MAX.title, "Title") ||
    string("deck", MAX.deck, "Summary") ||
    string("heroAlt", MAX.heroAlt, "Image description");
  if (problem) return problem;

  if (typeof record.slug !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(record.slug)) {
    return "Web address may use lowercase letters, numbers and hyphens only";
  }
  if (record.slug.length > MAX.slug) return `Web address is too long — ${MAX.slug} characters maximum`;
  if (RESERVED_SLUGS.has(record.slug)) return `"${record.slug}" is reserved — choose another web address`;
  if (reservedSlugs.has(record.slug)) {
    return `A published post already uses /blog/${record.slug}/ — choose another web address`;
  }

  if (!isIsoDate(record.published)) return "Publish date must be a real date";

  const minutes = Number(record.readMinutes);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX.readMinutes) {
    return `Read time must be a whole number between 1 and ${MAX.readMinutes}`;
  }

  if (!Array.isArray(record.body) || record.body.length === 0) return "The post needs some body text";
  if (record.body.length > MAX.blocks) return `That is a lot of post — ${MAX.blocks} blocks maximum`;

  for (const block of record.body) {
    if (!BLOCK_TYPES.has(block?.type)) return `Unsupported block: ${block?.type}`;
    if (LIST_TYPES.has(block.type)) {
      if (!Array.isArray(block.items) || block.items.length === 0) return "A list has no items";
      if (block.items.some((item) => typeof item !== "string" || !item.trim())) return "A list has an empty item";
    } else if (typeof block.text !== "string" || !block.text.trim()) {
      return `An empty ${block.type} block — delete it or write something in it`;
    }
  }

  const strings = textOf(record).filter(Boolean);
  if (strings.join("").length > MAX.body) return `The post is too long — ${MAX.body} characters maximum`;

  if (record.image !== undefined && record.image !== "" && !/^https:\/\//.test(String(record.image))) {
    return "The image must be uploaded through the composer";
  }
  if (record.status !== undefined && !["published", "draft"].includes(record.status)) {
    return "Status must be published or draft";
  }

  for (const value of strings) {
    const banned = bannedReason(value);
    if (banned) {
      return `"${banned.needle}" cannot be published here — ${banned.reason}. This was removed from the site deliberately.`;
    }
  }

  return null;
};

/**
 * Display order everywhere: pinned first, then newest. Slug breaks ties so two
 * posts published the same day never swap places between renders.
 */
export const sortPosts = (posts) =>
  [...posts].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    if (a.published !== b.published) return a.published < b.published ? 1 : -1;
    return a.slug < b.slug ? -1 : 1;
  });
