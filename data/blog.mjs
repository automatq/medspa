/**
 * Blog posts ported from Anima’s existing articles.
 *
 * Three editorial rules applied during the port, so they don’t get re-litigated
 * every time a post is edited:
 *
 * 1. No prices in post bodies. The July post originally carried inline price
 *    badges and the carbon-peel post carried an introductory rate that expired
 *    on 2026-05-31. Figures go stale inside prose and the expired one was
 *    already wrong. Posts point at /book-now.html instead; figures belong in
 *    data/pricing.mjs, where they can be updated in one place.
 * 2. Treatment names link to their service pages. The source left every
 *    treatment as plain text, which stranded readers mid-article.
 * 3. Dates are plain ISO strings, never `new Date()`, so build output is
 *    identical on every machine and in CI.
 *
 * Body blocks are a closed set — p, h2, h3, ul, ol, note, quote — and the three
 * inline markers the renderer understands are [label](/href), **bold**, and
 * *italic*. Everything else is escaped, so raw HTML in copy will not render.
 */

import { normalizePost } from "./post-schema.mjs";

export const postCategories = [
  {
    id: "tips-tricks",
    label: "Tips & Tricks",
    description:
      "Seasonal notes on skin, treatments, and timing — what a service can reasonably do, when it makes sense to book it, and what to expect afterward.",
  },
];

// Shared with the browser composer, so a hand-authored post and one written at
// /admin/posts/ end up the same shape and render through the same code.
const post = normalizePost;

