import { readFile, writeFile } from "node:fs/promises";
import { services } from "../data/services.mjs";
import { assetVersion, navigation } from "./site-shell.mjs";

const pages = new Map([
  ["index.html", "home"],
  ["service-light.html", "treatments"],
  ["service-details-light.html", "treatments"],
  ["about-us-light.html", "about"],
  ["faq-light.html", "faq"],
  ["contact-us-light.html", "contact"],
  ["book-now.html", ""],
]);

const navigationPattern =
  /<header class="site-header">[\s\S]*?<\/header>\s*<nav class="mobile-menu"[^>]*data-mobile-menu[^>]*>[\s\S]*?<\/nav>/;
const rootDocuments = [...pages.keys()];

for (const [file, active] of pages) {
  let html = await readFile(file, "utf8");
  if (!navigationPattern.test(html)) throw new Error(`${file}: shared navigation region not found`);
  html = html.replace(navigationPattern, navigation(active));
  html = html
    .replace(/\/assets\/(css\/medspa\.css|js\/medspa\.js)\?v=[^"]+/g, `/assets/$1?v=${assetVersion}`)
    .replace(/\b(href|src)="assets\//g, '$1="/assets/')
    .replace(
      /\bhref="([^"]+\.html(?:#[^"]*)?)"/g,
      (match, target) => (rootDocuments.some((document) => target.startsWith(document)) ? `href="/${target}"` : match)
    );
  await writeFile(file, html);
}

let treatmentIndex = await readFile("service-light.html", "utf8");
for (const item of services) {
  if (item.slug === "swedish-massage") continue;
  const label = item.navName || item.name;
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("&", "(?:&|&amp;)");
  const chipPattern = new RegExp(
    `<a class="service-chip" href="[^"]+">${escapedLabel.replace("®", "(?:®|&reg;)")}</a>`
  );
  if (!chipPattern.test(treatmentIndex)) {
    throw new Error(`service-light.html: chip not found for ${label}`);
  }
  treatmentIndex = treatmentIndex.replace(
    chipPattern,
    `<a class="service-chip" href="/services/${item.slug}/">${label.replace("&", "&amp;")}</a>`
  );
}

if (!treatmentIndex.includes('class="service-chip" href="/services/swedish-massage/"')) {
  treatmentIndex = treatmentIndex.replace(
    '<a class="service-chip" href="/services/ems-body-contouring/">EMS Body Contouring</a>',
    '<a class="service-chip" href="/services/ems-body-contouring/">EMS Body Contouring</a>\n              <a class="service-chip" href="/services/swedish-massage/">Swedish Massage</a>'
  );
}
await writeFile("service-light.html", treatmentIndex);

let home = await readFile("index.html", "utf8");
const homeLinks = new Map([
  ["Microneedling + PDRN", "microneedling-pdrn"],
  ["Korean Glass Skin Facial", "korean-glass-skin-facial"],
  ["Chemical Peels", "chemical-peels"],
  ["Botox / Dysport", "botox-dysport"],
  ["Dermal Fillers", "dermal-fillers"],
  ["PRP Treatments", "prp-skin-rejuvenation"],
  ["Laser Hair Removal", "laser-hair-removal"],
  ["Pigment Removal", "pigment-removal"],
  ["Carbon Laser Peel", "carbon-laser-peel"],
]);
for (const [label, slug] of homeLinks) {
  if (home.includes(`href="/services/${slug}/">${label}<`)) continue;
  const pattern = new RegExp(`href="service-light\\.html#[^"]+">${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<`);
  if (!pattern.test(home)) throw new Error(`index.html: featured link not found for ${label}`);
  home = home.replace(pattern, `href="/services/${slug}/">${label}<`);
}
await writeFile("index.html", home);

console.log(`Synchronized shared navigation across ${pages.size} pages and linked all service discovery paths.`);
