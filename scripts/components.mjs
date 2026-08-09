import { postCategoryById } from "../data/blog.mjs";
import { isEditable } from "../data/editable.mjs";
import { categories, categoryById, serviceBySlug, services } from "../data/services.mjs";
import { SITE, escapeHtml, serviceHref } from "./site-shell.mjs";

const twoDigit = (index) => String(index + 1).padStart(2, "0");
const servicesIn = (categoryId) => services.filter((item) => item.category === categoryId);

/**
 * Restricted inline markup for prose held in data files.
 *
 * Everything is escaped first, then exactly three constructs are re-enabled:
 * [label](/href), **bold** and *italic*. Data files therefore never hold raw
 * HTML, so a pasted-in snippet can't inject markup. Only root-relative and
 * mailto/tel hrefs are honoured.
 */
export const inline = (text = "") =>
  escapeHtml(text)
    .replace(/\[([^\]]+)\]\(((?:\/|mailto:|tel:)[^)\s]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

/** Renders a data-driven body: see data/blog.mjs for the block vocabulary. */
export const renderBlocks = (blocks) =>
  blocks
    .map((block) => {
      switch (block.type) {
        case "h2":
          return `<h2>${inline(block.text)}</h2>`;
        case "h3":
          return `<h3>${inline(block.text)}</h3>`;
        case "ul":
          return `<ul>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`;
        case "ol":
          return `<ol>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ol>`;
        case "note":
          return `<div class="notice">${inline(block.text)}</div>`;
        case "quote":
          return `<blockquote>${inline(block.text)}</blockquote>`;
        case "p":
          return `<p>${inline(block.text)}</p>`;
        default:
          throw new Error(`unknown block type: ${block.type}`);
      }
    })
    .join("\n          ");

/**
 * Marks an element as editable by the inline editor.
 *
 * The key is a dotted path into the data modules — see data/editable.mjs, which
 * resolves it back to the value baked into this build. Emitting the attribute
 * from the generators means all 29 service pages become editable at once;
 * preet/cambridge instead annotates 237 call sites by hand against a
 * 1021-line registry.
 *
 * Returns "" for a locked or unresolvable key, so a typo silently produces a
 * non-editable element rather than one the API will reject on save.
 */
export const ed = (key) => (isEditable(key) ? ` data-copy-key="${escapeHtml(key)}"` : "");

export const list = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

/** As `list`, but each item carries its own key so it can be edited in place. */
export const editableList = (items, keyFor) =>
  items.map((item, index) => `<li${ed(keyFor(index))}>${escapeHtml(item)}</li>`).join("");

export const picture = (item, className = "") => `<picture${className ? ` class="${className}"` : ""}>
  <source media="(max-width: 700px)" srcset="/assets/img/services/${item.imageStem}-640.webp">
  <img src="/assets/img/services/${item.imageStem}-1280.webp" alt="${escapeHtml(item.heroAlt)}" width="1280" height="853" loading="lazy">
</picture>`;

export const relatedCard = (related) => {
  const category = categoryById.get(related.category);
  return `<a class="related-service-card" href="${serviceHref(related)}" data-reveal>
    <span class="related-service-image">${picture(related)}</span>
    <span class="related-service-meta">${escapeHtml(category.shortLabel)} <span aria-hidden="true">↗</span></span>
    <strong>${escapeHtml(related.navName || related.name)}</strong>
    <span>${escapeHtml(related.intro)}</span>
  </a>`;
};

/**
 * Renders the dark provider band. `imageBase` is a path prefix (no width suffix)
 * so a member can keep pointing at an existing asset stem during migration.
 * Members without an upstream photograph fall back to an initials monogram —
 * never a stock stand-in.
 */
export const providerBand = (provider) => {
  if (!provider) return "";

  const portrait = provider.sourceImage || provider.imageBase.startsWith("/assets/img/services/")
    ? `<picture class="provider-portrait image-reveal">
          <source media="(max-width: 700px)" srcset="${provider.imageBase}-640.webp">
          <img src="${provider.imageBase}-1280.webp" alt="${escapeHtml(provider.alt)}" width="800" height="718" loading="lazy">
        </picture>`
    : `<p class="provider-portrait profile-monogram" aria-hidden="true">${escapeHtml(provider.initials)}</p>`;

  const bio = (Array.isArray(provider.bio) ? provider.bio : [provider.bio])
    .map((paragraph, index) => `<p${index === 0 ? ' class="lede"' : ""}>${escapeHtml(paragraph)}</p>`)
    .join("\n          ");

  return `<section class="section section-dark service-provider" aria-labelledby="provider-title">
      <div class="shell service-provider-grid">
        ${portrait}
        <div data-reveal>
          <p class="eyebrow">Provider published by Anima</p>
          <h2 class="section-title" id="provider-title">${escapeHtml(provider.name)}, <span class="serif">${escapeHtml(provider.role)}</span></h2>
          <p class="provider-credentials">${escapeHtml(provider.credentials)}</p>
          ${bio}
          <p class="provider-verification">Credentials and current clinical role should be confirmed directly during booking.</p>
        </div>
      </div>
    </section>`;
};

/**
 * `keyFor(index)` returns the dotted path to that FAQ pair, e.g.
 * `services.sculptra.faqs.2`. Question is `[0]`, answer is `[1]`.
 */
export const faqItems = (faqs, keyFor) =>
  faqs
    .map(
      ([question, answer], faqIndex) => `<details class="faq-item">
            <summary><span class="faq-index">${String(faqIndex + 1).padStart(2, "0")}</span><span${
        keyFor ? ed(`${keyFor(faqIndex)}.0`) : ""
      }>${escapeHtml(question)}</span><span class="faq-icon" aria-hidden="true"></span></summary>
            <div class="faq-answer"><p${keyFor ? ed(`${keyFor(faqIndex)}.1`) : ""}>${escapeHtml(answer)}</p></div>
          </details>`
    )
    .join("");

export const processItems = (steps, keyFor) =>
  steps
    .map(
      ([title, description], processIndex) => `<li>
            <span>${String(processIndex + 1).padStart(2, "0")}</span>
            <h3${keyFor ? ed(`${keyFor(processIndex)}.0`) : ""}>${escapeHtml(title)}</h3>
            <p${keyFor ? ed(`${keyFor(processIndex)}.1`) : ""}>${escapeHtml(description)}</p>
          </li>`
    )
    .join("");

/**
 * The 5.0 / 18-review band. Every number here is sourced from the linked Fresha
 * profile — keep it that way, and update the count in one place when it moves.
 */
export const reviewSignal = () => `<section class="section section-pale">
      <div class="shell review-signal-grid">
        <div data-reveal>
          <p class="eyebrow">Verified client signal</p>
          <h2 class="section-title">A 5.0 rating you can <span class="serif">check yourself.</span></h2>
          <p class="lede">Read Anima’s 18 verified Fresha reviews in the original booking profile before deciding what feels right for you.</p>
          <div class="button-row">
            <a class="button button-outline" href="${escapeHtml(SITE.freshaUrl)}" target="_blank" rel="noopener">Read verified reviews <span class="button-arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div class="service-rating" data-reveal>
          <strong>5.0</strong>
          <span aria-label="5 out of 5 stars">★★★★★</span>
          <p>18 verified reviews on Fresha</p>
        </div>
      </div>
    </section>`;

export const ctaPanel = ({ heading, accent, body, primary, secondary }) => `<div class="cta-panel" data-reveal>
          <h2>${escapeHtml(heading)} <span class="serif">${escapeHtml(accent)}</span></h2>
          <p>${escapeHtml(body)}</p>
          <div class="button-row">
            <a class="button button-light" href="${escapeHtml(primary.href)}">${escapeHtml(primary.label)} <span class="button-arrow" aria-hidden="true">↗</span></a>
            <a class="button button-outline" href="${escapeHtml(secondary.href)}">${escapeHtml(secondary.label)}</a>
          </div>
        </div>`;

/**
 * Prev/next links. Services wrap (a closed loop of treatments); blog posts must
 * not, so callers pass `null` to suppress an end of the pair.
 */
export const pagination = ({ className, ariaLabel, previous, next }) => `<nav class="${className}" aria-label="${escapeHtml(ariaLabel)}">
          ${previous ? `<a href="${previous.href}"><small>${escapeHtml(previous.label)}</small><strong>← ${escapeHtml(previous.title)}</strong></a>` : ""}
          ${next ? `<a href="${next.href}"><small>${escapeHtml(next.label)}</small><strong>${escapeHtml(next.title)} →</strong></a>` : ""}
        </nav>`;

/**
 * The two generated regions of service-light.html. Driving both from `categories`
 * is what lets a new category be added without hand-editing the page — the old
 * chip-patcher threw as soon as a service it had never seen appeared.
 */
export const renderCategoryIndex = () => `
        <div class="category-index" aria-label="Jump to a treatment category">
${categories
  .map(
    (category, index) =>
      `          <a href="#${category.id}"><small>${twoDigit(index)}</small><strong>${escapeHtml(category.label)}</strong></a>`
  )
  .join("\n")}
        </div>
        `;

export const renderTreatmentCategories = () => `
${categories
  .map(
    (category, index) => `      <section class="section treatment-category" id="${category.id}">
        <div class="shell">
          <div class="category-heading"><span class="category-number">${twoDigit(index)}</span><h2>${escapeHtml(category.headingLead)} <span class="serif">${escapeHtml(category.headingAccent)}</span></h2></div>
          <div class="category-body">
            <p>${escapeHtml(category.pageDescription)}</p>
            <div class="service-tags">
${servicesIn(category.id)
  .map(
    (item) =>
      `              <a class="service-chip" href="${serviceHref(item)}">${escapeHtml(item.navName || item.name)}</a>`
  )
  .join("\n")}
            </div>
          </div>
        </div>
      </section>`
  )
  .join("\n\n")}
      `;

/**
 * Review wall. Reviews render only with a real author name and a source link,
 * and never under a treatment-specific heading — an untargeted clinic review
 * presented beside one treatment reads as a review *of* that treatment.
 */
/**
 * `limit` shows only the first N reviews and links out for the rest. Nine
 * verbatim reviews stacked in one column took up 27% of the homepage on a phone;
 * the trust signal is a real name against a verifiable source, not volume. The
 * full set stays in data/reviews.mjs and on the linked profile — nothing is
 * hidden, and what does render is still byte-for-byte as published.
 */
export const reviewWall = (shown, source, { total = shown.length } = {}) => {
  const withheld = total - shown.length;

  return `<div class="review-wall" data-reveal-group>
          ${shown
            .map(
              (review) => `<figure class="review-quote">
            <p class="review-stars" aria-label="5 out of 5 stars">★★★★★</p>
            <blockquote${review.lang ? ` lang="${escapeHtml(review.lang)}"` : ""}>${review.text
                .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
                .join("")}</blockquote>
            <figcaption class="review-source"><cite>${escapeHtml(review.author)}</cite><br>Published on ${escapeHtml(
                source.platform
              )}</figcaption>
          </figure>`
            )
            .join("\n          ")}
        </div>
        ${
          withheld > 0
            ? `<p class="review-more"><a href="${escapeHtml(
                source.profileUrl
              )}" target="_blank" rel="noopener">Read all ${total} reviews on ${escapeHtml(
                source.platform
              )} <span aria-hidden="true">↗</span></a></p>`
            : ""
        }
        <p class="review-disclaimer">${escapeHtml(source.disclaimer)}</p>`;
};

