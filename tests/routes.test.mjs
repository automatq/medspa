import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import { postsNewestFirst } from "../data/blog.mjs";
import { campaigns, thankYou } from "../data/campaigns.mjs";
import { extraRedirects } from "../data/redirects.mjs";
import { services } from "../data/services.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);
const read = (file) => readFile(join(root, file), "utf8");
const exists = async (file) => access(join(root, file)).then(() => true, () => false);

const vercel = JSON.parse(await read("vercel.json"));

test("vercel.json matches the redirects derived from data", () => {
  // vercel.json is generated. A hand-edit survives until the next build and then
  // silently vanishes; this comparison is what catches that.
  const expected = [
    ...services.map((item) => ({
      source: new URL(item.legacyUrl).pathname,
      destination: `/services/${item.slug}/`,
      permanent: true,
    })),
    ...extraRedirects,
  ].filter((redirect) => redirect.source !== redirect.destination);

  assert.deepEqual(vercel.redirects, expected);
});

test("every redirect source is a trailing-slash path and appears once", () => {
  const seen = new Set();
  for (const redirect of vercel.redirects) {
    // Vercel normalizes to the trailing-slash form before evaluating redirects.
    assert.ok(redirect.source.endsWith("/"), `${redirect.source} must end with "/"`);
    assert.ok(redirect.source.startsWith("/"), `${redirect.source} must be root-relative`);
    assert.notEqual(redirect.source, redirect.destination, `${redirect.source} redirects to itself`);
    assert.ok(!seen.has(redirect.source), `duplicate redirect source: ${redirect.source}`);
    seen.add(redirect.source);
  }
});

test("redirect destinations do not cost a second hop", () => {
  // cleanUrls + trailingSlash are both on, so a ".html" destination would 308
  // again immediately.
  for (const redirect of vercel.redirects) {
    assert.ok(!redirect.destination.includes(".html"), `${redirect.destination} would redirect a second time`);
  }
});

test("every generated route has an index.html on disk", async () => {
  const routes = [
    "blog",
    "glow-plan",
    "privacy",
    thankYou.slug,
    ...postsNewestFirst.map((post) => `blog/${post.slug}`),
    ...campaigns.map((campaign) => campaign.slug),
    ...services.map((item) => `services/${item.slug}`),
  ];

  for (const route of routes) {
    assert.ok(await exists(`${route}/index.html`), `${route}/index.html is missing`);
  }
});

test("campaign pages are noindex and carry no site chrome", async () => {
  for (const campaign of [...campaigns, thankYou]) {
    const html = await read(`${campaign.slug}/index.html`);
    assert.match(html, /<meta name="robots" content="noindex, follow">/, `${campaign.slug}: must be noindex`);
    // These are ad landing pages; site nav would leak paid traffic away and the
    // mega-menu would dwarf the single call to action.
    assert.ok(!html.includes('class="site-header"'), `${campaign.slug}: must not carry the site header`);
    assert.ok(!html.includes('class="site-footer"'), `${campaign.slug}: must not carry the site footer`);
    assert.ok(html.includes('class="lp-bar"'), `${campaign.slug}: needs the campaign bar`);
    assert.ok(html.includes('class="lp-footer"'), `${campaign.slug}: needs the campaign footer`);
  }
});

test("campaign pages reconcile the tracking number with the clinic's real one", async () => {
  for (const campaign of campaigns) {
    const html = await read(`${campaign.slug}/index.html`);
    assert.ok(html.includes("(437) 747-5119"), `${campaign.slug}: campaign number missing`);
    // An unbranded page showing only an unfamiliar number reads as a scam.
    assert.ok(html.includes("437-770-9296"), `${campaign.slug}: clinic number must also appear`);
    // Schema must always carry the clinic's real line, never the tracking one.
    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    assert.ok(!jsonLd.includes("747-5119"), `${campaign.slug}: tracking number must stay out of JSON-LD`);
  }
});

test("every third-party embed ships a visible fallback", async () => {
  for (const campaign of campaigns) {
    const html = await read(`${campaign.slug}/index.html`);
    const iframes = html.match(/<iframe/g) || [];
    const fallbacks = html.match(/class="booking-fallback"/g) || [];
    assert.equal(iframes.length, 2, `${campaign.slug}: expected the form and calendar embeds`);
    assert.equal(
      fallbacks.length,
      iframes.length,
      `${campaign.slug}: every embed needs a fallback — a chrome-less page with a blocked form has no other exit`
    );
    assert.match(html, /<iframe[^>]+title=/, `${campaign.slug}: iframes need titles`);
  }
});

test("blog pagination does not wrap", async () => {
  const newest = postsNewestFirst[0];
  const oldest = postsNewestFirst[postsNewestFirst.length - 1];

  const newestHtml = await read(`blog/${newest.slug}/index.html`);
  const oldestHtml = await read(`blog/${oldest.slug}/index.html`);

  // A "newer post" link on the newest entry would loop back to the oldest and
  // read as broken. Services wrap because they are a set; posts are a timeline.
  assert.ok(!newestHtml.includes("Newer post"), "the newest post must not link to a newer one");
  assert.ok(newestHtml.includes("Older post"), "the newest post should link backwards");
  assert.ok(!oldestHtml.includes("Older post"), "the oldest post must not link to an older one");
  assert.ok(oldestHtml.includes("Newer post"), "the oldest post should link forwards");
});

test("blog bodies render fully, with no unresolved inline markup", async () => {
  for (const post of postsNewestFirst) {
    const html = await read(`blog/${post.slug}/index.html`);
    const body = html.split('class="shell post-body"')[1].split("</section>")[0];
    // An unmatched bracket would ship the raw markup as prose.
    assert.ok(!body.includes("](/"), `${post.slug}: unrendered link markup`);
    assert.ok(!body.includes("**"), `${post.slug}: unrendered bold markup`);
    assert.ok(body.length > 1500, `${post.slug}: body looks truncated`);
  }
});

test("campaign facts do not contradict their canonical service page", async () => {
  // Both pages describe the same treatment. The service page is indexed and the
  // landing page is noindex pointing at it, so the service page wins any
  // disagreement — a visitor who compares them must not find two different
  // session counts for the same procedure.
  const { serviceBySlug } = await import("../data/services.mjs");

  for (const campaign of campaigns) {
    const service = serviceBySlug.get(campaign.canonicalServiceSlug);
    const facts = Object.fromEntries(campaign.facts);

    const duration = facts.Duration || facts.Session;
    if (duration && !/varies/i.test(service.quickFacts.duration)) {
      const numbers = (text) => (text.match(/\d+/g) || []).join(",");
      assert.equal(
        numbers(duration),
        numbers(service.quickFacts.duration),
        `${campaign.slug}: duration "${duration}" contradicts the service page's "${service.quickFacts.duration}"`
      );
    }

    if (facts.Sessions && !/varies/i.test(service.quickFacts.series)) {
      assert.equal(
        facts.Sessions,
        service.quickFacts.series,
        `${campaign.slug}: session count contradicts the service page`
      );
    }
  }
});
