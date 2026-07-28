import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { categoryById, services, UNKNOWN } from "../data/services.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);
const rootPages = [
  "index.html",
  "service-light.html",
  "service-details-light.html",
  "about-us-light.html",
  "contact-us-light.html",
  "faq-light.html",
  "book-now.html",
];
const servicePages = services.map((item) => `services/${item.slug}/index.html`);
const allPages = [...rootPages, ...servicePages];
const htmlByFile = new Map(
  await Promise.all(allPages.map(async (file) => [file, await readFile(join(root, file), "utf8")]))
);

const categoryCounts = Object.fromEntries(
  ["injectables", "skin", "laser", "wellness", "beauty"].map((category) => [
    category,
    services.filter((item) => item.category === category).length,
  ])
);

test("catalog contains exactly 25 unique services in the approved category split", () => {
  assert.equal(services.length, 25);
  assert.deepEqual(categoryCounts, {
    injectables: 8,
    skin: 7,
    laser: 4,
    wellness: 3,
    beauty: 3,
  });
  assert.equal(new Set(services.map((item) => item.slug)).size, 25);
  assert.equal(new Set(services.map((item) => item.legacyUrl)).size, 25);
  assert.equal(new Set(services.map((item) => item.seoTitle)).size, 25);
  assert.equal(new Set(services.map((item) => item.metaDescription)).size, 25);
});

test("every service has complete cautious content and valid relationships", () => {
  const requiredStrings = [
    "name",
    "slug",
    "legacyUrl",
    "category",
    "seoTitle",
    "metaDescription",
    "heroAlt",
    "intro",
    "candidacy",
    "preparation",
    "downtime",
    "aftercare",
    "bookingCta",
  ];
  const validSlugs = new Set(services.map((item) => item.slug));

  for (const item of services) {
    for (const field of requiredStrings) {
      assert.equal(typeof item[field], "string", `${item.slug}: ${field} must be a string`);
      assert.ok(item[field].trim(), `${item.slug}: ${field} must not be blank`);
    }
    assert.ok(categoryById.has(item.category), `${item.slug}: unknown category`);
    assert.match(item.legacyUrl, /^https:\/\/animamedspa\.com\/services\/.+\/$/);
    assert.equal(item.concerns.length, 4, `${item.slug}: four concerns required`);
    assert.ok(item.overview.length >= 2, `${item.slug}: overview requires two paragraphs`);
    assert.equal(item.process.length, 4, `${item.slug}: four process steps required`);
    assert.ok(item.benefits.length >= 4, `${item.slug}: at least four benefits required`);
    assert.ok(item.faqs.length >= 4, `${item.slug}: at least four FAQs required`);
    assert.equal(item.relatedSlugs.length, 3, `${item.slug}: three related services required`);
    assert.equal(new Set(item.relatedSlugs).size, 3, `${item.slug}: related services must be unique`);
    assert.ok(!item.relatedSlugs.includes(item.slug), `${item.slug}: cannot relate to itself`);
    item.relatedSlugs.forEach((slug) => assert.ok(validSlugs.has(slug), `${item.slug}: invalid related slug ${slug}`));

    for (const key of ["duration", "downtime", "series", "consultation"]) {
      assert.equal(typeof item.quickFacts[key], "string", `${item.slug}: quickFacts.${key} missing`);
      assert.ok(item.quickFacts[key].trim(), `${item.slug}: quickFacts.${key} blank`);
    }

    const uncertainValues = Object.values(item.quickFacts).filter((value) => value.startsWith("Varies"));
    uncertainValues.forEach((value) => assert.equal(value, UNKNOWN, `${item.slug}: use the approved uncertainty language`));
  }
});

test("responsive service imagery exists for every record", async () => {
  for (const item of services) {
    await access(join(root, `assets/img/services/${item.imageStem}-640.webp`));
    await access(join(root, `assets/img/services/${item.imageStem}-1280.webp`));
    if (item.provider) {
      await access(join(root, `assets/img/services/${item.provider.imageStem}-640.webp`));
      await access(join(root, `assets/img/services/${item.provider.imageStem}-1280.webp`));
    }
  }
});

test("every generated page has unique metadata, one H1, exact canonical, and valid JSON-LD", () => {
  const titles = [];
  const descriptions = [];

  for (const item of services) {
    const file = `services/${item.slug}/index.html`;
    const html = htmlByFile.get(file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: expected one H1`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${item.legacyUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">`));
    assert.match(html, new RegExp(`data-service="${item.slug}"`));

    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
    assert.ok(title, `${file}: title missing`);
    assert.ok(description, `${file}: description missing`);
    titles.push(title);
    descriptions.push(description);

    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1, `${file}: expected one JSON-LD graph`);
    const graph = JSON.parse(scripts[0][1])["@graph"];
    for (const type of ["Service", "FAQPage", "BreadcrumbList", "MedicalBusiness"]) {
      assert.ok(graph.some((entry) => entry["@type"] === type), `${file}: ${type} schema missing`);
    }
  }

  assert.equal(new Set(titles).size, 25);
  assert.equal(new Set(descriptions).size, 25);
});

