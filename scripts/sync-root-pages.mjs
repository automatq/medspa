import { readFile, writeFile } from "node:fs/promises";
import {
  contactForm,
  featuredPricing,
  featuredTreatments,
  newsletterBand,
  renderCategoryIndex,
  renderTreatmentCategories,
  reviewWall,
  teamSection,
} from "./components.mjs";
import { reviewSource, reviews } from "../data/reviews.mjs";
import { formatPrice, membershipPrice, priceBySlug, priceDisclaimerTail, prices } from "../data/pricing.mjs";
import { team } from "../data/team.mjs";
import { assetVersion, footer, mobileActions, navigation } from "./site-shell.mjs";

// `mobileActions: false` is deliberate for book-now.html — it already *is* the
// booking page, so the sticky Call/Book bar is redundant there.
const pages = new Map([
  ["index.html", { active: "home" }],
  ["service-light.html", { active: "treatments" }],
  ["service-details-light.html", { active: "treatments" }],
  ["about-us-light.html", { active: "about" }],
  ["faq-light.html", { active: "faq" }],
  ["contact-us-light.html", { active: "contact" }],
  ["book-now.html", { active: "", mobileActions: false }],
]);

const navigationPattern =
  /<header class="site-header">[\s\S]*?<\/header>\s*<nav class="mobile-menu"[^>]*data-mobile-menu[^>]*>[\s\S]*?<\/nav>/;
// Matches the footer with or without an already-synced newsletter band in front
// of it, so re-running the sync replaces the pair instead of stacking bands.
const footerPattern =
  /(?:<section class="newsletter-band">[\s\S]*?<\/section>\s*)?<footer class="site-footer">[\s\S]*?<\/footer>/;
const mobileActionsPattern = /<nav class="mobile-actions"[^>]*>[\s\S]*?<\/nav>/;
const rootDocuments = [...pages.keys()];

/**
 * Replaces everything between <!-- build:name --> and <!-- /build:name -->.
 * Throws when a region is missing so a renamed marker fails the build loudly
 * instead of silently leaving stale hand-written markup on the page.
 */
/**
 * Data-driven regions of the hand-written root pages. A page opts in by placing
 * the matching marker pair; nothing is injected into pages that don't ask.
 */
const regions = new Map([
  ["category-index", renderCategoryIndex],
  ["treatment-categories", renderTreatmentCategories],
  ["featured-treatments", () => featuredTreatments(FEATURED_SLUGS)],
  ["reviews", () => reviewWall(reviews, reviewSource)],
  ["team", () => teamSection(team)],
  ["contact-form", contactForm],
  [
    "featured-pricing",
    () => featuredPricing({ prices, membershipPrice, priceBySlug, formatPrice, tail: priceDisclaimerTail }),
  ],
]);

// The six treatments Anima features on its own homepage.
const FEATURED_SLUGS = [
  "weight-management",
  "laser-hair-removal",
  "korean-glass-skin-facial",
  "hydradermabrasion",
  "dermal-fillers",
  "botox-dysport",
];

const replaceRegion = (html, file, name, replacement) => {
  const pattern = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!pattern.test(html)) throw new Error(`${file}: build region "${name}" not found`);
  return html.replace(pattern, (_match, open, close) => `${open}${replacement}${close}`);
};

for (const [file, options] of pages) {
  let html = await readFile(file, "utf8");
  if (!navigationPattern.test(html)) throw new Error(`${file}: shared navigation region not found`);
  html = html.replace(navigationPattern, navigation(options.active));

  if (!footerPattern.test(html)) throw new Error(`${file}: shared footer region not found`);
  html = html.replace(footerPattern, `${newsletterBand()}\n\n  ${footer()}`);

  if (options.mobileActions !== false) {
    if (!mobileActionsPattern.test(html)) throw new Error(`${file}: mobile actions region not found`);
    html = html.replace(mobileActionsPattern, mobileActions());
  }

  html = html
    .replace(/\/assets\/(css\/medspa\.css|js\/medspa\.js)\?v=[^"]+/g, `/assets/$1?v=${assetVersion}`)
    .replace(/\b(href|src)="assets\//g, '$1="/assets/')
    .replace(
      /\bhref="([^"]+\.html(?:#[^"]*)?)"/g,
      (match, target) => (rootDocuments.some((document) => target.startsWith(document)) ? `href="/${target}"` : match)
    );

  for (const [name, render] of regions) {
    if (html.includes(`<!-- build:${name} -->`)) html = replaceRegion(html, file, name, render());
  }

  await writeFile(file, html);
}

console.log(`Synchronized shared navigation across ${pages.size} pages and regenerated the treatment index.`);
