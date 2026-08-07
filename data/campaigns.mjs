/**
 * Chrome-less paid-campaign landing pages. Unlike data/pages.mjs these render
 * without site navigation or footer, and carry a campaign tracking phone
 * number rather than the clinic's main line.
 */

// Campaign tracking line used for paid-lead attribution. Do NOT "fix" this to
// match the site's main number — the clinic reports on it. It never appears in
// JSON-LD; schema always carries the main number.
export const CAMPAIGN_PHONE = { display: "(437) 747-5119", href: "tel:+14377475119" };

/**
 * Both campaigns are `noindex`. Each duplicates a treatment that already has a
 * full service page at /services/<canonicalServiceSlug>/, and indexing both
 * would let the thinner ad page compete with the fuller one. `canonicalServiceSlug`
 * is also where a visitor should be sent for the complete write-up.
 *
 * `cta.primary.href` is an in-page fragment on purpose: with no header or nav,
 * the only onward step is the booking calendar embedded further down the page.
 *
 * Three things from the originals are deliberately absent and should not be
 * re-added:
 *
 *   - Testimonials. The seven quotes on the originals are fabricated. They cite
 *     treatments Anima does not offer ("Non-Surgical Lipo", "Cellulite
 *     Reduction Treatment", "Targeted Fat Reduction"), and the identical set of
 *     seven was pasted onto both pages. Real Fresha or Google reviews are not a
 *     substitute: none of them mention either of these treatments, so quoting
 *     them here would repeat the same misattribution in a form harder to catch.
 *   - The "4.9/5 average rating, 500+ happy clients" stat bar. Neither figure is
 *     sourced, and both contradict the 5.0 from 18 reviews the rest of the site
 *     cites from Fresha.
 *   - Prices. Neither original page published any, so neither does this one.
 *
 * tests/content-integrity.test.mjs fails the build if the first two return.
 *
 * `sections[].type` is one of:
 *   "prose"  — `prose` is an array of paragraphs.
 *   "list"   — `items` is an array of strings.
 *   "steps"  — `items` is an array of [title, description] pairs.
 *   "notice" — a callout. Carries `prose`, and may carry `items`.
 */
