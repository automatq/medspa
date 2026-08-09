/**
 * Content that must never reach production, each entry with the reason it was
 * removed. Every one of these is a decision taken deliberately during the
 * rebuild, not a style preference.
 *
 * Two consumers, and both matter:
 *   - tests/content-integrity.test.mjs fails the build if any appears in the
 *     generated HTML.
 *   - api/admin/copy.js rejects a save containing any of them.
 *
 * The build-time check alone is not enough once the site has an inline editor:
 * the clinic could otherwise type "Dr. Komeili" straight back into a bio and it
 * would go live without a build ever running.
 */
export const BANNED_CONTENT = [
  // Fabricated testimonials on the original campaign landing pages. They cite
  // treatments Anima does not offer and were reused verbatim across two
  // different treatments.
  ["Sarah M.", "fabricated LP testimonial"],
  ["Jessica T.", "fabricated LP testimonial"],
  ["Amanda R.", "fabricated LP testimonial"],
  ["Elena V.", "fabricated LP testimonial"],
  ["Rachel B.", "fabricated LP testimonial"],
  ["Michelle K.", "fabricated LP testimonial"],
  ["Lauren D.", "fabricated LP testimonial"],
  // Unverifiable social proof that also contradicts the sourced 5.0 / 18 Fresha figure.
  ["4.9/5", "unverifiable rating that conflicts with the sourced Fresha rating"],
  ["500+ Happy", "unverifiable client count"],
  // A quotation nobody actually said, previously rendered as a <blockquote>.
  ["Warm care, a professional experience", "synthesized review quote"],
  ["Summary of verified client feedback", "attribution for a synthesized quote"],
  // Restricted-title risk in Ontario for a cosmetic injector whose credentials
  // were earned abroad and whose local licensure is unconfirmed.
  ["Dr. Komeili", "restricted title"],
  ["Dr Komeili", "restricted title"],
  // Unsupported superlatives from the original marketing copy.
  ["Premier Med Spa", "unsupported superlative"],
  ["Flawless, Radiant Skin", "outcome guarantee"],
];

/**
 * Returns the reason a value is rejected, or null when it is acceptable.
 * Case-insensitive: "dr. komeili" is the same problem as "Dr. Komeili".
 */
export const bannedReason = (value) => {
  const haystack = String(value).toLowerCase();
  for (const [needle, reason] of BANNED_CONTENT) {
    if (haystack.includes(needle.toLowerCase())) return { needle, reason };
  }
  return null;
};
