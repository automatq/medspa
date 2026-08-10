import { postCategoryById } from "../data/blog.mjs";
import { displayDate, postHref, postImage } from "../scripts/components.mjs";
import { publishedPosts, readPosts } from "./_lib/posts.mjs";

/**
 * The journal card list, read by every visitor on the homepage and /blog/.
 *
 * Cards are pre-formatted here — date string, category label, image URL — so the
 * browser never re-implements formatting that components.mjs already owns. A
 * date formatted twice in two places is a date that eventually disagrees.
 *
 * An empty list means "nothing stored, the built HTML is already correct", which
 * is also what a store failure returns. The pages ship with their cards baked
 * in, so the right degraded behaviour is to leave the DOM alone rather than to
 * blank a grid the visitor can already read.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stored = await readPosts();
    if (stored.length === 0) {
      res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=300");
      return res.status(200).json({ posts: [] });
    }

    const posts = publishedPosts(stored).map((post) => ({
      slug: post.slug,
      href: postHref(post),
      title: post.title,
      deck: post.deck,
      image: postImage(post, 640),
      heroAlt: post.heroAlt,
      category: postCategoryById.get(post.category)?.label ?? "Journal",
      date: displayDate(post.published),
      readMinutes: post.readMinutes,
    }));

    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=300");
    return res.status(200).json({ posts });
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ posts: [] });
  }
}
