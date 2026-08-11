import { mkdir, writeFile } from "node:fs/promises";
import { CAMPAIGN_PHONE, campaigns, thankYou } from "../data/campaigns.mjs";
import { serviceBySlug } from "../data/services.mjs";
import { faqItems, list } from "./components.mjs";
import { cleanJson, graph } from "./schema.mjs";
import { SITE, assetVersion, escapeHtml, fontPreloads, scriptTail } from "./site-shell.mjs";

/**
 * Paid-campaign landing pages. Unlike every other page on the site these render
 * without site navigation or footer — ad traffic gets one job, not a site tour.
 *
 * Three rules encoded here:
 *  - `noindex` on every one. /intimate-brightening/ would otherwise compete with
 *    /services/intimate-brightening/ for the same query.
 *  - The campaign tracking number is the CTA, but JSON-LD always carries the
 *    clinic's real line, and the footer shows both so they reconcile. An
 *    unbranded page with an unfamiliar phone number reads as a scam.
 *  - Every third-party embed ships with a visible fallback link. A chrome-less
 *    page whose form is blocked has no other way out.
 */

const campaignHeader = () => `<header class="lp-bar">
    <div class="shell lp-bar-inner">
      <img src="${SITE.logo}" alt="${escapeHtml(SITE.name)}" width="120" height="40">
      <div class="lp-bar-actions">
        <a href="${CAMPAIGN_PHONE.href}">${escapeHtml(CAMPAIGN_PHONE.display)}</a>
        <a class="button button-primary" href="#book">Book</a>
      </div>
    </div>
  </header>`;

const campaignFooter = (canonicalService) => `<footer class="lp-footer">
    <div class="shell">
      <div class="lp-footer-grid">
        <div>
          <strong>${escapeHtml(SITE.name)}</strong><br>
          ${escapeHtml(SITE.address.street)}<br>
          ${escapeHtml(SITE.address.locality)}, ${escapeHtml(SITE.address.region)} ${escapeHtml(SITE.address.postalCode)}
        </div>
        <div>
          Clinic: <a href="${SITE.phoneHref}">${escapeHtml(SITE.phoneDisplay)}</a><br>
          This campaign: <a href="${CAMPAIGN_PHONE.href}">${escapeHtml(CAMPAIGN_PHONE.display)}</a><br>
          ${escapeHtml(SITE.hours)}
        </div>
        <div>
          <a href="/index.html">Main website</a><br>
          ${canonicalService ? `<a href="/services/${canonicalService.slug}/">Full treatment page</a><br>` : ""}
          <a href="/privacy/">Privacy notice</a>
        </div>
      </div>
      <p class="medical-disclaimer">This page is general education and does not replace medical advice, diagnosis, or informed consent. Suitability, results, and recovery vary and are confirmed at consultation.</p>
      <p>© <span data-year>2026</span> ${escapeHtml(SITE.name)}. All rights reserved.</p>
    </div>
  </footer>`;