export const campaigns = [
  {
    slug: "body-contouring",
    seoTitle: "EMS Body Contouring: Consultation and Treatment | Anima Med Spa",
    metaDescription:
      "EMS body contouring at Anima Med Spa in Etobicoke uses low-level electrical pulses to activate muscle in selected areas. Subtle muscle toning, not fat reduction.",
    noindex: true,
    eyebrow: "Consultation and treatment",
    title: "Gentle muscle activation for",
    titleAccent: "subtle definition.",
    lede: "Electrical muscle stimulation is a non-invasive way to support light muscle toning in selected areas. Sessions run 20 to 30 minutes, no downtime is expected, and the treatment is designed to sit alongside regular exercise rather than take its place.",
    canonicalServiceSlug: "ems-body-contouring",
    heroAlt: "EMS body contouring imagery published by Anima Med Spa",

    facts: [
      ["Session", "20–30 minutes"],
      ["Downtime", "None expected"],
      ["Series", "4–6 sessions, spaced a few days apart"],
      ["Consultation", "Included"],
    ],

    sections: [
      {
        heading: "How EMS",
        accent: "works.",
        type: "prose",
        prose: [
          "Electrical muscle stimulation (EMS) uses low-level electrical pulses to activate muscles in targeted areas. Pads are placed on the skin over the selected muscle group, and the pulses produce repeated contractions in it.",
          "Those contractions stimulate muscle fibres and may improve tone over time when combined with a healthy lifestyle. How much changes depends on baseline conditioning, activity, nutrition, and how consistently the series is completed.",
        ],
      },
      {
        // The most important sentence on the original page, kept near-verbatim.
        // It contradicts the "body contouring" framing the ads ran alongside it,
        // and it is the honest description of what the device does. Keep it in a
        // callout above the lists — it is the frame the rest of the page is read
        // through, not a footnote to it.
        heading: "What EMS",
        accent: "does not do.",
        type: "notice",
        prose: [
          "EMS muscle toning provides subtle improvements. It is not a fat-reduction or body-sculpting procedure, but it can help enhance muscle engagement and support toning when combined with regular exercise.",
          "Anyone whose goal is weight loss or fat reduction should raise that at consultation instead. EMS is not the treatment for it, and Anima’s medically supervised weight-management program is a different service with a different assessment.",
        ],
      },
      {
        heading: "Common",
        accent: "goals.",
        lede: "What clients typically book the treatment to work on.",
        type: "list",
        items: [
          "Light muscle toning",
          "Supporting an existing fitness routine",
          "Improving mild muscle firmness",
          "Adding a non-invasive step to a broader body-care plan",
        ],
      },
      {
        heading: "Designed",
        accent: "for.",
        lede: "The treatment is positioned as a complement to a routine that already exists, rather than a starting point.",
        type: "list",
        items: [
          "Wellness-focused individuals",
          "Clients maintaining an active lifestyle",
          "Those seeking refined muscle tone rather than a dramatic change",
          "Anyone wanting a non-invasive option with no expected downtime",
        ],
      },
      {
        heading: "What to",
        accent: "expect.",
        lede: "Each session follows the same short sequence.",
        type: "steps",
        items: [
          ["Brief consultation", "Your goals and treatment areas are discussed, along with medical history, pregnancy, recent surgery, and any implanted electrical device — several of which can rule the treatment out."],
          ["Pad placement", "EMS pads are positioned on the skin over the selected muscle group."],
          ["Stimulation", "Mild electrical pulses produce muscle contractions. Intensity is raised gradually and adjusted to your comfort throughout."],
          ["Back to your day", "A session lasts about 20 to 30 minutes. Most clients describe the sensation as a light to moderate muscle workout, and there is no expected downtime."],
        ],
      },
      {
        heading: "Where it",
        accent: "fits.",
        type: "prose",
        prose: [
          "Anima describes its approach to body treatments as prioritizing balance, comfort, and natural enhancement. EMS muscle toning is offered as a complement to a healthy lifestyle and a regular exercise routine, not a replacement for either.",
          "Multiple sessions are typically recommended, commonly four to six spaced a few days apart. You can return to your day immediately after each one, though muscle fatigue or soreness is possible in the hours that follow.",
        ],
      },
    ],

    faqs: [
      [
        "Does the EMS treatment hurt?",
        "Most clients describe the sensation as a light to moderate muscle workout. The treatment is non-invasive, and intensity is adjusted to your comfort during the session. Tell your provider at any point if it feels like too much.",
      ],
      [
        "How many sessions will I need?",
        "A series of four to six sessions spaced a few days apart is commonly recommended. Some clients notice a subtle difference sooner. The number that suits you is decided with your provider rather than fixed in advance.",
      ],
      [
        "Is there any downtime after the treatment?",
        "None is expected. Most clients return to work, daily activities, or the gym the same day. Muscle fatigue, tenderness, or soreness can occur afterwards, much as it can after a workout.",
      ],
      [
        "Can this replace my regular workouts?",
        "No. EMS body contouring is designed to complement a healthy lifestyle and regular exercise, not to stand in for them. It activates targeted muscles for subtle definition alongside your own training.",
      ],
    ],

    embeds: {
      formId: "s6FVdbNeUvB3BNu1hMo2",
      formName: "EMS Body Contouring Form",
      calendarId: "ywVuPLRdMAWmI9B4oDEj",
    },

    cta: {
      heading: "Book a consultation",
      accent: "and treatment.",
      body: "The consultation is included in the appointment. It is where treatment areas, comfort level, and a realistic number of sessions are agreed — and where implanted devices, heart or neurologic conditions, pregnancy, and recent surgery are screened, since any of them can rule EMS out.",
      primary: { href: "#book", label: "Book consultation and treatment" },
    },
  },

  {
    slug: "intimate-brightening",
    seoTitle: "Pink Intimate® System: Professional Intimate Brightening | Anima Med Spa",
    metaDescription:
      "The Pink Intimate® System is a professional peel protocol for delicate external skin, used at Anima Med Spa in Etobicoke for hyperpigmentation and uneven tone. External use only.",
    noindex: true,
    eyebrow: "Pink Intimate® System",
    title: "Professional intimate",
    titleAccent: "brightening.",
    lede: "A non-invasive professional peel system developed for delicate external skin, used to address hyperpigmentation and uneven tone. Treatment is external only, and suitability is confirmed privately before anything is applied.",
    canonicalServiceSlug: "intimate-brightening",
    heroAlt: "Pink Intimate professional treatment product imagery published by Anima Med Spa",

    facts: [
      ["Duration", "30–40 minutes"],
      ["Sensation", "Mild warmth"],
      ["Sessions", "Minimum of 5 sessions"],
      ["Interval", "Every 7–10 days"],
    ],

    sections: [
      {
        heading: "What the Pink Intimate®",
        accent: "System is.",
        type: "prose",
        prose: [
          "Pink Intimate® is a specialized professional peel system developed specifically for delicate external skin. It is applied in-clinic by a provider rather than sold for use at home.",
          "The system targets hyperpigmentation, dullness, and uneven tone associated with shaving, waxing, friction, or hormonal change. It works gradually across a short series, and Anima describes no planned downtime.",
        ],
      },
      {
        heading: "What it is designed",
        accent: "to do.",
        lede: "The protocol is described as supporting gradual skin renewal while keeping comfort and safety first.",
        type: "list",
        items: [
          "Designed to improve the appearance of visible hyperpigmentation and uneven tone",
          "Formulated for delicate areas, without aggressive bleaching",
          "Non-invasive, allowing an immediate return to daily life",
          "Applied across a short series rather than in a single visit",
        ],
      },
      {
        // The external-use-only caveat is the point of this section, not a
        // qualifier appended to it — hence a callout rather than a list heading.
        heading: "Treatable",
        accent: "areas.",
        lede: "Pink Intimate® is intended for external use only. Internal tissue is not treated.",
        type: "notice",
        items: [
          "Vulvar skin, external area only",
          "Bikini line and inner thighs",
          "Perianal area",
          "Underarms",
        ],
        prose: [
          "Application is customized to the concerns you raise, and a session is required first to confirm the treatment is suitable for you and the area.",
          "Not every colour change is cosmetic. New, changing, painful, itchy, raised, bleeding, or otherwise unexplained pigmentation should be assessed by an appropriate healthcare professional before any aesthetic treatment.",
        ],
      },
      {
        heading: "Who is a good",
        accent: "candidate.",
        lede: "The system is aimed at intimate hyperpigmentation commonly associated with:",
        type: "list",
        items: [
          "Previous hair removal, including waxing and shaving",
          "Friction from tight clothing",
          "Hormonal change or aging",
        ],
      },
      {
        heading: "What a session",
        accent: "involves.",
        lede: "Consultation and treatment are handled discreetly, in private.",
        type: "steps",
        items: [
          ["Private consultation", "The area, skin history, symptoms, products in use, and suitability are reviewed discreetly before anything is agreed."],
          ["Prepare", "External skin is cleansed and protected according to the manufacturer protocol."],
          ["Apply", "The professional topical system is applied only to approved external areas. Mild warmth is the sensation usually described."],
          ["Protect", "Friction, heat, products, and home care are managed according to written instructions you take away."],
        ],
      },
      {
        heading: "Aftercare and",
        accent: "safety.",
        lede: "Simple guidelines to follow after each session.",
        type: "list",
        items: [
          "Avoid friction and heat, including saunas, for 24 to 48 hours",
          "No aggressive exfoliation on the treated area",
          "Follow the professional homecare advice given at your session",
          "Stop use and contact the clinic if irritation develops, or if itching, pain, or an unexpected change appears",
        ],
      },
    ],

    // The original page carried no FAQ block. These are drawn from the verified
    // service record in data/services.mjs so the answers stay consistent with
    // /services/intimate-brightening/.
    faqs: [
      [
        "Which areas can be treated?",
        "Only selected external areas approved by your provider and the product protocol. Internal tissue is not treated.",
      ],
      [
        "How many sessions are recommended?",
        "Three to six sessions, spaced every two to four weeks, is the range Anima publishes. The number that suits you is confirmed with your provider.",
      ],
      [
        "What does it feel like, and is there downtime?",
        "Mild warmth is the sensation described. A session takes about 30 to 40 minutes, and Anima describes no planned downtime, although temporary sensitivity or irritation is possible.",
      ],
      [
        "Is the result permanent?",
        "No cosmetic brightening result should be considered permanent. Friction, hormones, hair removal, and skin biology continue to affect tone, so maintenance may be discussed.",
      ],
      [
        "Can I wax or shave beforehand?",
        "Timing has to follow the clinic’s instructions, because recent hair removal can increase the risk of irritation. Raise it when you book rather than on the day.",
      ],
    ],

    embeds: {
      formId: "fiDIRzKWbxPvH5CpWzzc",
      formName: "Intimate Brightening Form",
      calendarId: "IOQmdvFMJdSAJ75HXsNG",
    },

    cta: {
      heading: "Book a private",
      accent: "session.",
      body: "A session is required before treatment to confirm the area is suitable. Active irritation, infection, skin lesions, pregnancy, recent hair removal, or ingredient sensitivity may mean deferring, or seeking medical review first.",
      primary: { href: "#book", label: "Book a session" },
    },
  },
];

