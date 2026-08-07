import { categories, services } from "../data/services.mjs";

// Bump whenever assets/css or assets/js changes — /assets/* is served
// immutable for a year, so a stale version ships unstyled sections.
export const assetVersion = "20260807-hero";

// Canonical URLs still point at the WordPress origin while the rebuild is staged;
// absolute asset URLs (og:image, JSON-LD) resolve from the Vercel deployment.
export const SITE = {
  origin: "https://animamedspa.com",
  assetOrigin: "https://anima-medspa.vercel.app",
  name: "Anima Med Spa",
  phoneDisplay: "437-770-9296",
  phoneHref: "tel:+14377709296",
  phoneSchema: "+1-437-770-9296",
  email: "animamedspa@gmail.com",
  bookHref: "/book-now.html",
  // Header/footer render the mark at 74-92px, so ship a right-sized crop
  // (~8KB) instead of the 1024px master (~71KB) on every page. The full-size
  // file is still used by the homepage intro overlay, where it fills ~390px.
  logo: "/assets/img/medspa/anima-logo-200.jpg",
  logoFull: "/assets/img/medspa/anima-logo-20260729.jpg",
  icon: "/assets/img/medspa/anima-logo-icon-20260729.png",
  mapsUrl: "https://maps.google.com/?q=2885+Lakeshore+Blvd+West+Etobicoke+ON+M8V+1J1",
  freshaUrl: "https://www.fresha.com/store/anima-medspa-store-sqkfn0xx?share=true&pId=2700299",
  address: {
    street: "2885 Lakeshore Blvd West",
    locality: "Etobicoke",
    region: "ON",
    postalCode: "M8V 1J1",
    country: "CA",
  },
  hours: "Mon–Sat, 10 AM–6 PM",
};

export const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const serviceHref = (service) => `/services/${service.slug}/`;

const current = (active, target) => (active === target ? ' aria-current="page"' : "");

export const navigation = (active = "") => {
  const megaGroups = categories
    .map((category) => {
      const links = services
        .filter((item) => item.category === category.id)
        .map((item) => `<a href="${serviceHref(item)}">${escapeHtml(item.navName || item.name)}</a>`)
        .join("");
      return `<div class="mega-menu-group">
                <h2>${escapeHtml(category.shortLabel)}</h2>
                ${links}
              </div>`;
    })
    .join("");

  // Deliberately the same shape as megaGroups above: below 1100px the directory
  // renders as a card that mirrors the desktop mega-menu, so both share styling
  // rather than maintaining two visual languages for the same content.
  const mobileGroups = categories
    .map((category) => {
      const links = services
        .filter((item) => item.category === category.id)
        .map((item) => `<a href="${serviceHref(item)}">${escapeHtml(item.navName || item.name)}</a>`)
        .join("");
      return `<div class="mobile-menu-group">
                <h2>${escapeHtml(category.shortLabel)}</h2>
                ${links}
              </div>`;
    })
    .join("");

  return `<header class="site-header">
    <div class="shell header-inner">
      <nav class="desktop-nav" aria-label="Primary">
        <a class="nav-link" href="/index.html"${current(active, "home")}>Home</a>
        <div class="nav-dropdown" data-nav-dropdown data-open="false">
          <a href="/service-light.html"${current(active, "treatments")}>Treatments</a>
          <button class="nav-dropdown-toggle" type="button" data-dropdown-toggle aria-expanded="false" aria-controls="treatments-menu" aria-label="Open treatment directory">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
          </button>
          <div class="mega-menu" id="treatments-menu">
            <div class="mega-menu-intro">
              <p class="eyebrow">Complete treatment directory</p>
              <a href="/service-light.html">View all ${services.length} treatments <span aria-hidden="true">↗</span></a>
            </div>
            <div class="mega-menu-grid">${megaGroups}</div>
            <div class="mega-menu-footer">
              <p>Not sure where to begin? A complimentary consultation can help you compare fit, downtime, and current pricing.</p>
              <a class="button button-plum" href="/book-now.html">Book now <span class="button-arrow" aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
        <a class="nav-link" href="/glow-plan/"${current(active, "glow-plan")}>Glow Plan</a>
        <a class="nav-link" href="/about-us-light.html"${current(active, "about")}>About</a>
        <a class="nav-link" href="/blog/"${current(active, "blog")}>Journal</a>
        <a class="nav-link" href="/faq-light.html"${current(active, "faq")}>FAQ</a>
        <a class="nav-link" href="/contact-us-light.html"${current(active, "contact")}>Contact</a>
      </nav>

      <a class="site-logo" href="/index.html" aria-label="Anima Med Spa home">
        <img src="${SITE.logo}" width="200" height="200" alt="Anima Med Spa" fetchpriority="high">
      </a>

      <div class="header-actions">
        <a class="header-phone" href="tel:+14377709296">437-770-9296</a>
        <a class="button button-primary header-book" href="/book-now.html">Book now</a>
        <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
          <span class="menu-toggle-lines" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </header>

  <nav class="mobile-menu" id="mobile-menu" data-mobile-menu aria-label="Mobile" hidden>
    <div class="mobile-menu-links">
      <a href="/index.html"${current(active, "home")}>Home <span aria-hidden="true">↗</span></a>
      <a href="/service-light.html"${current(active, "treatments")}>Treatments <span aria-hidden="true">↗</span></a>
      <a href="/glow-plan/"${current(active, "glow-plan")}>Glow Plan <span aria-hidden="true">↗</span></a>
      <a href="/about-us-light.html"${current(active, "about")}>About <span aria-hidden="true">↗</span></a>
      <a href="/blog/"${current(active, "blog")}>Journal <span aria-hidden="true">↗</span></a>
      <a href="/faq-light.html"${current(active, "faq")}>FAQ <span aria-hidden="true">↗</span></a>
      <a href="/contact-us-light.html"${current(active, "contact")}>Contact <span aria-hidden="true">↗</span></a>
    </div>
    <div class="mobile-menu-services">
      <div class="mobile-menu-intro">
        <p class="eyebrow">Complete treatment directory</p>
        <a href="/service-light.html">View all ${services.length} treatments <span aria-hidden="true">↗</span></a>
      </div>
      <div class="mobile-menu-grid">${mobileGroups}</div>
      <div class="mobile-menu-footer">
        <p>Not sure where to begin? A complimentary consultation can help you compare fit, downtime, and current pricing.</p>
        <div class="mobile-menu-contact">
          <a class="button button-plum" href="${SITE.bookHref}">Book now <span class="button-arrow" aria-hidden="true">↗</span></a>
          <a class="button button-outline" href="${SITE.phoneHref}">Call ${SITE.phoneDisplay}</a>
        </div>
      </div>
    </div>
  </nav>`;
};

