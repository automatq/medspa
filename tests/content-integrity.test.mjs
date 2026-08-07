import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import { team } from "../data/team.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);

const collectHtml = async (directory = root, depth = 0) => {
  const skip = new Set(["node_modules", ".git", ".context", ".vercel", "assets", "tests", "scripts", "data"]);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory() && depth < 3) files.push(...(await collectHtml(full, depth + 1)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
};

const files = await collectHtml();
const pages = new Map(await Promise.all(files.map(async (file) => [file.slice(root.length + 1), await readFile(file, "utf8")])));

/**
 * Content that must never reach production, each for a specific reason.
 * This is the enforcement behind decisions that would otherwise rot into a
 * comment nobody reads.
 */
const banned = [
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

test("banned content appears nowhere in the built site", () => {
  const hits = [];
  for (const [file, html] of pages) {
    for (const [needle, reason] of banned) {
      if (html.includes(needle)) hits.push(`${file}: "${needle}" (${reason})`);
    }
  }
  assert.deepEqual(hits, [], `banned content found:\n${hits.join("\n")}`);
});

test("Ali Komeili is never described with a regulated Ontario title", () => {
  const ali = team.find((member) => member.slug === "ali-komeili");
  assert.ok(ali, "ali-komeili must exist in the team data");
  assert.equal(ali.role, "Cosmetic Injector");

  const prose = [ali.role, ali.credentials, ali.summary, ...ali.bio, ali.scopeNote ?? ""].join(" ");
  for (const title of [/\bDr\.?\s/i, /\bdermatologist\b/i, /\bphysician\b/i]) {
    assert.ok(!title.test(prose), `Ali Komeili's record must not use ${title}`);
  }
  // Credentials must stay geographically bound so they cannot read as Ontario ones.
  assert.match(`${ali.credentials} ${ali.summary}`, /Iran/);
  assert.match(ali.scopeNote ?? "", /Ontario/);
});

test("every team member's claims are attributed and scoped", () => {
  for (const member of team) {
    assert.ok(Array.isArray(member.bio) && member.bio.length > 0, `${member.slug}: bio must be a non-empty array`);
    assert.ok(member.summary?.length > 20, `${member.slug}: needs a summary`);
    // Third person only — first-person copy is a tell that source marketing prose
    // was pasted in rather than rewritten.
    const prose = [member.summary, ...member.bio].join(" ");
    assert.ok(!/\b(I|my|we|our)\b/.test(prose), `${member.slug}: bio must be third person`);
  }
});

test("Peggy Chen's injectables limitation is stated in the data", () => {
  const peggy = team.find((member) => member.slug === "peggy-chen");
  assert.match(peggy.scopeNote ?? "", /does not perform injectables/i);
});
