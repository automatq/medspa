import { categories, services } from "../data/services.mjs";

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

  const mobileGroups = categories
    .map((category, index) => {
      const links = services
        .filter((item) => item.category === category.id)
        .map((item) => `<a href="${serviceHref(item)}">${escapeHtml(item.navName || item.name)} <span aria-hidden="true">↗</span></a>`)
        .join("");
      return `<details class="mobile-category"${index === 0 ? " open" : ""}>
              <summary>${escapeHtml(category.shortLabel)} <span aria-hidden="true"></span></summary>
              <div class="mobile-category-links">${links}</div>
            </details>`;
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
              <a href="/service-light.html">View all 25 treatments <span aria-hidden="true">↗</span></a>
            </div>
            <div class="mega-menu-grid">${megaGroups}</div>
            <div class="mega-menu-footer">
              <p>Not sure where to begin? A complimentary consultation can help you compare fit, downtime, and current pricing.</p>
              <a class="button button-plum" href="/book-now.html">Book now <span class="button-arrow" aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
        <a class="nav-link" href="/about-us-light.html"${current(active, "about")}>About</a>
        <a class="nav-link" href="/faq-light.html"${current(active, "faq")}>FAQ</a>
        <a class="nav-link" href="/contact-us-light.html"${current(active, "contact")}>Contact</a>
      </nav>

      <a class="site-logo" href="/index.html" aria-label="Anima Med Spa home">
        <img src="/assets/img/medspa/logo.svg" alt="Anima Med Spa">
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
      <a href="/about-us-light.html"${current(active, "about")}>About <span aria-hidden="true">↗</span></a>
      <a href="/faq-light.html"${current(active, "faq")}>FAQ <span aria-hidden="true">↗</span></a>
      <a href="/contact-us-light.html"${current(active, "contact")}>Contact <span aria-hidden="true">↗</span></a>
    </div>
    <div class="mobile-menu-services">
      <p>All treatments</p>
      ${mobileGroups}
    </div>
    <div class="mobile-menu-contact">
      <a class="button button-primary" href="/book-now.html">Book a visit</a>
      <a class="button button-outline" href="tel:+14377709296">Call 437-770-9296</a>
    </div>
  </nav>`;
};

export const footer = () => `<footer class="site-footer">
    <div class="shell footer-top">
      <div class="footer-brand">
        <a href="/index.html" aria-label="Anima Med Spa home"><img src="/assets/img/medspa/logo-white.svg" alt="Anima Med Spa"></a>
        <p>Personalized medical aesthetics, skin, laser, wellness, and beauty treatments in Etobicoke’s Lakeshore Village.</p>
      </div>
      <div class="footer-column">
        <h2>Explore</h2>
        <a href="/service-light.html">All treatments</a>
        <a href="/service-details-light.html">Treatment guide</a>
        <a href="/about-us-light.html">About Anima</a>
        <a href="/faq-light.html">FAQ</a>
        <a href="/book-now.html">Book now</a>
      </div>
      <div class="footer-column">
        <h2>Visit</h2>
        <a href="https://maps.google.com/?q=2885+Lakeshore+Blvd+West+Etobicoke+ON+M8V+1J1" target="_blank" rel="noopener">2885 Lakeshore Blvd West<br>Etobicoke, ON M8V 1J1</a>
        <a href="tel:+14377709296">437-770-9296</a>
        <a href="mailto:animamedspa@gmail.com">animamedspa@gmail.com</a>
        <span>Mon–Sat, 10 AM–6 PM</span>
      </div>
    </div>
    <div class="shell footer-bottom">
      <span>© <span data-year>2026</span> Anima Med Spa. All rights reserved.</span>
      <div class="footer-social">
        <a href="https://www.instagram.com/animamedspa/" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.tiktok.com/@anima.medspa" target="_blank" rel="noopener">TikTok</a>
        <a href="https://www.facebook.com/people/Anima-Med-Spa/61583872176865/" target="_blank" rel="noopener">Facebook</a>
      </div>
    </div>
  </footer>`;

export const mobileActions = () => `<nav class="mobile-actions" aria-label="Quick actions">
    <a href="tel:+14377709296">Call</a>
    <a href="/book-now.html">Book now</a>
  </nav>`;