export const footer = () => `<footer class="site-footer">
    <div class="footer-main">
      <section class="footer-overview" aria-labelledby="footer-heading">
        <div class="footer-brand" data-reveal>
          <a class="footer-logo" href="/index.html" aria-label="Anima Med Spa home">
            <img src="/assets/img/medspa/anima-logo-20260729.jpg" width="1024" height="946" alt="Anima Med Spa" loading="lazy" decoding="async">
          </a>
          <div class="footer-intro">
            <p class="footer-kicker">Medical aesthetics · Skin · Wellness</p>
            <h2 id="footer-heading">Care that feels <em>considered.</em></h2>
            <p>Personalized treatments and thoughtful guidance in the heart of Etobicoke’s Lakeshore Village.</p>
          </div>
        </div>

        <div class="footer-directory" data-reveal-group>
          <nav class="footer-column footer-explore" aria-label="Footer">
            <h3>Explore</h3>
            <div class="footer-link-grid">
              <a href="/service-light.html">All treatments</a>
              <a href="/glow-plan/">Glow Plan</a>
              <a href="/about-us-light.html">About Anima</a>
              <a href="/blog/">Journal</a>
              <a href="/faq-light.html">Questions</a>
              <a href="/contact-us-light.html">Contact</a>
            </div>
          </nav>
          <div class="footer-column footer-contact">
            <h3>Hours &amp; contact</h3>
            <p>${SITE.hours}</p>
            <a href="${SITE.phoneHref}">${SITE.phoneDisplay}</a>
            <a href="mailto:${SITE.email}">${SITE.email}</a>
          </div>
        </div>
      </section>

      <section class="footer-visit" aria-labelledby="footer-visit-title">
        <div class="footer-visit-heading" data-reveal>
          <p class="footer-kicker">Lakeshore Village · Etobicoke</p>
          <h2 id="footer-visit-title">Visit <em>Anima.</em></h2>
        </div>
        <div class="footer-map" data-reveal style="--reveal-delay: 70ms">
          <iframe src="https://www.google.com/maps?q=2885%20Lakeshore%20Blvd%20West%2C%20Etobicoke%2C%20ON%20M8V%201J1&amp;output=embed" title="Map showing Anima Med Spa at 2885 Lakeshore Boulevard West in Etobicoke" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <a class="footer-address" href="${SITE.mapsUrl}" target="_blank" rel="noopener" data-reveal style="--reveal-delay: 110ms">
          <span>${SITE.address.street}<br>${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postalCode}</span>
          <strong>Get directions <span aria-hidden="true">↗</span></strong>
        </a>
        <div class="footer-actions" data-reveal style="--reveal-delay: 150ms">
          <a class="footer-action" href="${SITE.phoneHref}">
            <span>Speak with our team</span>
            <strong>Call now <span aria-hidden="true">↗</span></strong>
          </a>
          <a class="footer-action footer-action-primary" href="${SITE.bookHref}">
            <span>Ready when you are</span>
            <strong>Book now <span aria-hidden="true">↗</span></strong>
          </a>
        </div>
      </section>
    </div>

    <div class="footer-bottom">
      <div class="shell footer-bottom-inner">
        <div class="footer-legal">
          <span>© <span data-year>2026</span> Anima Med Spa</span>
          <a href="/privacy/">Privacy</a>
        </div>
        <div class="footer-social" aria-label="Anima Med Spa on social media">
          <a href="https://www.instagram.com/animamedspa/" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.tiktok.com/@anima.medspa" target="_blank" rel="noopener">TikTok</a>
          <a href="https://www.facebook.com/people/Anima-Med-Spa/61583872176865/" target="_blank" rel="noopener">Facebook</a>
        </div>
      </div>
    </div>
  </footer>`;

export const mobileActions = () => `<nav class="mobile-actions" aria-label="Quick actions">
    <a href="tel:+14377709296">Call</a>
    <a href="/book-now.html">Book now</a>
  </nav>`;