test("all local links and images resolve, including page fragments", async () => {
  for (const [file, html] of htmlByFile) {
    const attributes = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const attribute of attributes) {
      if (
        !attribute ||
        /^(?:https?:|mailto:|tel:|data:|javascript:)/.test(attribute) ||
        attribute.startsWith("//")
      ) {
        continue;
      }
      const [rawPath, fragment] = attribute.split("#");
      const decodedPath = decodeURIComponent(rawPath);
      let target;
      if (!decodedPath) {
        target = join(root, file);
      } else if (decodedPath.startsWith("/")) {
        const pathname = decodedPath.slice(1);
        target = decodedPath.endsWith("/") ? join(root, pathname, "index.html") : join(root, pathname);
      } else {
        target = resolve(dirname(join(root, file)), decodedPath);
        if (decodedPath.endsWith("/")) target = join(target, "index.html");
      }
      await access(target);

      if (fragment && target.endsWith(".html")) {
        const targetHtml = target === join(root, file) ? html : await readFile(target, "utf8");
        const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        assert.match(targetHtml, new RegExp(`\\bid="${escaped}"`), `${file}: missing fragment ${attribute}`);
      }
    }
  }
});

test("root pages use deployment-safe absolute local URLs", () => {
  for (const file of rootPages) {
    const html = htmlByFile.get(file);
    const attributes = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const attribute of attributes) {
      if (
        !attribute ||
        /^(?:https?:|mailto:|tel:|data:|javascript:|#|\/)/.test(attribute) ||
        attribute.startsWith("//")
      ) {
        continue;
      }
      assert.fail(`${file}: relative URL would break after Vercel clean-URL normalization: ${attribute}`);
    }
  }
});

test("all discovery surfaces link to individual service pages", () => {
  const treatmentIndex = htmlByFile.get("service-light.html");
  const homepage = htmlByFile.get("index.html");

  for (const rootPage of rootPages) {
    const html = htmlByFile.get(rootPage);
    for (const item of services) {
      assert.ok(html.includes(`/services/${item.slug}/`), `${rootPage}: navigation missing ${item.slug}`);
    }
  }

  for (const item of services) {
    assert.match(
      treatmentIndex,
      new RegExp(`class="service-chip" href="/services/${item.slug}/"`),
      `treatment index missing ${item.slug}`
    );
  }

  for (const slug of [
    "microneedling-pdrn",
    "korean-glass-skin-facial",
    "chemical-peels",
    "botox-dysport",
    "dermal-fillers",
    "prp-skin-rejuvenation",
    "laser-hair-removal",
    "pigment-removal",
    "carbon-laser-peel",
  ]) {
    assert.ok(homepage.includes(`/services/${slug}/`), `homepage feature missing ${slug}`);
  }
});

test("Vercel redirects preserve every current WordPress slug", async () => {
  const config = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
  const changedLegacyPaths = services.filter(
    (item) => new URL(item.legacyUrl).pathname !== `/services/${item.slug}/`
  );
  assert.equal(config.redirects.length, changedLegacyPaths.length);
  for (const item of services) {
    const source = new URL(item.legacyUrl).pathname;
    const destination = `/services/${item.slug}/`;
    if (source === destination) {
      assert.equal(
        config.redirects.some((redirect) => redirect.source === source),
        false,
        `${source} should resolve directly instead of redirecting to itself`
      );
      continue;
    }
    assert.deepEqual(
      config.redirects.find((redirect) => redirect.source === source),
      { source, destination, permanent: true }
    );
  }
});

test("motion is progressive, dependency-free, reduced-motion safe, and below budget", async () => {
  const css = await readFile(join(root, "assets/css/medspa.css"), "utf8");
  const runtime = await readFile(join(root, "assets/js/medspa.js"), "utf8");
  const homepage = htmlByFile.get("index.html");

  assert.ok(gzipSync(runtime).byteLength < 12_000, "motion runtime must stay below 12KB compressed");
  assert.doesNotMatch(runtime, /\b(?:jQuery|gsap|THREE|Swiper)\b/, "motion runtime must not restore legacy dependencies");
  assert.match(runtime, /IntersectionObserver/);
  assert.match(runtime, /requestAnimationFrame/);
  assert.match(runtime, /prefers-reduced-motion/);
  assert.match(runtime, /querySelectorAll\("\[data-parallax\]"\)/);
  assert.match(runtime, /--parallax-y/);
  assert.match(runtime, /imageRevealSentinels/);
  assert.match(runtime, /imageObserver\.observe\(sentinel\)/);
  assert.equal(
    (homepage.match(/\bdata-parallax(?:\s|>)/g) || []).length,
    5,
    "homepage needs one hero and four image parallax targets"
  );
  assert.match(homepage, /class="hero"[^>]+data-parallax-strength="34"/);
  assert.match(css, /@view-transition/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.motion-ready \[data-reveal\]:not\(\.is-visible\)/);
  assert.match(css, /\.hero-sequence-ready \.hero\[data-parallax\] \.hero-media/);
  assert.match(css, /@media \(min-width: 900px\)[\s\S]*\.page-home \.split/);
  assert.doesNotMatch(runtime, /setProperty\("--reveal-x"/);

  for (const file of servicePages) {
    const html = htmlByFile.get(file);
    assert.doesNotMatch(html, /<html[^>]*class="[^"]*motion-ready/);
    assert.match(html, /<main id="main-content">[\s\S]*<h1/);
  }
});
