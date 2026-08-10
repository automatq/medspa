import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { STATIC_SLUGS, publishedPosts } from "../api/_lib/posts.mjs";
import { postsNewestFirst } from "../data/blog.mjs";
import { normalizePost, parseBody, serializeBody, slugify, sortPosts, validatePost } from "../data/post-schema.mjs";
import { renderPost } from "../scripts/blog-render.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);

/** A composer-written post: uploaded image URL rather than a build-time stem. */
const composed = (overrides = {}) =>
  normalizePost({
    title: "A new treatment note",
    slug: "a-new-treatment-note",
    deck: "What this treatment does, and what it does not.",
    heroAlt: "A treatment room at the clinic",
    published: "2026-08-09",
    readMinutes: 5,
    image: "https://blob.vercel-storage.com/hero.webp",
    body: [{ type: "p", text: "Body copy." }],
    ...overrides,
  });

test("parseBody covers the whole block vocabulary", () => {
  const blocks = parseBody(
    [
      "## A heading",
      "### A smaller heading",
      "A paragraph that\nwraps across lines.",
      "- first\n- second",
      "1. one\n2. two",
      "> a quotation",
      "!> a note box",
    ].join("\n\n")
  );

  assert.deepEqual(blocks, [
    { type: "h2", text: "A heading" },
    { type: "h3", text: "A smaller heading" },
    { type: "p", text: "A paragraph that wraps across lines." },
    { type: "ul", items: ["first", "second"] },
    { type: "ol", items: ["one", "two"] },
    { type: "quote", text: "a quotation" },
    { type: "note", text: "a note box" },
  ]);
});

test("a post reopens in the composer as the text it was written in", () => {
  const source = [
    "## Heading",
    "A paragraph.",
    "- one\n- two",
    "1. first\n2. second",
    "> quoted",
    "!> noted",
  ].join("\n\n");

  assert.equal(serializeBody(parseBody(source)), source);
});