/**
 * Shared destination for both campaign forms.
 *
 * The embedded GoHighLevel form is a *lead* form, not a booking: submitting it
 * puts a request in front of the clinic and nothing more. The original page said
 * "You're All Set!" and told visitors to watch for a booking confirmation, which
 * reads as though a time had been held. It had not. Every line here has to stay
 * true for someone who arrives at this URL directly, with no memory of what they
 * submitted, so nothing refers back to a specific form or campaign.
 */
export const thankYou = {
  slug: "thank-you",
  seoTitle: "Request received | Anima Med Spa",
  metaDescription:
    "Anima Med Spa has received your request. The clinic will be in touch to confirm a time. A submitted request is not a confirmed appointment.",
  noindex: true,
  title: "Your request has",
  titleAccent: "reached the clinic.",
  lede: "This page confirms that your request arrived — not that an appointment is booked. Anima will contact you to agree a time, and the visit is only confirmed once that conversation has happened.",
  steps: [
    ["The clinic reviews your request", "Requests are read during opening hours. One sent outside them is picked up on the next working day."],
    ["Someone gets in touch", "Expect a call, text, or email using the details you gave, to agree a time and answer anything you need to know beforehand."],
    ["Your appointment is confirmed", "Nothing is held in the calendar until the clinic confirms it with you. If a business day passes without contact, calling the clinic is the quickest way to follow up."],
  ],
};

export const campaignBySlug = new Map(campaigns.map((c) => [c.slug, c]));
