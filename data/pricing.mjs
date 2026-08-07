/**
 * The only treatments with a published price. Everything else defers to the
 * live WellnessLiving schedule — see the tail sentence rendered on every
 * price callout.
 *
 * Keeping this list short is the point. A price that appears on the site but
 * not at the till is a false claim, so a treatment earns an entry here only
 * once the clinic has published the number and we have read it off a live
 * source. Absence is the safe default: an unpriced service renders the tail
 * sentence and sends the client to the booking schedule.
 *
 * `regular` is an ordinary-price claim: in Canada it must be genuine (sold in
 * substantial volume at that price recently, or offered in good faith for a
 * substantial period). Both `regular` values below are UNCONFIRMED by the
 * clinic. Until they confirm, `showRegular` stays false and only the current
 * price renders.
 *
 * A struck-through "was $269" that was never really $269 is a deceptive
 * ordinary-selling-price representation under the Competition Act, so the
 * `regular` figures stay recorded but unrendered rather than being deleted —
 * deleting them would lose the fact that the clinic still owes us an answer.
 *
 * `effectiveDate` is the day each price was last verified, not the day it was
 * introduced. tests/pricing.test.mjs fails the build once any entry is more
 * than 120 days stale, which forces a re-check with the clinic instead of
 * letting an old number quietly outlive its accuracy.
 */
export const priceDisclaimerTail =
  "Other treatments are priced in the live booking schedule.";

export const prices = [
  { slug: "carbon-laser-peel", amount: 99, currency: "CAD", unit: "per session", regular: 269, showRegular: false, effectiveDate: "2026-07-29" },
  { slug: "swedish-massage",   amount: 99, currency: "CAD", unit: "per session", effectiveDate: "2026-07-29" },
  { slug: "lash-lift-tint",    amount: 108, currency: "CAD", unit: "per session", regular: 120, showRegular: false, effectiveDate: "2026-07-29" },
];

/**
 * The Glow Plan membership. It is deliberately not part of `prices`: it is a
 * recurring 12-month commitment rather than a per-session treatment, it has no
 * entry in `data/services.mjs`, and it must never be formatted or compared as
 * though it were a single visit.
 */
export const membershipPrice = { slug: "glow-plan", amount: 159, currency: "CAD", unit: "per month", termMonths: 12, effectiveDate: "2026-07-29" };

export const priceBySlug = new Map(prices.map((p) => [p.slug, p]));

/**
 * Formats with a hardcoded "en-CA" locale rather than the ambient default, so
 * the rendered string is identical on every machine that builds the site. A
 * locale-dependent format would let a build host silently emit "159,00 $" or a
 * differently placed currency symbol into static HTML.
 */
export const formatPrice = (price) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: price.currency, minimumFractionDigits: 0 }).format(price.amount);
