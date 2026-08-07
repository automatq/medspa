import { posts } from "./blog.mjs";

/**
 * Legacy WordPress URLs that aren't service pages. Service redirects are derived
 * from each record's `legacyUrl` in scripts/build-routes.mjs; everything else
 * lives here.
 *
 * Destinations use the extensionless, trailing-slash form because vercel.json
 * sets cleanUrls + trailingSlash — pointing at "/about-us-light.html" would cost
 * every visitor a second hop.
 */

// Old post permalinks were bare slugs at the site root.
const blogPostRedirects = new Map([
  ["/reverse-the-summer-damage-your-skins-back-to-school-reset/", "reverse-the-summer-damage"],
  ["/ask-your-esthetician-whats-actually-worth-booking-this-july/", "worth-booking-this-july"],
  ["/why-your-skin-works-harder-in-summer-and-what-men-can-do-about-it/", "summer-skin-for-men"],
  ["/april-it-is-always-facial-weather/", "always-facial-weather"],
  ["/what-is-a-hollywood-carbon-laser-peel-why-is-everyone-talking-about-it/", "hollywood-carbon-laser-peel"],
  ["/body-image-and-confidence-caring-for-your-skin-and-body/", "body-image-and-confidence"],
]);

const postSlugs = new Set(posts.map((post) => post.slug));
for (const [source, slug] of blogPostRedirects) {
  if (!postSlugs.has(slug)) throw new Error(`redirect ${source} points at a missing post: ${slug}`);
}

export const extraRedirects = [
  ...[...blogPostRedirects].map(([source, slug]) => ({ source, destination: `/blog/${slug}/`, permanent: true })),

  // Blog archive and its single category.
  { source: "/blog-old/", destination: "/blog/", permanent: true },
  { source: "/category/tips-tricks/", destination: "/blog/", permanent: true },

  // Team profile pages were duplicate content of the about page bios.
  { source: "/cmsms_profile/", destination: "/about-us-light/#team", permanent: true },
  { source: "/cmsms_profile/sally-tabibi/", destination: "/about-us-light/#team", permanent: true },
  { source: "/cmsms_profile/peggy-chen/", destination: "/about-us-light/#team", permanent: true },

  // Campaign booking pages were thin wrappers around the calendar widget that
  // now lives on the landing page itself.
  { source: "/book-body-contouring/", destination: "/body-contouring/#book", permanent: true },
  { source: "/book-intimate-brightening/", destination: "/intimate-brightening/#book", permanent: true },

  // Core page moves.
  { source: "/about-us/", destination: "/about-us-light/", permanent: true },
  { source: "/contact/", destination: "/contact-us-light/", permanent: true },
  { source: "/contacts/", destination: "/contact-us-light/", permanent: true },
  { source: "/services/", destination: "/service-light/", permanent: true },
  { source: "/appointment/", destination: "/book-now/", permanent: true },

  // Pages that existed upstream but were empty or abandoned. /shop/ had no
  // products and no store plugin; /author-page/ was unmodified theme demo
  // content; the WooCommerce routes never had a storefront behind them.
  { source: "/shop/", destination: "/service-light/", permanent: true },
  { source: "/author-page/", destination: "/about-us-light/", permanent: true },
  { source: "/my-account/", destination: "/contact-us-light/", permanent: true },
  { source: "/cart/", destination: "/service-light/", permanent: true },
  { source: "/checkout/", destination: "/book-now/", permanent: true },
];