const renderSection = (section, index) => {
  const shade = index % 2 === 0 ? "section-paper" : "section-pale";
  const heading = `<div class="service-section-heading" data-reveal>
          <h2 class="section-title">${escapeHtml(section.heading)}${
    section.accent ? ` ${scriptTail(section.accent)}` : ""
  }</h2>
          ${section.lede ? `<p class="lede">${escapeHtml(section.lede)}</p>` : ""}
        </div>`;

  let body = "";
  if (section.type === "list") {
    body = `<ul class="concern-list" data-reveal-group>${list(section.items)}</ul>`;
  } else if (section.type === "steps") {
    body = `<ol class="service-process" data-reveal-group>${section.items
      .map(
        ([title, description], stepIndex) => `<li>
            <span>${String(stepIndex + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
          </li>`
      )
      .join("")}</ol>`;
  }

  const prose = (section.prose || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n          ");

  // A "notice" carries the limits of the treatment. It renders as a callout so
  // it reads at the same weight as the benefits, not as small print beneath them.
  if (section.type === "notice") {
    return `<section class="section ${shade}">
      <div class="narrow">
        ${heading}
        <div class="notice" data-reveal>${prose}</div>
        ${section.items ? `<ul class="concern-list" data-reveal-group>${list(section.items)}</ul>` : ""}
      </div>
    </section>`;
  }

  return `<section class="section ${shade}">
      <div class="shell service-editorial-grid">
        ${heading}
        <div>
          ${body}
          ${prose ? `<div class="service-prose" data-reveal>${prose}</div>` : ""}
        </div>
      </div>
    </section>`;
};

const embedBlock = (campaign) => `<section class="section section-pale" id="book">
      <div class="shell booking-layout">
        <aside class="booking-aside">
          <p class="eyebrow">Book this treatment</p>
          <h2>Choose a time</h2>
          <p>Pick a slot in the calendar, or send your details and the clinic will call you back to arrange one.</p>
          <div class="booking-meta"><strong>Call this campaign</strong><span><a href="${
            CAMPAIGN_PHONE.href
          }">${escapeHtml(CAMPAIGN_PHONE.display)}</a></span></div>
          <div class="booking-meta"><strong>Clinic</strong><span><a href="${SITE.phoneHref}">${escapeHtml(
  SITE.phoneDisplay
)}</a></span></div>
          <div class="booking-meta"><strong>Where</strong><span>${escapeHtml(SITE.address.street)}<br>${escapeHtml(
  SITE.address.locality
)}, ${escapeHtml(SITE.address.region)} ${escapeHtml(SITE.address.postalCode)}</span></div>
        </aside>
        <div class="booking-widget">
          <iframe src="https://api.leadconnectorhq.com/widget/booking/${escapeHtml(
            campaign.embeds.calendarId
          )}" title="Booking calendar for ${escapeHtml(
  campaign.title
)}" style="width:100%;border:none;overflow:hidden" height="740" scrolling="no" loading="lazy"></iframe>
          <p class="booking-fallback">If the calendar does not load, <a href="https://api.leadconnectorhq.com/widget/booking/${escapeHtml(
            campaign.embeds.calendarId
          )}" target="_blank" rel="noopener">open it in a new tab</a> or call <a href="${
  CAMPAIGN_PHONE.href
}">${escapeHtml(CAMPAIGN_PHONE.display)}</a>.</p>
        </div>
      </div>
    </section>

    <section class="section section-paper">
      <div class="shell booking-layout">
        <aside class="booking-aside">
          <p class="eyebrow">Questions first</p>
          <h2>Send a message</h2>
          <p>Ask anything about suitability, comfort, or how many sessions you are likely to need.</p>
          <p class="form-consent">Details submitted here go to Anima's booking provider, LeadConnector, and are used to contact you about this enquiry. See the <a href="/privacy/">privacy notice</a>.</p>
        </aside>
        <div class="booking-widget">
          <iframe src="https://api.leadconnectorhq.com/widget/form/${escapeHtml(
            campaign.embeds.formId
          )}" title="${escapeHtml(
  campaign.embeds.formName
)}" style="width:100%;border:none" height="560" loading="lazy"></iframe>
          <p class="booking-fallback">If the form does not load, email <a href="mailto:${escapeHtml(
            SITE.email
          )}">${escapeHtml(SITE.email)}</a> or call <a href="${CAMPAIGN_PHONE.href}">${escapeHtml(
  CAMPAIGN_PHONE.display
)}</a>.</p>
        </div>
      </div>
    </section>`;

const renderCampaign = (campaign) => {
  const canonicalService = serviceBySlug.get(campaign.canonicalServiceSlug);
  const canonical = `${SITE.origin}/${campaign.slug}/`;
  const jsonLd = graph([
    {
      "@type": "Service",
      "@id": `${canonical}#service`,
      name: campaign.title,
      description: campaign.metaDescription,
      url: canonical,
      areaServed: { "@type": "City", name: "Etobicoke" },
      provider: { "@id": `${SITE.origin}/#business` },
    },
  ]);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f6f0e6">
  <meta name="description" content="${escapeHtml(campaign.metaDescription)}">
  <title>${escapeHtml(campaign.seoTitle)}</title>
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="${SITE.icon}" type="image/png">
  ${fontPreloads}
  <link rel="stylesheet" href="/assets/css/medspa.css?v=${assetVersion}">
  <script src="/assets/js/medspa.js?v=${assetVersion}" defer></script>
  <script type="application/ld+json">${cleanJson(jsonLd)}</script>
</head>
<body class="page-lp" data-campaign="${escapeHtml(campaign.slug)}">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${campaignHeader()}

  <main id="main-content">
    <section class="service-hero">
      <div class="shell">
        <p class="eyebrow">${escapeHtml(campaign.eyebrow)}</p>
        <h1 class="service-title" data-split-title>${escapeHtml(campaign.title)} ${scriptTail(campaign.titleAccent)}</h1>
        <p class="service-intro">${escapeHtml(campaign.lede)}</p>
        <div class="button-row">
          <a class="button button-primary" href="#book">${escapeHtml(
            campaign.cta.primary.label
          )} <span class="button-arrow" aria-hidden="true">↗</span></a>
          <a class="button button-outline" href="${CAMPAIGN_PHONE.href}">Call ${escapeHtml(
    CAMPAIGN_PHONE.display
  )}</a>
        </div>
        <dl class="service-facts" data-reveal-group>
          ${campaign.facts
            .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
            .join("\n          ")}
        </dl>
      </div>
    </section>

    ${campaign.sections.map(renderSection).join("\n\n    ")}

    <section class="section section-dark" aria-labelledby="lp-faq-title">
      <div class="narrow">
        <p class="eyebrow" data-reveal>Common questions</p>
        <h2 class="section-title" id="lp-faq-title" data-reveal>Before you <span class="script">book.</span></h2>
        <div class="faq-list" data-reveal-group>
          ${faqItems(campaign.faqs)}
        </div>
      </div>
    </section>

    ${embedBlock(campaign)}

    <section class="section section-paper">
      <div class="narrow">
        <div class="cta-panel" data-reveal>
          <h2>${escapeHtml(campaign.cta.heading)} ${scriptTail(campaign.cta.accent)}</h2>
          <p>${escapeHtml(campaign.cta.body)}</p>
          <div class="button-row">
            <a class="button button-light" href="#book">${escapeHtml(
              campaign.cta.primary.label
            )} <span class="button-arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
    </section>
  </main>

  ${campaignFooter(canonicalService)}
</body>
</html>
`;
};

const renderThankYou = (page) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f6f0e6">
  <meta name="description" content="${escapeHtml(page.metaDescription)}">
  <title>${escapeHtml(page.seoTitle)}</title>
  <meta name="robots" content="noindex, follow">
  <link rel="icon" href="${SITE.icon}" type="image/png">
  ${fontPreloads}
  <link rel="stylesheet" href="/assets/css/medspa.css?v=${assetVersion}">
  <script src="/assets/js/medspa.js?v=${assetVersion}" defer></script>
</head>
<body class="page-lp page-thank-you">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${campaignHeader()}

  <main id="main-content">
    <section class="page-hero">
      <div class="narrow">
        <p class="eyebrow">Request received</p>
        <h1 class="page-title">${escapeHtml(page.title)} ${scriptTail(page.titleAccent)}</h1>
        <p class="lede">${escapeHtml(page.lede)}</p>
      </div>
    </section>

    <section class="section section-paper">
      <div class="shell">
        <div class="steps">
          ${page.steps
            .map(
              ([title, description], index) =>
                `<article class="step"><small>${String(index + 1).padStart(2, "0")}</small><h3>${escapeHtml(
                  title
                )}</h3><p>${escapeHtml(description)}</p></article>`
            )
            .join("\n          ")}
        </div>
        <div class="button-row">
          <a class="button button-primary" href="${CAMPAIGN_PHONE.href}">Call ${escapeHtml(
  CAMPAIGN_PHONE.display
)}</a>
          <a class="button button-outline" href="/index.html">Visit the main site</a>
        </div>
      </div>
    </section>
  </main>

  ${campaignFooter(null)}
</body>
</html>
`;

for (const campaign of campaigns) {
  await mkdir(campaign.slug, { recursive: true });
  await writeFile(`${campaign.slug}/index.html`, renderCampaign(campaign));
}

await mkdir(thankYou.slug, { recursive: true });
await writeFile(`${thankYou.slug}/index.html`, renderThankYou(thankYou));

console.log(`Generated ${campaigns.length} campaign landing pages and the thank-you page.`);
