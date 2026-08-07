// Team records are transcribed from Anima's current about page and kept in a
// restrained, third-person, attributed voice. Every claim here traces back to
// published copy; titles and scope of practice are always deferred to
// consultation rather than asserted on the client's behalf.
const member = (record) => ({
  verifiedProfileUrl: null,
  sourceImage: null,
  ...record,
  initials: record.initials || record.name.split(" ").map((w) => w[0]).join(""),
  imageBase: record.imageBase || `/assets/img/team/${record.slug}`,
  alt: record.alt || `${record.name}, ${record.role} at Anima Med Spa`,
});

export const team = [
  member({
    slug: "sally-tabibi",
    name: "Sally Tabibi",
    role: "Founder",
    credentials: "Medical Consultant",
    summary:
      "Anima’s current about page identifies Sally Tabibi as the founder of the clinic, with a focus on anti-aging, skin rejuvenation, and common skin concerns.",
    bio: [
      "Anima’s current about page describes Sally Tabibi’s focus as anti-aging, skin rejuvenation, and the treatment of common skin concerns.",
      "Alongside hands-on treatment, she has held leadership roles as a clinic manager and medical aesthetics consultant across several practices. The page credits that work with her understanding of both client care and clinic operations.",
      "She founded Anima Med Spa. Her title is published as Medical Consultant and Founder; the treatments she personally performs are confirmed at consultation.",
    ],
    sourceImage:
      "https://animamedspa.com/wp-content/uploads/2021/08/sally-medical-aesthetician-etobicoke-etobicoke-4-scaled.jpg",
    order: 1,
  }),
  member({
    slug: "ali-komeili",
    name: "Ali Komeili",
    role: "Cosmetic Injector",
    credentials:
      "International Medical Graduate · Dermatology residency and board certification, Iran (1998) · 27+ years of clinical experience",
    summary:
      "Anima’s current about page lists Ali Komeili as a cosmetic injector and an International Medical Graduate whose dermatology training and board certification were completed in Iran.",
    bio: [
      "Anima’s current about page identifies Ali Komeili as an International Medical Graduate who completed his medical education and dermatology residency in Iran, with board certification there in 1998 and more than 27 years of clinical experience since.",
      "He has served as an assistant professor and has published in peer-reviewed journals.",
      "His work at Anima is described as non-surgical aesthetic procedures, including Botox, dermal fillers, and mesotherapy.",
    ],
    // Anima published this portrait in February 2026, after the first pass of
    // this file recorded him as having no upstream photograph. The upstream
    // original is only 620px wide, so the 1280 derivative is capped at that.
    sourceImage: "https://animamedspa.com/wp-content/uploads/2026/02/Screenshot-2026-02-18-234118.png",
    scopeNote:
      "The credentials shown here were earned in Iran. Regulated-professional titles, current licensure, and scope of practice in Ontario are confirmed at consultation.",
    order: 2,
  }),
  member({
    slug: "peggy-chen",
    name: "Peggy Chen",
    role: "Medical Aesthetician",
    credentials: "Business and Design, University of Waterloo · Professional training in medical aesthetics",
    summary:
      "Anima’s current about page lists Peggy Chen as a medical aesthetician working across skincare, advanced facials, and laser technologies.",
    bio: [
      "Anima’s current about page notes that Peggy Chen graduated from the University of Waterloo in business and design, and later completed professional training in medical aesthetics.",
      "She has worked in multiple medical spa settings, with exposure to photofacials, advanced facials, laser technologies, and professional skincare.",
      "Working alongside medical professionals has informed her approach to treatment planning, client education, and post-treatment care.",
    ],
    sourceImage: "https://animamedspa.com/wp-content/uploads/2026/02/peggy-medical-aesthetician-etobicoke.webp",
    verifiedProfileUrl:
      "https://www.wellnessliving.com/explore/locations/medical-aesthetics/ca-on-etobicoke/animamedspa/staff/855042/",
    scopeNote: "Peggy Chen does not perform injectables. Treatment scope is confirmed at consultation.",
    order: 3,
  }),
  member({
    slug: "solmaz-haghighi",
    name: "Solmaz Haghighi",
    role: "Nurse Practitioner",
    credentials: "BC-FNP, MSN, IBLCE",
    summary:
      "Anima’s current about page lists Solmaz Haghighi as the nurse practitioner for its medically supervised weight-management program.",
    bio: [
      "Anima’s current about page identifies Solmaz Haghighi as a Family Nurse Practitioner with experience across primary care, gynecology, pediatrics, and women’s health.",
      "She earned her Master of Science in the Family Nurse Practitioner program at the University at Buffalo.",
      "Her published work includes ten medical books and thirteen scientific articles, three of them ISI-indexed.",
    ],
    // Points at the existing optimized service asset rather than a new stem.
    imageBase: "/assets/img/services/weight-management-provider",
    sourceImage: "https://animamedspa.com/wp-content/uploads/2024/01/solaz.jpg",
    scopeNote:
      "Solmaz Haghighi is listed with Anima’s medically supervised weight-management program. Registration and scope of practice in Ontario are confirmed at consultation.",
    order: 4,
  }),
];

export const teamBySlug = new Map(team.map((m) => [m.slug, m]));

/**
 * Deliberately explicit, not derived from category.
 *
 * It is tempting to map injectables → Ali and skin/laser → Peggy, but Anima's
 * published copy never states who performs which treatment; it names a provider
 * for exactly one service (the weight-management program). Inferring the rest
 * would put a named clinician's face on a page they may not staff, which is the
 * kind of claim this site refuses to make. A service gets a provider band only
 * when its record carries an explicit `providerSlug`. The full team is
 * introduced on the about page instead.
 */
export const providerFor = (service) =>
  service.providerSlug ? teamBySlug.get(service.providerSlug) ?? null : null;
