import { mkdir, writeFile } from "node:fs/promises";
import { posts, postsNewestFirst } from "../data/blog.mjs";
import { renderIndex, renderPost } from "./blog-render.mjs";

/**
 * Writes the journal pages for posts committed to the repo. The rendering lives
 * in blog-render.mjs because api/blog/[slug].js renders composer-written posts
 * with the same functions.
 *
 * Blog pagination must not wrap: a "next" link from the newest post back to the
 * oldest reads as broken. Services wrap; posts are a timeline.
 */
await mkdir("blog", { recursive: true });
await writeFile("blog/index.html", renderIndex(postsNewestFirst));

for (const [index, post] of postsNewestFirst.entries()) {
  await mkdir(`blog/${post.slug}`, { recursive: true });
  await writeFile(
    `blog/${post.slug}/index.html`,
    renderPost(post, {
      newer: index > 0 ? postsNewestFirst[index - 1] : null,
      older: index < postsNewestFirst.length - 1 ? postsNewestFirst[index + 1] : null,
    })
  );
}

console.log(`Generated the journal index and ${posts.length} posts.`);
