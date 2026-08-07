import assert from "node:assert/strict";
import test from "node:test";
import { formatPrice, membershipPrice, prices } from "../data/pricing.mjs";
import { serviceBySlug } from "../data/services.mjs";

// `membershipPrice` is not a service and has no entry in data/services.mjs, so
// slug resolution below covers `prices` only. Every other rule applies to it
// too — a stale or malformed membership price is just as wrong as a stale
// treatment price — so those checks iterate this combined list.
const allEntries = [...prices, membershipPrice];

const MAX_PRICE_AGE_DAYS = 120;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

test("every priced slug resolves to a real service", () => {
  for (const price of prices) {
    assert.ok(
      serviceBySlug.has(price.slug),
      `priced slug "${price.slug}" does not exist in data/services.mjs — a price ` +
        `callout would render on a page that cannot be reached, or not render at all`
    );
  }
});

// Botox/Dysport, dermal fillers and Sculptra are prescription drugs. Canadian
// rules restrict advertising prescription drugs to the public: a price is a
// promotional claim, and publishing one for an injectable steers the choice of
// a prescription treatment on cost rather than on clinical assessment. No
// injectable may ever carry a published price on this site — it must defer to
// consultation. This test is the guardrail: if someone adds an injectable price
// here, the build fails rather than the page shipping.
test("no priced slug belongs to the injectables category", () => {
  for (const price of prices) {
    // Optional chaining keeps an unknown slug from throwing a bare TypeError
    // here and burying the real message; the resolution test above already
    // fails hard on a missing slug, so this guardrail cannot be slipped past
    // by removing a service from the catalog.
    const category = serviceBySlug.get(price.slug)?.category;
    assert.notEqual(
      category,
      "injectables",
      `"${price.slug}" is an injectable. Prescription-drug prices must not be ` +
        `published to the public — remove this entry and let it defer to consultation`
    );
  }
});

test("every effectiveDate is a valid ISO date and no more than 120 days old", () => {
  const now = new Date();
  for (const price of allEntries) {
    assert.match(
      price.effectiveDate ?? "",
      ISO_DATE,
      `"${price.slug}" needs an effectiveDate in YYYY-MM-DD form recording when ` +
        `the price was last verified`
    );

    const effective = new Date(`${price.effectiveDate}T00:00:00Z`);
    assert.ok(
      Number.isFinite(effective.getTime()),
      `"${price.slug}" has an unparseable effectiveDate "${price.effectiveDate}"`
    );

    const ageDays = Math.floor((now - effective) / 86_400_000);
    assert.ok(
      ageDays <= MAX_PRICE_AGE_DAYS,
      `The price for "${price.slug}" was last verified ${ageDays} days ago ` +
        `(${price.effectiveDate}), which exceeds the ${MAX_PRICE_AGE_DAYS}-day limit. ` +
        `Re-verify this price with the clinic against the live booking schedule, then ` +
        `update effectiveDate in data/pricing.mjs. Do not bump the date without checking — ` +
        `the date is the claim that the price is still accurate.`
    );
  }
});

// A struck-through "regular" price is an ordinary-selling-price claim and must
// be genuine and actually higher than what is charged today, or the discount is
// fictional.
test("a shown regular price is numeric and higher than the current price", () => {
  for (const price of allEntries) {
    if (price.showRegular !== true) continue;
    assert.equal(
      typeof price.regular,
      "number",
      `"${price.slug}" sets showRegular but its regular price is not a number`
    );
    assert.ok(
      price.regular > price.amount,
      `"${price.slug}" shows a regular price of ${price.regular} that is not above ` +
        `the current price of ${price.amount} — that is not a saving`
    );
  }
});

test("formatPrice renders a dollar-prefixed string", () => {
  for (const price of allEntries) {
    const formatted = formatPrice(price);
    assert.equal(typeof formatted, "string");
    assert.ok(
      formatted.startsWith("$"),
      `formatPrice("${price.slug}") returned "${formatted}", which does not start with "$"`
    );
  }
});
