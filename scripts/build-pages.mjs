import { mkdir, writeFile } from "node:fs/promises";
import { glowPlan, privacy, standalonePages } from "../data/pages.mjs";
import { ctaPanel, faqItems, list } from "./components.mjs";
import { breadcrumbList, cleanJson, faqPage, graph } from "./schema.mjs";
import { SITE, assetVersion, escapeHtml, footer, mobileActions, navigation } from "./site-shell.mjs";

const termRow = (page, [label, value]) =>
  `<div class="booking-meta"><strong>${escapeHtml(label)}</strong><span${value ? "" : ' class="term-deferred"'}>${escapeHtml(
    value || page.termsDeferral
  )}</span></div>`;

const journeyStep = ([title, description], index) =>
  `<article class="step"><small>${String(index + 1).padStart(2, "0")}</small><h3>${escapeHtml(
    title
  )}</h3><p>${escapeHtml(description)}</p></article>`;

const renderGlowPlan = (page) => {
  const canonical = `${SITE.origin}/${page.slug}/`;

  // Service + offers rather than Product/Offer: this is a membership sold by a
  // service business, and Product markup invites merchant-listing validation
  // errors. No priceValidUntil is claimed because none is published.
  const jsonLd = graph([
    {
      "@type": "Service",
      "@id": `${canonical}#membership`,
      name: "Anima Glow Plan",
      description: page.metaDescription,
      url: canonical,
      serviceType: "Skincare membership",
      areaServed: { "@type": "City", name: "Etobicoke" },
      provider: { "@id": `${SITE.origin}/#business` },
      offers: {
        "@type": "Offer",
        price: String(page.price.amount),
        priceCurrency: page.price.currency,
        url: canonical,
      },
    },
    faqPage(`${canonical}#faq`, page.faqs),
    breadcrumbList(`${canonical}#breadcrumb`, [
      ["Home", `${SITE.origin}/`],
      ["Glow Plan", canonical],
    ]),
  ]);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f2ecf2">
  <meta name="description" content="${escapeHtml(page.metaDescription)}">
  <title>${escapeHtml(page.seoTitle)}</title>
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(page.seoTitle)}">
  <meta property="og:description" content="${escapeHtml(page.metaDescription)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${SITE.icon}" type="image/png">
  <link rel="stylesheet" href="/assets/css/medspa.css?v=${assetVersion}">
  <script src="/assets/js/medspa.js?v=${assetVersion}" defer></script>
  <script type="application/ld+json">${cleanJson(jsonLd)}</script>
