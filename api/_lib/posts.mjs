/**
 * Posts written in the browser composer, stored beside the copy overrides.
 *
 * A separate hash from `anima:copy` because these are whole records rather than
 * single strings, and because listing them must not drag the entire override map
 * along with it.
 *
 * Slugs of posts committed to the repo are reserved: a stored post can never
 * shadow a static page, since Vercel serves the file from disk first and the
 * stored copy would simply be unreachable. Rejecting the collision at write time
 * is the difference between "you cannot use that address" and a post that saves
 * successfully and then silently never appears.
 */
import { postsNewestFirst } from "../../data/blog.mjs";
import { normalizePost, sortPosts } from "../../data/post-schema.mjs";
import { command, readHash } from "./store.mjs";

const HASH = "anima:posts";

export const STATIC_SLUGS = new Set(postsNewestFirst.map((post) => post.slug));

export const readPosts = async () => {
  const map = await readHash(HASH);
  return Object.values(map)
    .map((raw) => {
      try {
        return normalizePost(JSON.parse(raw));
      } catch {
        // One unparseable row must not take the whole journal down with it.
        return null;
      }
    })
    .filter(Boolean);
};

export const readPost = async (slug) => {
  const raw = await command(["HGET", HASH, slug]);
  if (!raw) return null;
  try {
    return normalizePost(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const writePost = (post) => command(["HSET", HASH, post.slug, JSON.stringify(post)]);

export const deletePost = (slug) => command(["HDEL", HASH, slug]);

/**
 * The journal as a visitor sees it: repo posts plus published stored ones,
 * pinned first and then newest. Drafts are dropped here rather than in each
 * caller, so there is one place a draft can leak from.
 */
export const publishedPosts = (stored) =>
  sortPosts([...postsNewestFirst, ...stored.filter((post) => post.status !== "draft")]);
