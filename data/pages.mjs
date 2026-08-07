/**
 * Standalone pages that carry full site chrome but aren't part of the service
 * catalog. Chrome-less campaign landing pages live in data/campaigns.mjs.
 */

/**
 * The Glow Plan is published as informational only — no online sign-up.
 *
 * Anima advertises a $159/month, 12-month membership (~$1,908 committed) but
 * publishes no cancellation, renewal, transfer, or billing terms anywhere. We
 * state the two figures they do publish, name the benefits verbatim, and mark
 * every unpublished term as supplied in the agreement rather than inventing it.
 * Swap `cta` to a purchase flow only once real terms exist.
 */
export const glowPlan = {
  slug: "glow-plan",
  navName: "Glow Plan",
  seoTitle: "Glow Plan Membership | Anima Med Spa",
  metaDescription:
    "The Anima Glow Plan is a $159/month, 12-month membership offering member pricing, priority booking, and product savings. Terms are confirmed before you sign.",
  eyebrow: "Membership",
  title: "The Anima",
  titleAccent: "Glow Plan.",
  lede: "A monthly membership for clients who already treat skincare as a routine rather than a one-off. It changes what you pay and how early you can book — not what your skin is promised.",
  chips: ["$159 per month", "12-month term", "Member pricing on treatments"],

  price: { amount: 159, currency: "CAD", unit: "per month", termMonths: 12 },

  // `value: null` renders the deferral line instead of a fabricated answer.
  terms: [
    ["Monthly fee", "$159 CAD"],
    ["Term", "12 months"],
    ["Billing date and method", null],
    ["Cancellation", null],
    ["Renewal after 12 months", null],
    ["Transfers and pauses", null],
  ],
  termsDeferral: "Provided in the membership agreement before you sign.",

  // Benefits are contract terms — ported in substance from Anima's current
  // Glow Plan page rather than paraphrased.
  benefits: [
    "Member pricing on treatments",
    "A complimentary Traditional Facial during your birthday month",
    "15% off professional skincare products",
    "One complimentary dermaplaning session when you join",
    "Priority access to peak-hour and seasonal appointment times",
  ],

  // Stages describe what the membership does, not what skin becomes.
  journey: [
    ["When you join", "Your complimentary dermaplaning session is booked, and member pricing applies from your first visit."],
    ["Each month", "You choose a treatment at member pricing. What you book is decided with your provider, not fixed in advance."],
    ["Your birthday month", "A complimentary Traditional Facial is added to your account."],
    ["Throughout the year", "Peak-hour and seasonal appointment times open to you before general booking."],
  ],

  faqs: [
    [
      "How does the Glow Plan work?",
      "It is a monthly membership. For $159 per month you receive member pricing on treatments, priority booking during peak hours, 15% off professional skincare products, and the sign-up and birthday-month inclusions listed above.",
    ],
    [
      "Is there a commitment?",
      "Yes. The Glow Plan is a 12-month membership. Over a full term that is $1,908 before any treatment costs, so it suits clients who already book regularly rather than occasionally.",
    ],
    [
      "What is included when I sign up?",
      "One complimentary dermaplaning session, member pricing on treatments, a complimentary Traditional Facial during your birthday month, 15% off professional skincare products, and priority access to peak-hour and seasonal appointment times.",
    ],
    [
      "What does priority booking mean?",
      "Members are offered peak-hour and seasonal appointment windows ahead of general booking. It does not guarantee a specific time or provider.",
    ],
    [
      "Where do I find the cancellation and renewal terms?",
      "They are set out in the membership agreement, which the clinic provides before you sign. Ask for it during your consultation or by phone — nothing is charged before you have read it.",
    ],
  ],

  cta: {
    heading: "Ask about the Glow Plan",
    accent: "before you commit.",
    body: "The clinic will walk you through the agreement, the billing schedule, and whether the plan actually saves you money at your treatment frequency.",
    primary: { href: "/contact-us-light.html", label: "Ask about the Glow Plan" },
    secondary: { href: "/service-light.html", label: "Browse treatments" },
  },
};

/**
 * Ships with the first form on the site. The contact and newsletter forms
 * compose a mailto rather than posting anywhere, and the campaign landing pages
 * embed third-party GoHighLevel forms that send personal details off-domain —
 * both need disclosing. Statements here describe only what the site actually
 * does; nothing about clinical record-keeping is asserted on the clinic's
 * behalf, because that is theirs to describe.
 */
export const privacy = {
  slug: "privacy",
  seoTitle: "Privacy Notice | Anima Med Spa",
  metaDescription:
    "How Anima Med Spa's website handles the information you submit through its contact form, newsletter signup, and campaign booking forms.",
  eyebrow: "Privacy",
  title: "What happens to",
  titleAccent: "your details.",
  lede: "A plain description of what this website collects, what it does not, and who else is involved when you send something.",
  updated: "2026-07-29",
  sections: [
    [
      "The contact form does not send anything from this page",
      "The contact and newsletter forms on this site have no server behind them. When you submit one, your browser opens your own email application with the message pre-filled. Nothing leaves your device until you press send in your email app, and this website never receives or stores a copy.",
    ],
    [
      "What the clinic receives",
      "If you send that email, Anima Med Spa receives whatever you included — typically your name, phone number, email address, and your message. It is used to reply to your enquiry and to arrange care you ask about.",
    ],
    [
      "Booking is handled by WellnessLiving",
      "The booking schedule is provided by WellnessLiving and is embedded from their systems. Anything you enter there is submitted to WellnessLiving under their privacy terms, not through this website.",
    ],
    [
      "Campaign pages use a third-party form provider",
      "Our promotional landing pages embed forms and calendars from LeadConnector (GoHighLevel). Details entered into those embedded forms go to that provider, and those pages may set cookies from their domain. If you would rather not use them, call the clinic or email directly instead.",
    ],
    [
      "Analytics and cookies",
      "This site sets no advertising cookies of its own. Embedded third parties — WellnessLiving, LeadConnector, TikTok and Google Maps where present — may set their own as part of loading their content.",
    ],
    [
      "Asking about your information",
      "To ask what the clinic holds about you, request a correction, or ask for it to be deleted, contact Anima Med Spa by phone or email. Requests relating to clinical records are handled under the clinic's own record-keeping obligations.",
    ],
  ],
};

export const standalonePages = [glowPlan, privacy];