test("markup pasted into the composer becomes text, never markup", () => {
  const blocks = parseBody('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
  assert.deepEqual(
    blocks.map((block) => block.type),
    ["p", "p"]
  );

  const html = renderPost(composed({ body: blocks }));
  assert.ok(!html.includes("<script>alert(1)</script>"), "a pasted script tag must be escaped");
  assert.ok(html.includes("&lt;script&gt;"), "it should render as visible text instead");
  // The payload survives as characters — what must not survive is a tag. With the
  // angle brackets escaped there is no element for the attribute to sit on.
  assert.ok(!html.includes("<img src=x"), "attribute injection must not form an element");
  assert.ok(html.includes("&lt;img src=x onerror=alert(1)&gt;"), "it renders as inert text");
});

test("a composer post renders through the same page as a repo post", () => {
  const html = renderPost(composed(), { newer: null, older: postsNewestFirst[0] });

  assert.ok(html.includes('<body class="page-blog-post" data-post="a-new-treatment-note">'));
  assert.ok(html.includes("https://blob.vercel-storage.com/hero.webp"), "uses the uploaded image");
  assert.ok(!html.includes("/assets/img/blog/a-new-treatment-note"), "must not invent a build-time image path");
  assert.ok(html.includes('"@type":"BlogPosting"'), "carries the same structured data");
  assert.ok(html.includes("medical-disclaimer"), "carries the same medical disclaimer");
  assert.ok(html.includes(postsNewestFirst[0].title), "pagination reaches the repo posts");
});

test("validatePost accepts a well-formed post", () => {
  assert.equal(validatePost(composed()), null);
});

test("validatePost refuses content the build would have refused", () => {
  // The build-time sweep in content-integrity.test.mjs cannot see a runtime post,
  // so this is the only thing standing between the store and a banned phrase.
  const problem = validatePost(composed({ body: [{ type: "p", text: "Ask for Dr. Komeili at reception." }] }));
  assert.match(problem ?? "", /restricted title/);

  assert.match(validatePost(composed({ title: "Premier Med Spa" })) ?? "", /superlative/);
  assert.match(validatePost(composed({ deck: "Rated 4.9/5 by clients" })) ?? "", /unverifiable rating/);
});

test("validatePost rejects malformed records", () => {
  const cases = [
    [{ title: "" }, /Title is required/],
    [{ deck: "" }, /Summary is required/],
    [{ heroAlt: "" }, /Image description is required/],
    [{ slug: "Not A Slug" }, /lowercase letters/],
    [{ slug: "index" }, /reserved/],
    [{ published: "not-a-date" }, /real date/],
    [{ published: "2026-13-45" }, /real date/],
    [{ readMinutes: 0 }, /between 1 and 60/],
    [{ readMinutes: 2.5 }, /between 1 and 60/],
    [{ body: [] }, /needs some body text/],
    [{ body: [{ type: "marquee", text: "no" }] }, /Unsupported block/],
    [{ body: [{ type: "p", text: "   " }] }, /empty p block/],
    [{ body: [{ type: "ul", items: [] }] }, /list has no items/],
    [{ image: "http://insecure.example/x.png" }, /uploaded through the composer/],
    [{ status: "sideways" }, /published or draft/],
  ];

  for (const [overrides, expected] of cases) {
    const problem = validatePost(composed(overrides));
    assert.match(problem ?? "", expected, `expected ${expected} for ${JSON.stringify(overrides)}`);
  }
});

test("a stored post may not shadow a page built into the repo", () => {
  // Vercel serves the static file first, so a colliding slug would save happily
  // and then never be reachable.
  const taken = postsNewestFirst[0].slug;
  assert.ok(STATIC_SLUGS.has(taken));
  assert.match(validatePost(composed({ slug: taken }), { reservedSlugs: STATIC_SLUGS }) ?? "", /already uses/);
});

test("slugify produces addressable slugs", () => {
  assert.equal(slugify("Réverse the Summer Damage!"), "reverse-the-summer-damage");
  assert.equal(slugify("   spaced   out   "), "spaced-out");
  assert.equal(slugify("---"), "");
  assert.ok(slugify("x".repeat(200)).length <= 80);
});

test("pinned posts lead, then newest first", () => {
  const sorted = sortPosts([
    composed({ slug: "old", published: "2020-01-01" }),
    composed({ slug: "new", published: "2026-08-09" }),
    composed({ slug: "pinned", published: "2019-01-01", pinned: true }),
  ]);

  assert.deepEqual(
    sorted.map((post) => post.slug),
    ["pinned", "new", "old"]
  );
});

test("same-day posts keep a stable order", () => {
  const day = { published: "2026-08-09" };
  const order = () =>
    sortPosts([composed({ slug: "beta", ...day }), composed({ slug: "alpha", ...day })]).map((p) => p.slug);
  assert.deepEqual(order(), ["alpha", "beta"]);
  assert.deepEqual(order(), order());
});

test("drafts never reach the public list", () => {
  const merged = publishedPosts([composed({ slug: "draft-post", status: "draft" }), composed({ slug: "live-post" })]);
  const slugs = merged.map((post) => post.slug);

  assert.ok(slugs.includes("live-post"));
  assert.ok(!slugs.includes("draft-post"));
  // Repo posts are still there — the stored ones are merged in, not substituted.
  assert.ok(slugs.includes(postsNewestFirst[0].slug));
  assert.equal(merged.length, postsNewestFirst.length + 1);
});

test("the homepage carries the newest three posts and a link to the rest", async () => {
  const html = await readFile(resolve(root, "index.html"), "utf8");
  const region = html.slice(html.indexOf("<!-- build:journal -->"), html.indexOf("<!-- /build:journal -->"));

  assert.ok(region.includes('data-journal-grid'), "the grid must be findable by the client merge");
  assert.equal(region.match(/class="post-card"/g)?.length, 3);
  assert.ok(region.includes('href="/blog/"'), "links out to the full journal");

  for (const post of sortPosts(postsNewestFirst).slice(0, 3)) {
    assert.ok(region.includes(`/blog/${post.slug}/`), `${post.slug} should be featured`);
  }
});

test("unknown blog slugs fall through to the runtime renderer", async () => {
  const vercel = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));
  assert.deepEqual(vercel.rewrites, [{ source: "/blog/:slug/", destination: "/api/blog/:slug" }]);

  // A rewrite is only reached when no static file matches, which is what keeps
  // the six built posts on the static path.
  assert.ok(vercel.redirects.every((redirect) => redirect.destination !== "/api/blog/:slug"));
});
