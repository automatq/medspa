import { normalizePost, parseBody, slugify, validatePost } from "../../data/post-schema.mjs";
import { requireAdmin } from "../_lib/auth.mjs";
import { STATIC_SLUGS, deletePost, readPost, readPosts, writePost } from "../_lib/posts.mjs";

/**
 * Create, list, update and delete composer-written posts.
 *
 * GET    — every stored post, drafts included, for the composer's own list
 * POST   — create; fails if the slug is taken
 * PUT    — update an existing post at ?slug=
 * DELETE — remove ?slug=
 *
 * The gates mirror api/admin/copy.js, and exist for the same reason: this is the
 * one path into the site that never passes through a build, so every check the
 * build performs has to be repeated here. `validatePost` carries the
 * banned-content sweep that tests/content-integrity.test.mjs performs on
 * generated HTML.
 *
 * Slugs are never changed by an update. A published URL that silently moves is a
 * broken link for anyone who shared it; renaming means deleting and recreating,
 * which at least makes the consequence visible.
 */
const clean = (value, fallback = "") => (typeof value === "string" ? value.trim() : fallback);

const fromRequest = (body, { slug }) => {
  const title = clean(body.title);
  return normalizePost({
    title,
    slug,
    deck: clean(body.deck),
    heroAlt: clean(body.heroAlt),
    published: clean(body.published),
    readMinutes: Number(body.readMinutes) || 0,
    body: parseBody(body.bodyText ?? ""),
    image: clean(body.image) || undefined,
    relatedServiceSlugs: Array.isArray(body.relatedServiceSlugs)
      ? body.relatedServiceSlugs.filter((entry) => typeof entry === "string").slice(0, 6)
      : [],
    pinned: Boolean(body.pinned),
    status: body.status === "draft" ? "draft" : "published",
    seoTitle: clean(body.seoTitle) || undefined,
    metaDescription: clean(body.metaDescription) || undefined,
  });
};

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      const posts = await readPosts();
      return res.status(200).json({ posts, staticSlugs: [...STATIC_SLUGS] });
    }

    if (req.method === "DELETE") {
      const slug = String(req.query.slug || "");
      if (!(await readPost(slug))) return res.status(404).json({ error: "No such post" });
      await deletePost(slug);
      return res.status(200).json({ ok: true, slug });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const payload = req.body || {};

      const slug =
        req.method === "PUT"
          ? String(req.query.slug || "")
          : slugify(clean(payload.slug) || clean(payload.title));

      if (!slug) return res.status(400).json({ error: "Give the post a title first" });

      const existing = await readPost(slug);
      if (req.method === "POST" && (existing || STATIC_SLUGS.has(slug))) {
        return res.status(409).json({ error: `/blog/${slug}/ is already taken — choose another web address` });
      }
      if (req.method === "PUT" && !existing) return res.status(404).json({ error: "No such post" });

      const post = fromRequest(payload, { slug });
      // An update keeps the original publish date unless one was supplied, and
      // stamps dateModified today — the build scripts avoid `new Date()` for
      // reproducibility, but a runtime save has a genuine "now" to record.
      if (existing && !clean(payload.published)) post.published = existing.published;
      post.updated = new Date().toISOString().slice(0, 10);

      const problem = validatePost(post, {
        reservedSlugs: req.method === "POST" ? STATIC_SLUGS : new Set(),
      });
      if (problem) return res.status(422).json({ error: problem });

      await writePost(post);
      return res.status(req.method === "POST" ? 201 : 200).json({ post });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(502).json({ error: `Could not reach the store: ${error.message}` });
  }
}
