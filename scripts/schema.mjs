import { SITE } from "./site-shell.mjs";

// JSON-LD is injected inside a <script> block, so "<" must never survive raw.
export const cleanJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

export const BUSINESS_ID = `${SITE.origin}/#business`;

export const localBusiness = {
  "@type": "MedicalBusiness",
  "@id": BUSINESS_ID,
  name: SITE.name,
  url: `${SITE.origin}/`,
  telephone: SITE.phoneSchema,
  email: SITE.email,
  image: `${SITE.assetOrigin}/assets/img/medspa/hero-20260807.jpg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
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

/**
 * Every page carries exactly one <script type="application/ld+json"> holding one
 * @graph, and localBusiness is always its first node. Building the graph through
 * this helper is what keeps that invariant free.
 */
export const graph = (nodes) => ({
  "@context": "https://schema.org",
  "@graph": [localBusiness, ...nodes.filter(Boolean)],
});

export const breadcrumbList = (id, trail) => ({
  "@type": "BreadcrumbList",
  "@id": id,
  itemListElement: trail.map(([name, item], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item,
  })),
});

export const faqPage = (id, faqs) => ({
  "@type": "FAQPage",
  "@id": id,
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
});

/**
 * `jobTitle` must be the role as published for Ontario (e.g. "Cosmetic
 * Injector"), never a regulated title like "Dermatologist" or "Physician".
 * `image` is omitted for members with no upstream photograph.
 */
export const personNode = (id, member) => ({
  "@type": "Person",
  "@id": id,
  name: member.name,
  jobTitle: member.role,
  description: Array.isArray(member.bio) ? member.bio.join(" ") : member.bio,
  ...(member.sourceImage || member.imageBase.startsWith("/assets/img/services/")
    ? { image: `${SITE.assetOrigin}${member.imageBase}-1280.webp` }
    : {}),
  worksFor: { "@id": BUSINESS_ID },
});

export const serviceNode = (item, category) => ({
  "@type": "Service",
  "@id": `${item.legacyUrl}#service`,
  name: item.name,
  description: item.metaDescription,
  url: item.legacyUrl,
  serviceType: item.name,
  category: category.label,
  areaServed: { "@type": "City", name: "Etobicoke" },
  provider: { "@id": BUSINESS_ID },
  image: `${SITE.assetOrigin}/assets/img/services/${item.imageStem}-1280.webp`,
});

export const serviceGraph = (item, category, provider) =>
  graph([
    serviceNode(item, category),
    faqPage(`${item.legacyUrl}#faq`, item.faqs),
    breadcrumbList(`${item.legacyUrl}#breadcrumb`, [
      ["Home", `${SITE.origin}/`],
      ["Services", `${SITE.origin}/services/`],
      [item.name, item.legacyUrl],
    ]),
    provider ? personNode(`${item.legacyUrl}#provider`, provider) : null,
  ]);
