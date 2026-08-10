import { renderPost } from "../../scripts/blog-render.mjs";
import { COOKIE_NAME, parseCookies, readSession } from "../_lib/auth.mjs";
import { publishedPosts, readPost, readPosts } from "../_lib/posts.mjs";

/**
 * Serves a post written in the composer.
 *
 * vercel.json rewrites /blog/:slug/ here, and Vercel checks the filesystem
 * before applying a rewrite — so posts committed to the repo are still served as
 * static files and never reach this function. Only slugs with no static page do.
 *
 * Drafts render for a signed-in admin and 404 for everyone else, which is what
 * makes "save without publishing, then look at it" possible.
 */
const notFound = (res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(404).send(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Post not found | Anima Med Spa</title>
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="/assets/css/medspa.css">
</head>
<body class="page-blog-index">
  <main class="section section-paper">
    <div class="narrow" style="text-align:center">
      <p class="eyebrow">Journal</p>
      <h1 class="section-title">That post is not here.</h1>
      <p class="lede">It may have been removed, or the address may be mistyped.</p>
      <p><a class="button button-primary" href="/blog/">Back to the journal</a></p>
    </div>
  </main>
</body>
</html>
`
  );
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = String(req.query.slug || "");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return notFound(res);

  let post;
  let stored;
  try {
    [post, stored] = await Promise.all([readPost(slug), readPosts()]);
  } catch {
    return notFound(res);
  }
  if (!post) return notFound(res);

  if (post.status === "draft") {
    const admin = readSession(parseCookies(req.headers.cookie || "")[COOKIE_NAME]);
    if (!admin) return notFound(res);
  }

  // Pagination spans the merged timeline, so a stored post links to the repo
  // posts either side of it rather than only to other stored ones.
  const timeline = publishedPosts(stored);
  const index = timeline.findIndex((entry) => entry.slug === slug);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    post.status === "draft" ? "no-store" : "public, s-maxage=30, stale-while-revalidate=300"
  );
  return res.status(200).send(
    renderPost(post, {
      newer: index > 0 ? timeline[index - 1] : null,
      older: index >= 0 && index < timeline.length - 1 ? timeline[index + 1] : null,
    })
  );
}
