import { mkdir, writeFile } from "node:fs/promises";
import { categoryById, serviceBySlug, services } from "../data/services.mjs";
import { providerFor } from "../data/team.mjs";
import {
  ctaPanel,
  faqItems,
  list,
  pagination,
  processItems,
  providerBand,
  relatedCard,
  reviewSignal,
} from "./components.mjs";
import { cleanJson, serviceGraph } from "./schema.mjs";
import { SITE, assetVersion, escapeHtml, footer, mobileActions, navigation, serviceHref } from "./site-shell.mjs";

const bodyClass = (category) => `page-service-detail service-category-${category}`;

const renderService = (item, index) => {
  const category = categoryById.get(item.category);
  const provider = providerFor(item);
  const previous = services[(index - 1 + services.length) % services.length];
  const next = services[(index + 1) % services.length];
  const related = item.relatedSlugs.map((slug) => serviceBySlug.get(slug));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f2ecf2">
  <meta name="description" content="${escapeHtml(item.metaDescription)}">
  <title>${escapeHtml(item.seoTitle)}</title>
  <link rel="canonical" href="${escapeHtml(item.legacyUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(item.seoTitle)}">
  <meta property="og:description" content="${escapeHtml(item.metaDescription)}">
  <meta property="og:url" content="${escapeHtml(item.legacyUrl)}">
  <meta property="og:image" content="${SITE.assetOrigin}/assets/img/services/${item.imageStem}-1280.webp">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${SITE.icon}" type="image/png">
  <link rel="stylesheet" href="/assets/css/medspa.css?v=${assetVersion}">
  <script src="/assets/js/medspa.js?v=${assetVersion}" defer></script>
  <script type="application/ld+json">${cleanJson(serviceGraph(item, category, provider))}</script>
</head>
<body class="${bodyClass(item.category)}" data-service="${escapeHtml(item.slug)}">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${navigation("treatments")}

  <main id="main-content">
    <section class="service-hero">
      <div class="shell">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/index.html">Home</a><span aria-hidden="true">/</span>
          <a href="/service-light.html">Treatments</a><span aria-hidden="true">/</span>
          <span aria-current="page">${escapeHtml(item.navName || item.name)}</span>
        </nav>
        <div class="service-hero-grid">
          <div class="service-hero-copy">
            <p class="eyebrow">${escapeHtml(category.label)} · ${escapeHtml(item.eyebrow)}</p>
            <h1 class="service-title" data-split-title>${escapeHtml(item.name)} <span class="serif">${escapeHtml(item.titleAccent)}</span></h1>
            <p class="service-intro">${escapeHtml(item.intro)}</p>
            <div class="button-row">
              <a class="button button-primary" href="${SITE.bookHref}">${escapeHtml(item.bookingCta)} <span class="button-arrow" aria-hidden="true">↗</span></a>
              <a class="button button-outline" href="#treatment-details">Explore the treatment</a>
            </div>
          </div>
          <div class="service-hero-media image-reveal" data-parallax>
            <picture>
              <source media="(max-width: 700px)" srcset="/assets/img/services/${item.imageStem}-640.webp">
              <img src="/assets/img/services/${item.imageStem}-1280.webp" alt="${escapeHtml(item.heroAlt)}" width="1280" height="853" fetchpriority="high">
            </picture>
            <p>Source image published on Anima’s current ${escapeHtml(item.navName || item.name)} page.</p>
          </div>
        </div>
        <dl class="service-facts" data-reveal-group>
          <div><dt>Typical session</dt><dd>${escapeHtml(item.quickFacts.duration)}</dd></div>
          <div><dt>Downtime</dt><dd>${escapeHtml(item.quickFacts.downtime)}</dd></div>
          <div><dt>Treatment plan</dt><dd>${escapeHtml(item.quickFacts.series)}</dd></div>
          <div><dt>Consultation</dt><dd>${escapeHtml(item.quickFacts.consultation)}</dd></div>
        </dl>
      </div>
    </section>

    <section class="section section-paper" id="treatment-details">
      <div class="shell service-editorial-grid">
        <div class="service-section-heading" data-reveal>
          <p class="eyebrow">What it supports</p>
          <h2 class="section-title">Goals worth <span class="serif">discussing clearly.</span></h2>
        </div>
        <div>
          <ul class="concern-list" data-reveal-group>${list(item.concerns)}</ul>
          <div class="service-prose" data-reveal>${item.overview.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
        </div>
      </div>
    </section>

    <section class="section section-pale">
      <div class="shell">
        <div class="service-section-heading" data-reveal>
          <p class="eyebrow">Your appointment</p>
          <h2 class="section-title">A considered process, <span class="serif">step by step.</span></h2>
        </div>
        <ol class="service-process" data-reveal-group>
          ${processItems(item.process)}
        </ol>
      </div>
    </section>

    <section class="section section-dark">
      <div class="shell service-benefits-grid">
        <div data-reveal>
          <p class="eyebrow">Potential benefits</p>
          <h2 class="section-title">What this treatment <span class="serif">may support.</span></h2>
          <p class="lede">Benefits describe treatment goals, not guaranteed outcomes. Your provider will explain what is realistic for you.</p>
        </div>
        <ul class="benefit-list" data-reveal-group>${list(item.benefits)}</ul>
      </div>
    </section>

    <section class="section section-paper">
      <div class="shell">
        <div class="service-section-heading" data-reveal>
          <p class="eyebrow">Before you book</p>
          <h2 class="section-title">Candidacy, preparation, and <span class="serif">care after.</span></h2>
        </div>
        <div class="care-grid" data-reveal-group>
          <article><span>01</span><h3>Who it may suit</h3><p>${escapeHtml(item.candidacy)}</p></article>
          <article><span>02</span><h3>How to prepare</h3><p>${escapeHtml(item.preparation)}</p></article>
          <article><span>03</span><h3>Downtime & response</h3><p>${escapeHtml(item.downtime)}</p></article>
          <article><span>04</span><h3>Aftercare</h3><p>${escapeHtml(item.aftercare)}</p></article>
        </div>
        <div class="notice service-consultation-note" data-reveal><strong>Consultation matters:</strong> ${escapeHtml(item.consultationNote)}</div>
      </div>
    </section>

    ${providerBand(provider)}

    <section class="section section-pale" aria-labelledby="faq-title">
      <div class="narrow">
        <p class="eyebrow" data-reveal>Your questions, answered</p>
        <h2 class="section-title" id="faq-title" data-reveal>${escapeHtml(item.navName || item.name)} <span class="serif">FAQ.</span></h2>
        <div class="faq-list" data-reveal-group>
          ${faqItems(item.faqs)}
        </div>
      </div>
    </section>

    <section class="section section-paper">
      <div class="shell">
        <div class="related-heading" data-reveal>
          <div>
            <p class="eyebrow">Continue exploring</p>
            <h2 class="section-title">Related <span class="serif">treatments.</span></h2>
          </div>
          <a class="text-link" href="/service-light.html#${escapeHtml(item.category)}">View ${escapeHtml(category.shortLabel.toLowerCase())} <span aria-hidden="true">↗</span></a>
        </div>
        <div class="related-services">${related.map(relatedCard).join("")}</div>
        ${pagination({
          className: "service-pagination",
          ariaLabel: "Treatment pagination",
          previous: { href: serviceHref(previous), label: "Previous treatment", title: previous.navName || previous.name },
          next: { href: serviceHref(next), label: "Next treatment", title: next.navName || next.name },
        })}
      </div>
    </section>

    ${reviewSignal()}

    <section class="section section-paper">
      <div class="shell">
        ${ctaPanel({
          heading: "Begin with the right questions,",
          accent: "not a rushed decision.",
          body: "Use the live scheduler for current pricing and availability, then confirm suitability, scope, risks, and aftercare during consultation.",
          primary: { href: SITE.bookHref, label: item.bookingCta },
          secondary: { href: "/contact-us-light.html", label: "Contact the clinic" },
        })}
        <p class="medical-disclaimer">This page is general education and does not replace medical advice, diagnosis, or informed consent. Results, recovery, eligibility, and treatment plans vary. <a href="${escapeHtml(item.legacyUrl)}">View Anima’s current source page</a>.</p>
      </div>
    </section>
  </main>

  ${footer()}
  ${mobileActions()}
</body>
</html>
`;
};

for (const [index, item] of services.entries()) {
  const directory = `services/${item.slug}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, renderService(item, index));
}

console.log(`Generated ${services.length} service pages.`);
