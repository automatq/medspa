import { postBySlug } from "./blog.mjs";
import { campaignBySlug, thankYou } from "./campaigns.mjs";
import { glowPlan, privacy } from "./pages.mjs";
import { serviceBySlug } from "./services.mjs";
import { GENERATED_COPY } from "./site-copy.generated.mjs";
import { teamBySlug } from "./team.mjs";

/**
 * Which strings the clinic may edit in the browser, and what they currently say.
 *
 * preet/cambridge hand-maintains a 1021-line registry of 266 keys, each with its
 * default duplicated from the component that renders it. We don't: the data
 * modules already are the registry. A key is a dotted path into them, so
 * `services.botox-dysport.intro` resolves by walking `serviceBySlug`. Nothing to
 * keep in sync, and all 29 service pages become editable for free.
 *
 * Keys look like: <root>.<id>.<field>[.<index>]
 *   services.botox-dysport.intro
 *   services.sculptra.faqs.2.1        (answer of the third FAQ)
 *   team.peggy-chen.summary
 *   pages.glow-plan.lede
 *   site.<page>.<slot>                (hand-written page copy, see SITE_COPY)
 *   text.<hash>                       (everything else, see below)
 *
 * `text.<hash>` keys are minted by scripts/annotate-editable.mjs for prose no
 * data module backs — the hand-written root pages, the shell, the copy the
 * generators write inline. The hash is of the text itself, so an override can
 * never land on the wrong element, and their defaults live in the generated
 * module rather than being duplicated here by hand.
 */

/**
 * Hand-written page copy has no data module behind it, so these are the one
 * place a default has to be duplicated. Keep this list small — anything that
 * belongs in a data module should live there instead.
 */
export const SITE_COPY = {
  // Not copy but a setting, and it rides the same path for the same reason: one
  // store, one public map, one fetch the pages already make. See FONT_THEMES.
  "site.theme.fonts": "classic",
  "site.home.hero.eyebrow": "Medical aesthetics in Etobicoke",
  "site.home.hero.copy":
    "Advanced, non-surgical treatments in Lakeshore Village—planned around your goals, comfort, and natural features.",
  "site.home.menu.eyebrow": "Treatment menu",
  "site.home.journal.eyebrow": "From the journal",
  "site.home.journal.lede":
    "Treatment education, aftercare, and seasonal guidance written by the team at Anima.",
  "site.home.products.lede":
    "Anima works with professional-use skincare and medical-grade devices selected for how well they hold up in clinic, not for how well they market.",
  "site.home.social.lede":
    "Recent treatments, clinic moments, and aftercare explained by the team — shared straight from Anima rather than a stock library.",
};

/**
 * The font pairings offered in the editor toolbar, matching the
 * `[data-font-theme]` blocks in assets/css/medspa.css.
 *
 * Enumerated rather than free text because this value is written into a DOM
 * attribute on every page: an open-ended string here is a stored injection
 * vector, and a typo would silently fall back to the default with no clue why.
 */
export const FONT_THEMES = {
  classic: "Playfair Display headings, Sequel Sans body (current)",
  modern: "Sequel Sans throughout",
  editorial: "Playfair Display throughout",
  system: "Your device's own fonts",
};

export const THEME_KEYS = { "site.theme.fonts": FONT_THEMES };

/** Settings keys accept only their listed values; ordinary copy accepts prose. */
export const isAllowedValue = (key, value) =>
  !(key in THEME_KEYS) || Object.hasOwn(THEME_KEYS[key], value);

/**
 * Never editable, enforced in the API rather than only in the UI.
 *
 * These are not style choices — each one is a decision this site was explicitly
 * built to hold, and a runtime editor is exactly the hole through which they
 * would leak back in.
 */
export const LOCKED_PREFIXES = [
  // Verbatim Google reviews. Editing one is falsification, which is the whole
  // reason tests/content-integrity.test.mjs exists.
  "reviews.",
  // Published prices are guarded by the 120-day freshness check and the
  // prescription-drug prohibition in tests/pricing.test.mjs. Editing a price in
  // the browser bypasses both.
  "pricing.",
];

export const LOCKED_KEYS = new Set([
  // Ontario restricted-title risk: his credentials were earned in Iran and his
  // local licensure is unconfirmed, so the wording is a compliance position.
  "team.ali-komeili.role",
  "team.ali-komeili.credentials",
  "team.ali-komeili.scopeNote",
  // Scope-of-practice statements, not marketing copy.
  "team.peggy-chen.scopeNote",
  "team.solmaz-haghighi.scopeNote",
]);

const ROOTS = {
  services: (id) => serviceBySlug.get(id),
  team: (id) => teamBySlug.get(id),
  blog: (id) => postBySlug.get(id),
  pages: (id) => ({ "glow-plan": glowPlan, privacy }[id]),
  campaigns: (id) => (id === thankYou.slug ? thankYou : campaignBySlug.get(id)),
};

export const isLocked = (key) =>
  LOCKED_KEYS.has(key) || LOCKED_PREFIXES.some((prefix) => key.startsWith(prefix));

/** Keys are written into HTML attributes and used as store keys — keep them boring. */
export const isWellFormedKey = (key) =>
  typeof key === "string" && key.length > 0 && key.length <= 200 && /^[a-z0-9][a-z0-9._-]*$/i.test(key);

/**
 * Resolves a key to the value currently baked into the build. Returns undefined
 * for anything that doesn't resolve, which is what makes an unknown key
 * rejectable rather than silently stored — preet's server accepts any key
 * matching a regex and accumulates orphan rows.
 */
export const getDefault = (key) => {
  if (!isWellFormedKey(key)) return undefined;
  if (key in SITE_COPY) return SITE_COPY[key];
  if (key in GENERATED_COPY) return GENERATED_COPY[key];

  const [root, id, ...path] = key.split(".");
  const lookup = ROOTS[root];
  if (!lookup || !id || path.length === 0) return undefined;

  let node = lookup(id);
  for (const step of path) {
    if (node == null) return undefined;
    // Numeric steps index into arrays (FAQ pairs, process steps, benefits).
    const next = Array.isArray(node) ? node[Number(step)] : node[step];
    if (next === undefined) return undefined;
    node = next;
  }

  return typeof node === "string" ? node : undefined;
};

/** Editable = resolves to a real string today, and isn't locked. */
export const isEditable = (key) => !isLocked(key) && getDefault(key) !== undefined;
