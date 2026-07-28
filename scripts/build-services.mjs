import { mkdir, writeFile } from "node:fs/promises";
import { categories, categoryById, serviceBySlug, services } from "../data/services.mjs";
import { escapeHtml, footer, mobileActions, navigation, serviceHref } from "./site-shell.mjs";

const cleanJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
const list = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
const bodyClass = (category) => `page-service-detail service-category-${category}`;

const localBusiness = {
  "@type": "MedicalBusiness",
  "@id": "https://animamedspa.com/#business",
  name: "Anima Med Spa",
  url: "https://animamedspa.com/",
  telephone: "+1-437-770-9296",
  email: "animamedspa@gmail.com",
  image: "https://anima-medspa.vercel.app/assets/img/medspa/hero.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2885 Lakeshore Blvd West",
    addressLocality: "Etobicoke",
    addressRegion: "ON",
    postalCode: "M8V 1J1",
    addressCountry: "CA",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "18:00",
    },
  ],
};

const structuredData = (item, category) => {
  const graph = [
    localBusiness,
    {
      "@type": "Service",
      "@id": `${item.legacyUrl}#service`,
      name: item.name,
      description: item.metaDescription,
      url: item.legacyUrl,
      serviceType: item.name,
      category: category.label,
      areaServed: { "@type": "City", name: "Etobicoke" },
      provider: { "@id": "https://animamedspa.com/#business" },
      image: `https://anima-medspa.vercel.app/assets/img/services/${item.imageStem}-1280.webp`,
    },
    {
      "@type": "FAQPage",
      "@id": `${item.legacyUrl}#faq`,
      mainEntity: item.faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${item.legacyUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://animamedspa.com/" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://animamedspa.com/services/" },
        { "@type": "ListItem", position: 3, name: item.name, item: item.legacyUrl },
      ],
    },
  ];

  if (item.provider) {
    graph.push({
      "@type": "Person",
      "@id": `${item.legacyUrl}#provider`,
      name: item.provider.name,
      jobTitle: item.provider.role,
      description: item.provider.bio,
      image: `https://anima-medspa.vercel.app/assets/img/services/${item.provider.imageStem}-1280.webp`,
      worksFor: { "@id": "https://animamedspa.com/#business" },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

const picture = (item, className = "") => `<picture${className ? ` class="${className}"` : ""}>
  <source media="(max-width: 700px)" srcset="/assets/img/services/${item.imageStem}-640.webp">
  <img src="/assets/img/services/${item.imageStem}-1280.webp" alt="${escapeHtml(item.heroAlt)}" width="1280" height="853" loading="lazy">
</picture>`;

const relatedCard = (related) => {
  const category = categoryById.get(related.category);
  return `<a class="related-service-card" href="${serviceHref(related)}" data-reveal>
    <span class="related-service-image">${picture(related)}</span>
    <span class="related-service-meta">${escapeHtml(category.shortLabel)} <span aria-hidden="true">↗</span></span>
    <strong>${escapeHtml(related.navName || related.name)}</strong>
    <span>${escapeHtml(related.intro)}</span>
  </a>`;
};

const renderProvider = (item) => {
  if (!item.provider) return "";
  return `<section class="section section-dark service-provider" aria-labelledby="provider-title">
      <div class="shell service-provider-grid">
        <picture class="provider-portrait image-reveal">
          <source media="(max-width: 700px)" srcset="/assets/img/services/${item.provider.imageStem}-640.webp">
          <img src="/assets/img/services/${item.provider.imageStem}-1280.webp" alt="${escapeHtml(item.provider.alt)}" width="800" height="718" loading="lazy">
        </picture>
        <div data-reveal>
          <p class="eyebrow">Provider published by Anima</p>
          <h2 class="section-title" id="provider-title">${escapeHtml(item.provider.name)}, <span class="serif">${escapeHtml(item.provider.role)}</span></h2>
          <p class="provider-credentials">${escapeHtml(item.provider.credentials)}</p>
          <p class="lede">${escapeHtml(item.provider.bio)}</p>
          <p class="provider-verification">Credentials and current clinical role should be confirmed directly during booking.</p>
        </div>
      </div>
    </section>`;
};

const renderService = (item, index) => {
  const category = categoryById.get(item.category);
  const previous = services[(index - 1 + services.length) % services.length];
  const next = services[(index + 1) % services.length];
  const related = item.relatedSlugs.map((slug) => serviceBySlug.get(slug));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#faeee5">
  <meta name="description" content="${escapeHtml(item.metaDescription)}">
  <title>${escapeHtml(item.seoTitle)}</title>
  <link rel="canonical" href="${escapeHtml(item.legacyUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(item.seoTitle)}">
  <meta property="og:description" content="${escapeHtml(item.metaDescription)}">
  <meta property="og:url" content="${escapeHtml(item.legacyUrl)}">
  <meta property="og:image" content="https://anima-medspa.vercel.app/assets/img/services/${item.imageStem}-1280.webp">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/img/medspa/logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/medspa.css">
  <script src="/assets/js/medspa.js" defer></script>
  <script type="application/ld+json">${cleanJson(structuredData(item, category))}</script>
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
              <a class="button button-primary" href="/book-now.html">${escapeHtml(item.bookingCta)} <span class="button-arrow" aria-hidden="true">↗</span></a>
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
          ${item.process
            .map(
              ([title, description], processIndex) => `<li>
            <span>${String(processIndex + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
          </li>`
            )
            .join("")}
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

    ${renderProvider(item)}

    <section class="section section-pale" aria-labelledby="faq-title">
      <div class="narrow">
        <p class="eyebrow" data-reveal>Your questions, answered</p>
        <h2 class="section-title" id="faq-title" data-reveal>${escapeHtml(item.navName || item.name)} <span class="serif">FAQ.</span></h2>
        <div class="faq-list" data-reveal-group>
          ${item.faqs
            .map(
              ([question, answer], faqIndex) => `<details class="faq-item">
            <summary><span class="faq-index">${String(faqIndex + 1).padStart(2, "0")}</span><span>${escapeHtml(question)}</span><span class="faq-icon" aria-hidden="true"></span></summary>
            <div class="faq-answer"><p>${escapeHtml(answer)}</p></div>
          </details>`
            )
            .join("")}
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
        <nav class="service-pagination" aria-label="Treatment pagination">
          <a href="${serviceHref(previous)}"><small>Previous treatment</small><strong>← ${escapeHtml(previous.navName || previous.name)}</strong></a>
          <a href="${serviceHref(next)}"><small>Next treatment</small><strong>${escapeHtml(next.navName || next.name)} →</strong></a>
        </nav>
      </div>
    </section>

    <section class="section section-pale">
      <div class="shell review-signal-grid">
        <div data-reveal>
          <p class="eyebrow">Verified client signal</p>
          <h2 class="section-title">A 5.0 rating you can <span class="serif">check yourself.</span></h2>
          <p class="lede">Read Anima’s 18 verified Fresha reviews in the original booking profile before deciding what feels right for you.</p>
          <div class="button-row">
            <a class="button button-outline" href="https://www.fresha.com/store/anima-medspa-store-sqkfn0xx?share=true&amp;pId=2700299" target="_blank" rel="noopener">Read verified reviews <span class="button-arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div class="service-rating" data-reveal>
          <strong>5.0</strong>
          <span aria-label="5 out of 5 stars">★★★★★</span>
          <p>18 verified reviews on Fresha</p>
        </div>
      </div>
    </section>

    <section class="section section-paper">
      <div class="shell">
        <div class="cta-panel" data-reveal>
          <h2>Begin with the right questions, <span class="serif">not a rushed decision.</span></h2>
          <p>Use the live scheduler for current pricing and availability, then confirm suitability, scope, risks, and aftercare during consultation.</p>
          <div class="button-row">
            <a class="button button-light" href="/book-now.html">${escapeHtml(item.bookingCta)} <span class="button-arrow" aria-hidden="true">↗</span></a>
            <a class="button button-outline" href="/contact-us-light.html">Contact the clinic</a>
          </div>
        </div>
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

const redirects = services.flatMap((item) => {
  const sourcePath = new URL(item.legacyUrl).pathname;
  const destination = `/services/${item.slug}/`;

  // Vercel normalizes requests to trailing-slash URLs before evaluating custom
  // redirects. Match that normalized path and omit no-op mappings where the
  // legacy and clean routes are already identical.
  return sourcePath === destination
    ? []
    : [{ source: sourcePath, destination, permanent: true }];
});

await writeFile(
  "vercel.json",
  `${JSON.stringify(
    {
      outputDirectory: ".",
      cleanUrls: true,
      trailingSlash: true,
      redirects,
      headers: [
        {
          source: "/assets/(.*)",
          headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
        },
      ],
    },
    null,
    2
  )}\n`
);

console.log(`Generated ${services.length} service pages and ${redirects.length} legacy redirects.`);