/**
 * Wraps a portrait in a link to its full-size file. Without JavaScript the link
 * opens the photograph on its own — a real expand, not a dead control. The
 * lightbox in medspa.js intercepts the click when it can do better.
 */
const expandablePortrait = (member, portrait, extraClass = "") =>
  `<a class="portrait-zoom${extraClass ? ` ${extraClass}` : ""}" href="${member.imageBase}-1280.webp"
              data-lightbox data-lightbox-caption="${escapeHtml(`${member.name}, ${member.role}`)}"
              aria-label="${escapeHtml(`Expand the photograph of ${member.name}`)}">${portrait}<span class="portrait-zoom-badge" aria-hidden="true">
              <svg viewBox="0 0 16 16"><path d="M6 2H2v4M10 14h4v-4M14 6V2h-4M2 10v4h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </span></a>`;

/** Team card for the about page. Members without a photo get an initials monogram. */
export const teamCard = (member) => {
  const hasPhoto = Boolean(member.sourceImage) || member.imageBase.startsWith("/assets/img/services/");
  const portrait = hasPhoto
    ? expandablePortrait(
        member,
        `<img class="team-portrait" src="${member.imageBase}-640.webp" alt="${escapeHtml(
          member.alt
        )}" width="74" height="74" loading="lazy">`
      )
    : `<p class="profile-monogram" aria-hidden="true">${escapeHtml(member.initials)}</p>`;

  return `<article class="team-card" data-reveal>
            ${portrait}
            <h3>${escapeHtml(member.name)}</h3>
            <p class="team-role">${escapeHtml(member.role)}</p>
            <p class="team-credentials">${escapeHtml(member.credentials)}</p>
            <p class="team-summary">${escapeHtml(member.summary)}</p>
            ${member.scopeNote ? `<p class="team-scope">${escapeHtml(member.scopeNote)}</p>` : ""}
            ${
              member.verifiedProfileUrl
                ? `<p><a href="${escapeHtml(
                    member.verifiedProfileUrl
                  )}" target="_blank" rel="noopener">View verified staff profile ↗</a></p>`
                : ""
            }
            <details class="team-bio">
              <summary>Read full biography <span class="faq-icon" aria-hidden="true"></span></summary>
              ${member.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n              ")}
            </details>
          </article>`;
};

/**
 * Price callout. The tail sentence is not optional — with only four published
 * prices, a bare figure invites the reading that everything else is unpriced.
 */
export const priceCallout = (price, { formatPrice, tail, verifiedOn }) => `<div class="price-callout">
              <span class="price-amount">${escapeHtml(formatPrice(price))}</span>
              <span class="price-unit">${escapeHtml(price.unit)}</span>
              ${
                price.showRegular && price.regular
                  ? `<span class="price-regular">Promotional price. Regular price $${price.regular}.</span>`
                  : ""
              }
              <span class="price-verified">Price verified ${escapeHtml(verifiedOn)}.</span>
              <span class="price-tail">${escapeHtml(tail)}</span>
            </div>`;

const field = ({ id, name, label, type = "text", autocomplete, required = true, textarea = false }) => `<div class="field">
            <label for="${id}">${escapeHtml(label)}${required ? ' <abbr title="required">*</abbr>' : ""}</label>
            ${
              textarea
                ? `<textarea id="${id}" name="${name}"${required ? " required" : ""}></textarea>`
                : `<input id="${id}" name="${name}" type="${type}"${
                    autocomplete ? ` autocomplete="${autocomplete}"` : ""
                  }${required ? " required" : ""}>`
            }
            <p class="field-error" hidden></p>
          </div>`;

/**
 * Contact form. No backend yet, so the submit label states what actually
 * happens rather than claiming a send. Works with JS disabled via native
 * validation; the always-visible fallback covers a missing mail client.
 */
export const contactForm = () => `<form class="contact-form" data-mailto-form data-mailto-to="${escapeHtml(
  SITE.email
)}" data-mailto-subject="Website enquiry">
          <p class="form-note">This form opens your own email app with the message filled in. Nothing is sent from this page, so you stay in control of what goes out.</p>
          ${field({ id: "cf-name", name: "name", label: "Name", autocomplete: "name" })}
          ${field({ id: "cf-phone", name: "phone", label: "Phone", type: "tel", autocomplete: "tel" })}
          ${field({ id: "cf-email", name: "email", label: "Email", type: "email", autocomplete: "email" })}
          ${field({ id: "cf-message", name: "message", label: "How can we help?", textarea: true, required: false })}
          <p class="form-consent">Anima will use these details only to reply to your enquiry. See the <a href="/privacy/">privacy notice</a>.</p>
          <button class="button button-primary" type="submit">Open email with my message</button>
          <p class="form-status" role="status" aria-live="polite"></p>
          <p class="form-fallback">Prefer another route? Email <a href="mailto:${escapeHtml(
            SITE.email
          )}">${escapeHtml(SITE.email)}</a>, call <a href="${SITE.phoneHref}">${escapeHtml(
  SITE.phoneDisplay
)}</a>, or <a href="${SITE.bookHref}">book online</a>.</p>
        </form>`;

/**
 * Newsletter band.
 *
 * The original site headlines this "$50 OFF Your First Treatment" but publishes
 * no minimum spend, expiry, or eligibility, and there is no list to join.
 * Advertising a discount nothing can honour is a consumer-protection problem,
 * so the headline stays neutral until the clinic supplies terms.
 */
export const newsletterBand = () => `<section class="newsletter-band">
      <div class="shell newsletter-inner">
        <div>
          <h2>Anima newsletter</h2>
          <p>Occasional treatment information, aftercare reminders, and clinic updates. No fixed schedule, and you can stop at any time.</p>
        </div>
        <form data-mailto-form data-mailto-to="${escapeHtml(SITE.email)}" data-mailto-subject="Newsletter signup">
          <div class="field">
            <label class="visually-hidden" for="nl-email">Email address</label>
            <input id="nl-email" name="email" type="email" autocomplete="email" placeholder="Email address" required>
            <p class="field-error" hidden></p>
          </div>
          <button class="button button-light" type="submit">Open email to subscribe</button>
        </form>
      </div>
    </section>`;

/**
 * Homepage featured treatments. Reuses the related-services card grid, so this
 * needs no new CSS and picks up the existing hover and reveal wiring.
 */
export const featuredTreatments = (slugs) => `
          <div class="related-services">${slugs
            .map((slug) => serviceBySlug.get(slug))
            .filter(Boolean)
            .map(relatedCard)
            .join("")}</div>
        `;

/* ---------------------------------------------------------------- journal */

export const postHref = (post) => `/blog/${post.slug}/`;

// Fixed locale and UTC: a machine-local formatter would make build output vary
// between machines and produce phantom diffs in CI.
const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
export const displayDate = (iso) => dateFormatter.format(new Date(`${iso}T00:00:00Z`));

/**
 * A post written in the repo has a build-time image set under /assets/img/blog/;
 * one written in the composer has a single uploaded URL. Deciding that here is
 * what lets every caller treat the two kinds of post identically.
 */
export const postImage = (post, size) =>
  post.image ? post.image : `/assets/img/blog/${post.imageStem}-${size}.webp`;

export const postCard = (post) => {
  const category = postCategoryById.get(post.category);
  return `<a class="post-card" href="${postHref(post)}" data-reveal>
            <span class="post-card-image"><img src="${escapeHtml(
              postImage(post, 640)
            )}" alt="${escapeHtml(post.heroAlt)}" width="640" height="427" loading="lazy"></span>
            <span class="post-meta"><span>${escapeHtml(category?.label ?? "Journal")}</span><span>${escapeHtml(
    displayDate(post.published)
  )}</span><span>${post.readMinutes} min read</span></span>
            <h3>${escapeHtml(post.title)}</h3>
            <span>${escapeHtml(post.deck)}</span>
          </a>`;
};

/**
 * Homepage journal band. Renders the newest few posts at build time; posts
 * written in the composer are merged into this same grid client-side, which is
 * why the grid carries `data-journal-grid`.
 */
export const journalSection = (posts) => `
        <div class="related-heading" data-reveal>
          <div>
            <p class="eyebrow"${ed("site.home.journal.eyebrow")}>From the journal</p>
            <h2 class="section-title" id="home-journal-title">Reading for <span class="serif">better skin.</span></h2>
          </div>
          <a class="text-link" href="/blog/">Read the journal <span aria-hidden="true">↗</span></a>
        </div>
        <p class="lede"${ed(
          "site.home.journal.lede"
        )}>Treatment education, aftercare, and seasonal guidance written by the team at Anima.</p>
        <div class="post-grid" data-journal-grid>
          ${posts.map(postCard).join("\n          ")}
        </div>
      `;

/** Team section for the about page: founder feature plus the remaining members. */
export const teamSection = (team) => {
  const [founder, ...rest] = [...team].sort((a, b) => a.order - b.order);
  return `
        <div class="shell service-provider-grid">
          ${expandablePortrait(
            founder,
            `<picture class="provider-portrait image-reveal">
              <source media="(max-width: 700px)" srcset="${founder.imageBase}-640.webp">
              <img src="${founder.imageBase}-1280.webp" alt="${escapeHtml(founder.alt)}" width="800" height="718" loading="lazy">
            </picture>`,
            "provider-portrait-zoom"
          )}
          <div data-reveal>
            <p class="eyebrow">Founder</p>
            <h2 class="section-title" id="team-title">${escapeHtml(founder.name)}, <span class="serif">${escapeHtml(
    founder.role
  )}</span></h2>
            <p class="provider-credentials">${escapeHtml(founder.credentials)}</p>
            ${founder.bio.map((paragraph, index) => `<p${index === 0 ? ' class="lede"' : ""}>${escapeHtml(paragraph)}</p>`).join("\n            ")}
            <p class="provider-verification">Titles, credentials, and current scope of practice are confirmed directly at consultation.</p>
          </div>
        </div>
        <div class="shell">
          <div class="team-grid" data-reveal-group>
          ${rest.map(teamCard).join("\n          ")}
          </div>
        </div>
        `;
};

/**
 * The four treatments with a published price, on the treatments index. The
 * heading and notice both name the constraint so the other twenty-five do not
 * read as unpriced or free.
 */
export const featuredPricing = ({ prices, membershipPrice, priceBySlug, formatPrice, tail }) => {
  const cards = prices
    .map((price) => {
      const service = serviceBySlug.get(price.slug);
      return `<a class="info-card" href="${serviceHref(service)}">
              <h3>${escapeHtml(service.navName || service.name)}</h3>
              <p class="price-amount">${escapeHtml(formatPrice(price))}</p>
              <p>${escapeHtml(price.unit)}</p>
            </a>`;
    })
    .join("\n            ");

  return `
        <div class="service-section-heading" data-reveal>
          <p class="eyebrow">Published pricing</p>
          <h2 class="section-title">The four treatments with <span class="serif">a published price.</span></h2>
          <p class="lede">${escapeHtml(tail)} These four are listed here because Anima publishes them directly.</p>
        </div>
        <div class="info-grid" data-reveal-group>
            ${cards}
            <a class="info-card" href="/glow-plan/">
              <h3>Glow Plan membership</h3>
              <p class="price-amount">${escapeHtml(formatPrice(membershipPrice))}</p>
              <p>${escapeHtml(membershipPrice.unit)}, ${membershipPrice.termMonths}-month term</p>
            </a>
        </div>
        `;
};
