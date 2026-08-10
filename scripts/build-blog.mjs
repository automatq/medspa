import { mkdir, writeFile } from "node:fs/promises";
import { posts, postsNewestFirst } from "../data/blog.mjs";
import { sortPosts } from "../data/post-schema.mjs";
import { renderIndex, renderPost } from "./blog-render.mjs";

/**
 * Writes the journal pages for posts committed to the repo. The rendering lives
 * in blog-render.mjs because api/blog/[slug].js renders composer-written posts
 * with the same functions.
 *
 * Blog pagination must not wrap: a "next" link from the newest post back to the
 * oldest reads as broken. Services wrap; posts are a timeline.
 */
// One ordering rule everywhere — sortPosts also runs on the homepage band and in
// the runtime list, so a pinned post cannot lead in one place and not another.
const timeline = sortPosts(postsNewestFirst);

await mkdir("blog", { recursive: true });
await writeFile("blog/index.html", renderIndex(timeline));

for (const [index, post] of timeline.entries()) {
  await mkdir(`blog/${post.slug}`, { recursive: true });
  await writeFile(
    `blog/${post.slug}/index.html`,
    renderPost(post, {
      newer: index > 0 ? timeline[index - 1] : null,
      older: index < timeline.length - 1 ? timeline[index + 1] : null,
    })
  );
}

console.log(`Generated the journal index and ${posts.length} posts.`);
