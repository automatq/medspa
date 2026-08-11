/**
 * Journal page rendering, extracted from build-blog.mjs so the serverless route
 * at api/blog/[slug].js can call the identical function.
 *
 * A post written in the browser therefore produces byte-identical markup to one
 * committed to the repo — same head, same JSON-LD, same disclaimer, same
 * pagination. Nothing about the runtime path is a reduced version of the build.
 *
 * Every function takes its post list as an argument rather than importing it, so
 * the runtime route can pass "static posts merged with stored ones" and the
 * build can pass "static posts only".
 */
import { postCategoryById } from "../data/blog.mjs";
import { serviceBySlug } from "../data/services.mjs";
import {
  ctaPanel,
  displayDate,
  newsletterBand,
  pagination,
  postCard,
  postHref,
  postImage,
  relatedCard,
  renderBlocks,
} from "./components.mjs";
import { breadcrumbList, cleanJson, graph } from "./schema.mjs";
import { SITE, assetVersion, escapeHtml, fontPreloads, footer, mobileActions, navigation } from "./site-shell.mjs";

const head = ({ title, description, canonical, image, extraJson }) => `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f6f0e6">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${SITE.icon}" type="image/png">
  ${fontPreloads}
  <link rel="stylesheet" href="/assets/css/medspa.css?v=${assetVersion}">
  <script src="/assets/js/medspa.js?v=${assetVersion}" defer></script>
  <script type="application/ld+json">${cleanJson(extraJson)}</script>`;

/** Absolute URL for og:image — an uploaded post image is already absolute. */
const socialImage = (post) => {
  const source = postImage(post, 1280);
  return source.startsWith("http") ? source : `${SITE.assetOrigin}${source}`;
};

export const renderIndex = (postsNewestFirst) => {
  const canonical = `${SITE.origin}/blog/`;
  const jsonLd = graph([
    {
      "@type": "Blog",
      "@id": `${canonical}#blog`,
      name: "Anima Med Spa journal",
      url: canonical,
      publisher: { "@id": `${SITE.origin}/#business` },
      blogPost: postsNewestFirst.map((post) => ({
        "@type": "BlogPosting",
        "@id": `${SITE.origin}/blog/${post.slug}/#post`,
        headline: post.title,
        datePublished: post.published,
        dateModified: post.updated,
        url: `${SITE.origin}/blog/${post.slug}/`,
      })),
    },
    breadcrumbList(`${canonical}#breadcrumb`, [
      ["Home", `${SITE.origin}/`],
      ["Journal", canonical],
    ]),
  ]);

  return `<!doctype html>
<html lang="en">
<head>
${head({
  title: "Your Guide to Better Skin | Anima Med Spa",
  description:
    "Treatment education, aftercare guidance, and seasonal skin advice from the team at Anima Med Spa in Etobicoke.",
  canonical,
  image: null,
  extraJson: jsonLd,
})}
</head>
<body class="page-blog-index">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${navigation("blog")}

  <main id="main-content">
    <section class="page-hero">
      <div class="shell">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/index.html">Home</a><span aria-hidden="true">/</span>
          <span aria-current="page">Journal</span>
        </nav>
        <p class="eyebrow">Journal</p>
        <h1 class="page-title" data-split-title>Your guide to better <span class="script">skin.</span></h1>
        <p class="lede">Treatment education, aftercare, and seasonal guidance written by the team at Anima. General information only — your own plan is confirmed at consultation.</p>
      </div>
    </section>

    <section class="section section-paper">
      <div class="shell">
        <div class="post-grid" data-journal-grid data-journal-all>
          ${postsNewestFirst.map(postCard).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section section-pale">
      <div class="shell">
        ${ctaPanel({
          heading: "Reading is a good start.",
          accent: "A consultation is better.",
          body: "Bring what you have read to a complimentary consultation and get an answer for your skin rather than skin in general.",
          primary: { href: SITE.bookHref, label: "Book a complimentary consultation" },
          secondary: { href: "/service-light.html", label: "Browse treatments" },
        })}
      </div>
    </section>
  </main>

  ${newsletterBand()}
  ${footer()}
  ${mobileActions()}
</body>
</html>
`;
};