export const posts = [
  post({
    title: "Reverse the Summer Damage: Your Skin’s Back-to-School Reset",
    slug: "reverse-the-summer-damage",
    published: "2026-07-28",
    deck: "A Toronto summer leaves most skin duller, rougher, and more uneven than it started — even skin that wore sunscreen. What a late-August reset can reasonably address, and what it cannot.",
    heroAlt: "Skin assessed under clinic light at the end of a Toronto summer",
    readMinutes: 6,
    relatedServiceSlugs: ["carbon-laser-peel", "hydradermabrasion", "laser-hair-removal"],
    body: [
      {
        type: "p",
        text: "Summer in Toronto means patio season, lake days, and — for most people — a skincare routine that quietly fell apart somewhere around the second heatwave. Sunscreen you meant to reapply, chlorine, salt water, sweat, and rather more iced coffee than water. By the end of August, skin usually shows it.",
      },
      {
        type: "p",
        text: "The good news is that late summer is a genuinely useful time to reset. Routines are tightening up anyway, sun exposure is starting to taper, and the treatments that were riskier in July become straightforward again.",
      },
      { type: "h2", text: "The damage is real, even if you wore SPF" },
      {
        type: "p",
        text: "Cumulative UV exposure over a season prompts extra melanin production, which shows up as sun spots, uneven tone, and a flat, tired look where the usual light-reflection used to be. The surface of the skin also thickens as a normal defensive response, which is part of why summer skin can feel rougher to the touch even when it has been looked after.",
      },
      {
        type: "p",
        text: "Most of that is surface-level and responds to surface-level treatment. The [Carbon Laser Peel](/services/carbon-laser-peel/) — sometimes sold as the Hollywood Glow — is the most requested treatment at Anima at this point in the year for exactly this reason. A thin carbon layer is applied to the skin, where it binds to surface oil and debris, and a laser pass then removes it, exfoliating the surface and acting on the look of pores and excess pigment in a single appointment with little planned downtime.",
      },
      {
        type: "note",
        text: "Candidacy still has to be checked. Recent tanning, active irritation, some medications, and pigment-risk factors all change whether a laser facial is appropriate and what settings are safe. That conversation happens before the first pass, not after.",
      },
      { type: "h2", text: "Do not pause laser hair removal — this is the better window" },
      {
        type: "p",
        text: "If a [laser hair removal](/services/laser-hair-removal/) package has been sitting untouched since June, late August into fall is one of the better times to restart it. Sun exposure tapers off, which lowers the risk of pigment complications and makes sessions more consistent from one appointment to the next.",
      },
      {
        type: "p",
        text: "Skin type is reassessed and settings adjusted at every visit, particularly after a summer of sun. Hair also grows in cycles, so a series takes months regardless of when it starts — which is the practical argument for beginning in September rather than scrambling in May, when everyone else does.",
      },
      { type: "h2", text: "Looking put-together, without the downtime" },
      {
        type: "p",
        text: "Back-to-school and back-to-office season brings more photographs, more meetings, and more pressure to look assembled, usually with less time than before. The combination people ask for most:",
      },
      {
        type: "ul",
        items: [
          "[Lash lift](/services/lash-lift-tint/) — curl and definition for several weeks, without mascara or extensions.",
          "[Dermaplaning](/services/dermaplaning/) — immediate surface smoothness, removes fine vellus hair, and makeup tends to sit better afterward.",
          "[Hydradermabrasion](/services/hydradermabrasion/) — cleansing, gentle exfoliation, and hydration in one session, with minimal downtime.",
        ],
      },
      {
        type: "p",
        text: "Booked together they usually run under ninety minutes. Nothing in that combination is dramatic on its own; the point is that all three are low-downtime and can be scheduled the same week as an event rather than a month before it.",
      },
      { type: "h2", text: "Humidity is not hydration" },
      {
        type: "p",
        text: "Skin that feels tight or flaky in humid weather confuses people, but it is common. Chlorine, salt water, sweat, and air conditioning all strip the moisture barrier regardless of how heavy the air feels outside.",
      },
      {
        type: "p",
        text: "This is where [hydradermabrasion](/services/hydradermabrasion/) earns its place in a late-summer plan: it cleanses, exfoliates, and infuses hydrating serum in the same appointment, which addresses buildup and dehydration together rather than trading one for the other.",
      },
      {
        type: "quote",
        text: "Humid air does not hydrate skin. It only makes dehydrated skin harder to notice.",
      },
      { type: "h2", text: "Where to start" },
      {
        type: "p",
        text: "If only one thing gets booked, make it the one matched to what is actually bothering you — tone and clarity point toward the carbon peel, tightness and congestion toward hydradermabrasion, and long-term maintenance toward restarting a laser series. Appointments and current pricing are on the [booking page](/book-now.html), and a consultation confirms which of these suits your skin before anything is scheduled.",
      },
      {
        type: "note",
        text: "Sun protection does not become optional in September. Freshly exfoliated or laser-treated skin is more sun-reactive for several days, and broad-spectrum SPF is what protects the result you just paid for.",
      },
    ],
  }),

  post({
    title: "Ask Your Esthetician: What’s Actually Worth Booking This July",
    slug: "worth-booking-this-july",
    published: "2026-07-01",
    deck: "Three questions that come up every summer — why carbon peels get booked before events, whether massage does anything beyond feeling nice, and how a lash lift holds up in humidity.",
    heroAlt: "Treatment room prepared for a summer appointment at Anima Med Spa",
    readMinutes: 6,
    relatedServiceSlugs: ["carbon-laser-peel", "swedish-massage", "lash-lift-tint"],
    body: [
      {
        type: "p",
        text: "Every summer the same three questions arrive on repeat: what is the carbon thing everyone books before an event, is massage actually doing something or is it just pleasant, and can a lash lift really survive pool season the way extensions cannot. Here are honest answers to all three.",
      },
      {
        type: "p",
        text: "Current pricing and appointment lengths sit on the [booking page](/book-now.html) rather than in this article — seasonal rates change, and a post written in July is a poor place to learn what something costs in October.",
      },
      { type: "h2", text: "Why does everyone want the Carbon Peel before a big event?" },
      {
        type: "p",
        text: "Because it is the shortest route to the finish estheticians describe as glass skin — smooth, light-reflecting, and even. During a [Carbon Laser Peel](/services/carbon-laser-peel/), a thin layer of liquid carbon is painted onto the skin and then removed with laser pulses. The carbon binds to oil and dead skin sitting at the surface on the way in, and lifts it away on the way out.",
      },
      {
        type: "p",
        text: "One thing most people do not know: **do not exfoliate the day before your appointment**. Skin that has already been stripped will not hold the carbon layer evenly, and uneven carbon means patchier results. Arrive with your normal routine intact.",
      },
      {
        type: "note",
        text: "Good to know: freshly treated skin is more sun-reactive, and that matters more in July than in any other month. Broad-spectrum SPF 30 or higher for at least the first 48 hours is not optional, and booking about a week ahead of an event leaves room for any temporary redness to settle. Recent tanning, some medications, and active skin conditions can also mean the treatment is deferred.",
      },
      { type: "h2", text: "Is massage actually doing something, or is it just relaxing?" },
      {
        type: "p",
        text: "Both, honestly. The long gliding strokes used in a [Swedish massage](/services/swedish-massage/) move fluid through superficial tissue, which is worth something in summer — heat and humidity leave hands, feet, and ankles holding more water than usual, and manual pressure can help shift it.",
      },
      {
        type: "p",
        text: "It is also one of the few hours in a week where the nervous system is given nothing to do. Most clients describe leaving calmer than they arrived, and often sleeping better that night. That is a relaxation service rather than treatment for an injury, and it is described that way deliberately.",
      },
      {
        type: "p",
        text: "For tight shoulders from a summer of hunching over a phone, or general heat fatigue, this is the appointment that addresses muscle and mood in the same session rather than one at the expense of the other. Pressure is adjustable throughout — say so if it is too much or not enough.",
      },
      { type: "h2", text: "What is the real difference between a lash lift and extensions?" },
      {
        type: "p",
        text: "Extensions are added fibres glued onto natural lashes. A [lash lift](/services/lash-lift-tint/) works with the lashes you already have: a setting solution reshapes each one from the root, curling it upward and holding that curve, on roughly the same logic as a perm. A tint afterward deepens the visible colour.",
      },
      {
        type: "p",
        text: "The part that matters in July specifically is adhesive. Extension glue breaks down faster in humidity, chlorine, and sweat, which means more frequent fills across the whole summer. A lash lift has nothing to melt or lift away — you can swim, sweat, and rub your eyes on a hot afternoon without losing anything.",
      },
      {
        type: "quote",
        text: "No adhesive to melt in the humidity. Just your own lashes, lifted.",
      },
      {
        type: "p",
        text: "The trade-off is honest: a lift enhances what is already there and does not add length or density, and it grows out with the natural lash cycle rather than being topped up. Keep lashes dry and away from steam and oils for the first day, and expect roughly six to eight weeks depending on your own cycle.",
      },
      { type: "h2", text: "Booking any of these" },
      {
        type: "p",
        text: "All three are short appointments with little or no planned downtime, which is why they cluster in the summer calendar. Availability, appointment length, and current pricing are on the [booking page](/book-now.html); anything laser-based is confirmed at a consultation first, since skin tone, recent sun exposure, and medications all affect whether it is appropriate.",
      },
    ],
  }),

  post({
    title: "Why Your Skin Works Harder in Summer — and What Men Can Do About It",
    slug: "summer-skin-for-men",
    published: "2026-05-28",
    deck: "Heat, humidity, UV, and sweat make a difficult combination for skin that behaves fine the rest of the year. What is actually happening, and the short list of things that help.",
    heroAlt: "Man’s skin assessed before a summer treatment at Anima Med Spa",
    readMinutes: 8,
    relatedServiceSlugs: ["hydradermabrasion", "laser-hair-removal", "signature-facial"],
    body: [
      {
        type: "p",
        text: "Most men do not think about their skin until something goes wrong — a breakout, razor burn, or an irritated patch along the jaw that will not settle. Summer in the Greater Toronto Area turns the dial up on all of it. Heat, humidity, UV exposure, and sweat make a difficult combination for skin that behaves perfectly well the rest of the year.",
      },
      { type: "p", text: "Here is what is actually happening, and what tends to work." },
      { type: "h2", text: "Men’s skin is structurally different" },
      {
        type: "p",
        text: "On average, men produce more sebum than women, have thicker skin, and have larger pores. Anyone who shaves is also putting the barrier through daily mechanical exfoliation. None of that is a complaint — it is simply biology, and it changes what summer does.",
      },
      {
        type: "p",
        text: "Higher sebum output plus heat means pores congest faster. Sweat mixes with oil and dead skin cells, and breakouts turn up in places that are usually calm.",
      },
      {
        type: "p",
        text: "The skin barrier — the protective outer layer — is also more vulnerable after sun exposure. UV degrades collagen and impairs barrier function, which means skin can be genuinely dehydrated while still looking and feeling oily on the surface. That paradox is one of the most common things clinics see in men through the summer, and it is why the instinct to strip oil away usually makes it worse.",
      },
      { type: "h2", text: "What sweat actually does to your skin" },
      {
        type: "p",
        text: "Sweat itself is not the problem. It is mildly antimicrobial and helps regulate the skin’s pH.",
      },
      {
        type: "p",
        text: "The issue is what happens when sweat sits on the surface: it mixes with sebum, sunscreen, environmental pollution, and dead skin cells, and that mixture occludes pores. Add heat, and bacteria multiply faster on the surface than they otherwise would.",
      },
      {
        type: "p",
        text: "For anyone with a beard, the skin under and around facial hair is especially prone to this. Sweat and oil collect at the follicle, and without regular deep cleansing that congestion shows up as ingrown hairs, bumps along the jawline, and irritation that never quite resolves.",
      },
      { type: "h2", text: "Sun damage in men: why it accumulates faster" },
      {
        type: "p",
        text: "Studies consistently show that men are less likely to apply sunscreen daily and less likely to reapply it. Over decades that compounds.",
      },
      {
        type: "p",
        text: "UV damage does not appear overnight. It builds slowly as hyperpigmentation, rough texture, broken capillaries, and loss of elasticity. By the time any of it is visible in the mirror, years of cumulative exposure have already done the work at a cellular level.",
      },
      {
        type: "p",
        text: "The exposure that matters most is usually the exposure nobody counts. Men who work outdoors, play sport outside, or commute on foot or by bike accumulate significant UV without registering it. A twenty-minute commute five days a week is more than an hour and a half of direct facial exposure every week — before a single summer weekend is added.",
      },
      { type: "h2", text: "What men can do about it" },
      { type: "h3", text: "In the treatment room" },
      {
        type: "p",
        text: "Professional treatment is not about luxury. It is about doing the things a home routine genuinely cannot reach.",
      },
      {
        type: "p",
        text: "[Hydradermabrasion](/services/hydradermabrasion/), for example, uses a fluid-based vortex system to clear pore congestion at a depth cleansers and scrubs do not reach, and infuses hydrating serum in the same appointment. Clearing buildup while restoring hydration in one session is exactly what a summer-stressed barrier needs, and it is a reasonable first treatment for anyone who has never booked a facial before. A [signature facial](/services/signature-facial/) covers similar ground at a gentler pace if congestion is not the main issue.",
      },
      {
        type: "p",
        text: "For unwanted facial or body hair — particularly along the neckline and beard line — [laser hair removal](/services/laser-hair-removal/) addresses ingrown hairs and folliculitis at the follicle rather than managing the symptoms of shaving and waxing every few weeks. Rather than treating the same irritation repeatedly, a series progressively reduces growth so the skin gets a chance to rest.",
      },
      {
        type: "note",
        text: "Laser treatment and summer sun need to be planned together. Recent tanning and heavy sun exposure change both candidacy and settings, and hair colour and skin tone determine how well the treatment works at all — fine, grey, white, and some very light hair often responds poorly. Disclose medications; several increase light sensitivity.",
      },
      { type: "h3", text: "At home" },
      {
        type: "p",
        text: "Summer skin does not require an elaborate routine. A handful of targeted habits do most of the work:",
      },
      {
        type: "ul",
        items: [
          "**Cleanse twice a day**, not once. Morning cleansing removes overnight sebum; evening cleansing removes the day’s buildup. A gentle gel or foam cleanser is better than bar soap, which disrupts skin pH.",
          "**SPF every morning**, including cloudy days. Mineral formulas with zinc oxide or titanium dioxide sit on the surface and are less likely to clog pores than some chemical filters. A moisturizer with SPF 30 or higher is enough for ordinary daily use.",
          "**Lightweight hydration**, not skipped hydration. Oily skin still needs moisture — skipping it can prompt the skin to produce more oil to compensate. A non-comedogenic gel moisturizer absorbs without residue.",
          "**Rinse after sweating** when you can. Even plain water removes surface buildup and gives pores a chance to clear.",
          "**Hands off the face.** Touching transfers bacteria and oil, and in warm months you are touching more surfaces and sweating more while you do it.",
        ],
      },
      { type: "h2", text: "The bottom line" },
      {
        type: "p",
        text: "Summer skin care for men is less about appearance than about keeping the barrier intact, working with the biological reality of higher oil production, limiting UV exposure, and dealing with congestion before it turns into a longer-term concern.",
      },
      {
        type: "quote",
        text: "The earlier the habits start, the less there is to correct later.",
      },
      {
        type: "p",
        text: "Anima Med Spa is at 2885 Lakeshore Blvd West in Etobicoke, seeing clients from Mississauga, Bloor West Village, The Kingsway, and Humber Bay Shores. Consultations for men’s facials and laser hair removal can be arranged through the [booking page](/book-now.html) or by phone.",
      },
    ],
  }),

  post({
    title: "April: It Is Always Facial Weather",
    slug: "always-facial-weather",
    published: "2026-04-08",
    deck: "Skin changes with more than the seasons. A case for steady, unhurried care rather than a correction every few months.",
    heroAlt: "Serum applied by hand during a facial at Anima Med Spa",
    readMinutes: 4,
    relatedServiceSlugs: ["signature-facial", "hydradermabrasion", "korean-glass-skin-facial"],
    body: [
      { type: "p", text: "Your skin is always changing." },
      {
        type: "p",
        text: "Not only with the seasons, but with your routine, your stress, your sleep, your environment.",
      },
      { type: "p", text: "Some days it feels balanced. Some days it feels dull, dry, or reactive." },
      { type: "p", text: "And most of the time, those changes happen quietly." },
      { type: "h2", text: "Understanding skin beyond “good” or “bad”" },
      { type: "p", text: "We tend to describe skin in single words:" },
      { type: "ul", items: ["breaking out", "dry", "sensitive", "glowing"] },
      { type: "p", text: "But skin is not fixed. It is a system that is constantly adjusting." },
      {
        type: "p",
        text: "What you see on the surface is usually the result of what your skin has been managing for weeks.",
      },
      {
        type: "p",
        text: "Which is why care is not only about reacting. It is about supporting skin before it struggles.",
      },
      { type: "h2", text: "Why gentle, consistent care matters" },
      { type: "p", text: "Healthy skin is rarely built through intensity. It is built through:" },
      { type: "ul", items: ["gentle renewal", "proper hydration", "consistent support"] },
      { type: "p", text: "A facial is one of the ways skin can be helped to:" },
      { type: "ul", items: ["release buildup", "rebalance hydration", "improve texture over time"] },
      {
        type: "p",
        text: "Not by forcing change, but by guiding skin back toward where it works best.",
      },
      {
        type: "p",
        text: "In practice that usually starts with a [signature facial](/services/signature-facial/), or with [hydradermabrasion](/services/hydradermabrasion/) when hydration and congestion are the more pressing concerns. Which one is appropriate is decided by the skin in front of the aesthetician on the day, not booked in advance for the year.",
      },
      { type: "h2", text: "Seasonal care, without starting over" },
      { type: "p", text: "Each season asks for something a little different:" },
      {
        type: "ul",
        items: [
          "Winter can leave skin dry and depleted.",
          "Spring is often a reset.",
          "Summer tends to bring more oil and congestion.",
          "Fall is usually about repair.",
        ],
      },
      {
        type: "p",
        text: "But skin does not need to be *fixed* every few months. It needs care that adapts alongside it.",
      },
      { type: "h2", text: "A different way to think about skin" },
      { type: "p", text: "Instead of asking: *What do I need right now?*" },
      { type: "p", text: "It can help to ask: *What does my skin need consistently?*" },
      {
        type: "p",
        text: "Because skin that is supported regularly leaves far less to correct later.",
      },
      {
        type: "quote",
        text: "It is always facial weather. Not because your skin always needs more, but because it always deserves care.",
      },
      { type: "h2", text: "How Anima approaches it" },
      {
        type: "p",
        text: "With care, patience, and intention. Every treatment is meant to:",
      },
      {
        type: "ul",
        items: [
          "respect the skin as it is that day",
          "work with it rather than against it",
          "create changes that look natural and hold",
        ],
      },
      { type: "h2", text: "A gentle option, if you are building consistency" },
      {
        type: "p",
        text: "For anyone who prefers a regular rhythm, the [Glow Plan](/glow-plan/) is a monthly membership built around routine care rather than one-off appointments. It is a twelve-month commitment, so it suits people who already book regularly rather than occasionally.",
      },
      { type: "p", text: "Nothing excessive. Just consistent care, done properly." },
      {
        type: "note",
        text: "The membership’s billing, cancellation, and renewal terms are set out in the agreement the clinic provides before you sign. Ask for it during a consultation — nothing is charged before you have read it.",
      },
    ],
  }),

  post({
    title: "What Is a Hollywood Carbon Laser Peel?",
    slug: "hollywood-carbon-laser-peel",
    published: "2026-04-25",
    deck: "A carbon-assisted laser facial with little planned downtime. What it does, what it is used for, and what the Hollywood name does and does not promise.",
    heroAlt: "Carbon layer applied to the face before a laser pass at Anima Med Spa",
    readMinutes: 6,
    relatedServiceSlugs: ["carbon-laser-peel", "hydradermabrasion", "pigment-removal"],
    body: [
      {
        type: "p",
        text: "If the phrase keeps appearing in your feed, you are not imagining it. The carbon laser peel has quietly become one of the most requested facials in the med spa world. Here is what it actually involves.",
      },
      { type: "h2", text: "So what is it?" },
      {
        type: "p",
        text: "A [Carbon Laser Peel](/services/carbon-laser-peel/) is a non-invasive laser facial. A layer of liquid carbon is applied to the skin and left to settle, where it binds to surface oil and debris. A laser then passes over the area, heating and removing the carbon — and taking dead skin cells, oil, and impurities with it — while the laser energy is also intended to stimulate collagen at depth.",
      },
      {
        type: "p",
        text: "What clients tend to notice: smoother texture, pores that look more refined, less obvious pigment, and an immediate brightness. No needles, and usually no planned downtime.",
      },
      { type: "h2", text: "Why “Hollywood”?" },
      {
        type: "p",
        text: "The name comes from its reputation as a pre-event treatment, the kind booked before a red carpet because something is visible the same day. It is a marketing name for a category of laser facial rather than a distinct technology, and it is not a promise of poreless or flawless skin. Worth knowing before the name sets the expectation.",
      },
      { type: "h2", text: "What is it used for?" },
      { type: "p", text: "The treatment is generally suited to:" },
      {
        type: "ul",
        items: [
          "dull or uneven-looking skin tone",
          "enlarged or congested pores",
          "oily skin",
          "mild acne and blackheads",
          "fine lines and early visible signs of aging",
          "sun damage and pigmentation",
        ],
      },
      {
        type: "p",
        text: "It is described as workable across a wide range of skin tones and gentle enough for most skin types. Even so, device settings, recent sun exposure, medications, and any active skin condition decide candidacy in the room — not the list above.",
      },
      { type: "h2", text: "What does it feel like?" },
      {
        type: "p",
        text: "Most clients describe it as comfortable: warmth and a light tingling as the laser passes over the skin. No numbing is required, the appointment typically runs around thirty minutes, and most people return to their normal routine straight afterward.",
      },
      { type: "h2", text: "What results can you expect?" },
      { type: "p", text: "After a single session, most clients notice some combination of:" },
      {
        type: "ul",
        items: [
          "a brighter, more even-looking complexion",
          "pores that appear smaller",
          "smoother skin texture",
          "a healthier-looking surface",
        ],
      },
      {
        type: "p",
        text: "Across a series, changes accumulate rather than arrive at once — the clinic notes that some clients choose three to six sessions for ongoing oiliness, acne, or pore concerns. How much changes, and how long it holds, depends on skin condition, home care, and what else is in the plan.",
      },
      {
        type: "note",
        text: "Mild redness, warmth, dryness, or sensitivity can last several hours afterward. Keep skincare gentle, skip exfoliation and heat for a few days, and use diligent broad-spectrum sun protection — freshly treated skin is more sun-reactive. Pigment change, blistering, and burns are less common but remain real risks of any laser treatment, which is why assessment comes first.",
      },
      { type: "h2", text: "Is spring a good time to book?" },
      {
        type: "p",
        text: "It is a sensible window. Sun exposure has not yet peaked, which keeps pigment risk lower, and congestion tends to increase as the weather warms. Starting now means there is room to complete a series before summer rather than treating skin at its most sun-exposed.",
      },
      {
        type: "quote",
        text: "Brighter, smoother, clearer. A laser facial — not a reinvention.",
      },
      {
        type: "p",
        text: "If texture and collagen matter more to you than surface clarity, [microneedling](/services/microneedling-pdrn/) may be the better conversation, and hydration-led congestion often responds well to [hydradermabrasion](/services/hydradermabrasion/) instead. A consultation confirms which of the three fits your skin; appointments can be arranged from the [booking page](/book-now.html).",
      },
    ],
  }),

  post({
    title: "Body Image and Confidence: Caring for Your Skin and Body",
    slug: "body-image-and-confidence",
    published: "2024-01-11",
    deck: "Aesthetic treatment works best when it supports confidence rather than manufacturing pressure. What that distinction looks like in practice.",
    heroAlt: "Client in conversation with a provider in the consultation room at Anima Med Spa",
    readMinutes: 5,
    relatedServiceSlugs: ["hydradermabrasion", "weight-management", "carbon-laser-peel"],
    body: [
      {
        type: "p",
        text: "In a feed full of filters and carefully arranged images, it is easy to feel pressure about how you look. Constant comparison has a way of making small imperfections feel larger than they are.",
      },
      {
        type: "p",
        text: "But confidence rarely comes from chasing perfection. It tends to come from feeling comfortable in your own skin and body.",
      },
      {
        type: "p",
        text: "Anima’s stated position is that medical aesthetics should support confidence rather than create pressure — enhancing what is already there, supporting skin health, and helping clients feel more aligned with the version of themselves they recognize.",
      },
      { type: "h2", text: "Confidence starts with skin that feels healthy" },
      {
        type: "p",
        text: "Dullness, acne, pigmentation, and uneven texture affect confidence more than most people expect them to. When skin feels healthy and balanced, it often changes how someone carries themselves — which is a smaller claim than a transformation, and a more honest one.",
      },
      {
        type: "p",
        text: "That is where professional skincare has a role. Treatments such as [hydradermabrasion](/services/hydradermabrasion/), [laser hair removal](/services/laser-hair-removal/), the [Carbon Laser Peel](/services/carbon-laser-peel/), and medical facials including the [signature facial](/services/signature-facial/) are designed to support skin health and its natural condition. Each has its own candidacy requirements, and none of them is a shortcut.",
      },
      {
        type: "quote",
        text: "The goal is not perfection. The goal is confidence in the skin you live in.",
      },
      { type: "h2", text: "Feeling good in your body" },
      {
        type: "p",
        text: "Body image is tied to how you feel physically as much as how you look. Weight fluctuations, hormonal changes, and everyday habits all shape that relationship, and they rarely move in a straight line.",
      },
      {
        type: "p",
        text: "For clients who want structure and accountability, a medically guided [weight management program](/services/weight-management/) can provide both. Anima’s program is built around personalized guidance, progress tracking, and lifestyle support — steady, sustainable progress rather than an extreme fixed timeline, and medication eligibility assessed individually rather than assumed.",
      },
      {
        type: "note",
        text: "A medical consultation is required before the program begins. Health history, current medications, pregnancy, eating-disorder history, and mental health are all part of that conversation, and they determine whether the program is appropriate at all.",
      },
      { type: "h2", text: "Treatment should feel like a choice" },
      {
        type: "p",
        text: "Modern medical aesthetics is far less about dramatic transformation than it used to be. Most of the work is subtle: maintaining healthy skin, addressing one specific concern, or working toward a wellness goal. Every path through that looks different, and the sequence matters less than whether it was chosen deliberately.",
      },
      {
        type: "p",
        text: "The clinic’s role is guidance, professional care, and an honest account of what a treatment can and cannot do. The decision stays with you — including the decision to do nothing at all, which is sometimes the right one.",
      },
      {
        type: "p",
        text: "Beauty should never feel like pressure. At its best, it feels like something you chose. Consultations can be arranged through the [booking page](/book-now.html) or by phone, and nothing is booked before the plan makes sense to you.",
      },
    ],
  }),
];

export const postBySlug = new Map(posts.map((p) => [p.slug, p]));
export const postCategoryById = new Map(postCategories.map((c) => [c.id, c]));

// Newest first. Dates are ISO strings so build output never varies by machine.
export const postsNewestFirst = [...posts].sort((a, b) => (a.published < b.published ? 1 : -1));