</head>
<body class="page-glow-plan">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${navigation("glow-plan")}

  <main id="main-content">
    <section class="page-hero">
      <div class="shell">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/index.html">Home</a><span aria-hidden="true">/</span>
          <span aria-current="page">${escapeHtml(page.navName)}</span>
        </nav>
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1 class="page-title" data-split-title>${escapeHtml(page.title)} <span class="serif">${escapeHtml(page.titleAccent)}</span></h1>
        <p class="lede">${escapeHtml(page.lede)}</p>
        <div class="page-hero-meta">
          ${page.chips.map((chip) => `<span class="meta-chip">${escapeHtml(chip)}</span>`).join("\n          ")}
        </div>
        <div class="button-row">
          <a class="button button-primary" href="${escapeHtml(page.cta.primary.href)}">${escapeHtml(page.cta.primary.label)} <span class="button-arrow" aria-hidden="true">↗</span></a>
          <a class="button button-outline" href="${SITE.phoneHref}">Call ${escapeHtml(SITE.phoneDisplay)}</a>
        </div>
      </div>
    </section>

    <section class="section section-pale">
      <div class="shell booking-layout">
        <aside class="booking-aside">
          <p class="eyebrow">What you are agreeing to</p>
          <h2>Membership terms</h2>
          <p>Anima publishes the monthly fee and the term length. The remaining terms are set out in the membership agreement, which you receive before signing — we do not restate them here.</p>
          ${page.terms.map((term) => termRow(page, term)).join("\n          ")}
        </aside>
        <div class="booking-widget" data-reveal>
          <p class="eyebrow">Is it worth it?</p>
          <h2 class="section-title">Worth checking against <span class="serif">how often you actually book.</span></h2>
          <p class="lede">At $159 per month over a 12-month term, the plan commits $1,908 before treatment costs. It rewards a regular cadence; it is poor value for occasional visits.</p>
          <p>Ask the clinic to compare member pricing against what you booked in the last twelve months. If the numbers do not favour the plan, they will tell you.</p>
          <div class="button-row">
            <a class="button button-primary" href="${escapeHtml(page.cta.primary.href)}">${escapeHtml(page.cta.primary.label)} <span class="button-arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-dark">
      <div class="shell service-benefits-grid">
        <div data-reveal>
          <p class="eyebrow">What membership includes</p>
          <h2 class="section-title">Five inclusions, <span class="serif">stated plainly.</span></h2>
          <p class="lede">These are the benefits Anima publishes for the Glow Plan. Treatment results are not part of what a membership can promise.</p>
        </div>
        <ul class="benefit-list" data-reveal-group>${list(page.benefits)}</ul>
      </div>
    </section>

    <section class="section section-paper">
      <div class="shell">
        <div class="service-section-heading" data-reveal>
          <p class="eyebrow">Your glow journey</p>
          <h2 class="section-title">How a membership year <span class="serif">actually runs.</span></h2>
        </div>
        <div class="steps" data-reveal-group>
          ${page.journey.map(journeyStep).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section section-pale" aria-labelledby="faq-title">
      <div class="narrow">
        <p class="eyebrow" data-reveal>Your questions, answered</p>
        <h2 class="section-title" id="faq-title" data-reveal>Glow Plan <span class="serif">FAQ.</span></h2>
        <div class="faq-list" data-reveal-group>
          ${faqItems(page.faqs)}
        </div>
      </div>
    </section>

    <section class="section section-paper">
      <div class="shell">
        ${ctaPanel(page.cta)}
        <p class="medical-disclaimer">Membership pricing and inclusions are as published by Anima Med Spa and may change. The membership agreement governs billing, cancellation, and renewal. Treatment suitability is always confirmed at consultation.</p>
      </div>
    </section>
  </main>

  ${footer()}
  ${mobileActions()}
</body>
</html>
`;
};

const renderPrivacy = (page) => {
  const canonical = `${SITE.origin}/${page.slug}/`;
  const jsonLd = graph([
    breadcrumbList(`${canonical}#breadcrumb`, [
      ["Home", `${SITE.origin}/`],
      ["Privacy", canonical],
    ]),
  ]);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f2ecf2">
  <meta name="description" content="${escapeHtml(page.metaDescription)}">
  <title>${escapeHtml(page.seoTitle)}</title>
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(page.seoTitle)}">
  <meta property="og:description" content="${escapeHtml(page.metaDescription)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${SITE.icon}" type="image/png">
  <link rel="stylesheet" href="/assets/css/medspa.css?v=${assetVersion}">
  <script src="/assets/js/medspa.js?v=${assetVersion}" defer></script>
  <script type="application/ld+json">${cleanJson(jsonLd)}</script>
</head>
<body class="page-privacy">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${navigation("")}

  <main id="main-content">
    <section class="page-hero">
      <div class="shell">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/index.html">Home</a><span aria-hidden="true">/</span>
          <span aria-current="page">Privacy</span>
        </nav>
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1 class="page-title" data-split-title>${escapeHtml(page.title)} <span class="serif">${escapeHtml(page.titleAccent)}</span></h1>
        <p class="lede">${escapeHtml(page.lede)}</p>
      </div>
    </section>

    <section class="section section-pale">
      <div class="narrow post-body">
        ${page.sections.map(([heading, body]) => `<h2>${escapeHtml(heading)}</h2>\n          <p>${escapeHtml(body)}</p>`).join("\n          ")}
        <p class="medical-disclaimer">Last updated <time datetime="${escapeHtml(page.updated)}">${escapeHtml(page.updated)}</time>. Questions about this notice can go to <a href="mailto:${escapeHtml(SITE.email)}">${escapeHtml(SITE.email)}</a> or ${escapeHtml(SITE.phoneDisplay)}.</p>
      </div>
    </section>
  </main>

  ${footer()}
  ${mobileActions()}
</body>
</html>
`;
};

await mkdir(glowPlan.slug, { recursive: true });
await writeFile(`${glowPlan.slug}/index.html`, renderGlowPlan(glowPlan));

await mkdir(privacy.slug, { recursive: true });
await writeFile(`${privacy.slug}/index.html`, renderPrivacy(privacy));

console.log(`Generated ${standalonePages.length} standalone pages.`);