export const renderPost = (post, { newer = null, older = null } = {}) => {
  const canonical = `${SITE.origin}/blog/${post.slug}/`;
  const category = postCategoryById.get(post.category);
  const related = post.relatedServiceSlugs.map((slug) => serviceBySlug.get(slug)).filter(Boolean);
  const image = socialImage(post);

  const jsonLd = graph([
    {
      "@type": "BlogPosting",
      "@id": `${canonical}#post`,
      headline: post.title,
      description: post.deck,
      datePublished: post.published,
      dateModified: post.updated,
      url: canonical,
      image,
      author: { "@id": `${SITE.origin}/#business` },
      publisher: { "@id": `${SITE.origin}/#business` },
      mainEntityOfPage: canonical,
      articleSection: category?.label ?? "Journal",
    },
    breadcrumbList(`${canonical}#breadcrumb`, [
      ["Home", `${SITE.origin}/`],
      ["Journal", `${SITE.origin}/blog/`],
      [post.title, canonical],
    ]),
  ]);

  return `<!doctype html>
<html lang="en">
<head>
${head({ title: post.seoTitle, description: post.metaDescription, canonical, image, extraJson: jsonLd })}
</head>
<body class="page-blog-post" data-post="${escapeHtml(post.slug)}">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${navigation("blog")}

  <main id="main-content">
    <article>
      <section class="page-hero">
        <div class="shell">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/index.html">Home</a><span aria-hidden="true">/</span>
            <a href="/blog/">Journal</a><span aria-hidden="true">/</span>
            <span aria-current="page">${escapeHtml(post.title)}</span>
          </nav>
          <p class="eyebrow">${escapeHtml(category?.label ?? "Journal")}</p>
          <h1 class="page-title" data-split-title>${escapeHtml(post.title)}</h1>
          <p class="lede">${escapeHtml(post.deck)}</p>
          <p class="post-meta"><time datetime="${escapeHtml(post.published)}">${escapeHtml(
    displayDate(post.published)
  )}</time><span>${post.readMinutes} min read</span></p>
        </div>
      </section>

      <section class="section section-paper">
        <div class="shell">
          <div class="editorial-image image-reveal">
            <picture>
              <source media="(max-width: 700px)" srcset="${escapeHtml(postImage(post, 640))}">
              <img src="${escapeHtml(postImage(post, 1280))}" alt="${escapeHtml(
    post.heroAlt
  )}" width="1280" height="853" fetchpriority="high">
            </picture>
          </div>
        </div>
      </section>

      <section class="section section-pale">
        <div class="shell post-body">
          ${renderBlocks(post.body)}
          <p class="medical-disclaimer">This article is general education and does not replace medical advice, diagnosis, or informed consent. Suitability, results, and aftercare vary — confirm your own plan at consultation.</p>
          ${pagination({
            className: "post-pagination",
            ariaLabel: "Journal pagination",
            previous: older ? { href: postHref(older), label: "Older post", title: older.title } : null,
            next: newer ? { href: postHref(newer), label: "Newer post", title: newer.title } : null,
          })}
        </div>
      </section>

      ${
        related.length
          ? `<section class="section section-paper">
        <div class="shell">
          <div class="related-heading" data-reveal>
            <div>
              <p class="eyebrow">Mentioned in this article</p>
              <h2 class="section-title">Related <span class="script">treatments.</span></h2>
            </div>
            <a class="text-link" href="/service-light.html">View all treatments <span aria-hidden="true">↗</span></a>
          </div>
          <div class="related-services">${related.map(relatedCard).join("")}</div>
        </div>
      </section>`
          : ""
      }

      <section class="section section-pale">
        <div class="shell">
          ${ctaPanel({
            heading: "Have a question this did not answer?",
            accent: "Ask the clinic.",
            body: "A complimentary consultation covers suitability, scope, downtime, and current pricing for your skin specifically.",
            primary: { href: SITE.bookHref, label: "Book a complimentary consultation" },
            secondary: { href: "/contact-us-light.html", label: "Contact the clinic" },
          })}
        </div>
      </section>
    </article>
  </main>

  ${newsletterBand()}
  ${footer()}
  ${mobileActions()}
</body>
</html>
`;
};
