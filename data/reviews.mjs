/**
 * Real Google reviews, reproduced verbatim. Typos, capitalisation and line
 * breaks are preserved deliberately — editing a review is falsification.
 * `asOf` dates the aggregate figures so they cannot silently go stale.
 *
 * Text is transcribed from the clinic's live Trustindex Google widget. The
 * only edit applied is removal of the widget's boilerplate prefix
 * ("Trustindex verifies that the original source of the review is Google."),
 * which is chrome the widget prepends, not words a reviewer wrote.
 *
 * `text` is an array of paragraphs. A review that ran as one block is a
 * one-element array, so consumers can always render with a single uniform
 * loop and never have to branch on shape.
 */
export const reviewSource = {
  platform: "Google",
  profileUrl: "https://www.google.com/maps/search/?api=1&query=Anima+Med+Spa+Etobicoke",
  disclaimer:
    "Reviews are individual experiences published by clients on Google. They are not statements by the clinic and do not describe typical results.",
};

/**
 * Aggregate rating shown for the clinic's Fresha listing. `asOf` is the date
 * these numbers were last read off the live listing — re-read it before
 * quoting the figures, because a rating that has drifted is a false claim.
 */
export const freshaSignal = {
  rating: "5.0",
  count: 18,
  asOf: "2026-07-29",
  url: "https://www.fresha.com/store/anima-medspa-store-sqkfn0xx?share=true&pId=2700299",
};

export const reviews = [
  {
    author: "mahsa falsafi",
    text: [
      "Excellent service from start to finish. The team was professional, informative, and genuinely cared about my comfort and treatment concerns. The clinic is clean, modern, and relaxing. Highly recommend to anyone considering treatments! Will be back consistently for more facials!",
    ],
  },
  {
    author: "Kourosh M",
    text: [
      "I don’t usually leave reviews but I consulted with Sally for a laser treatment and love the results! Peggy, the technician, is very friendly and skilled at what she does! Will def go back",
    ],
  },
  {
    author: "Kourosh",
    text: [
      "Sally and Peggy are a pleasure to interact with and they’re highly experienced and good at what they do! They take their time with every service and walk through every step! Place is clean and prices are competitive! 10/10",
    ],
  },
  {
    author: "Mette Weidinger",
    text: [
      "I thoroughly enjoyed a Traditional facial today at Anima MedSpa by Peggy. It was relaxing and soothing, Peggy was wonderful, kind and attentive. I left with glowing skin feeling amazing, definitely going to have this treatment again - can warmly recommend Anima MedSpa, a professional, clean spa - a local gem in our South Etobicoke neighbourhood!",
    ],
  },
  // ⚠️ This review asserts the owner "has over 30 years of experience". That is
  // the reviewer's own unverified claim — the clinic has not confirmed it, and
  // it conflicts with the credentials published on the about page. It stays
  // here verbatim because silently excerpting a real person's review is worse
  // than carrying a claim that is plainly attributed to them.
  //
  // NEVER pull this sentence out of its context: it must not appear in a
  // heading, a meta description, JSON-LD, a stat tile, or any other place
  // where the clinic would be the speaker. In context and attributed it is a
  // customer opinion; excerpted it becomes an advertising claim by the clinic.
  {
    author: "Ipek B",
    text: [
      "Anima Med Spa is the best clinic I’ve been to so far.",
      "Extremely experienced with laser treatments. The owner has over 30 years of experience and it shows in both technique and results. I did a carbon laser package and the treatment was excellent - i get it every year as a package and this was the best treatment I’ve received. Their machine is brand new and she is super detail oriented.",
      "Great treatment options and fair priced packages. No scam add ons.",
      "Strongly recommend.",
    ],
  },
  {
    author: "Minou Behboudi",
    text: [
      "I had an amazing experience at Anima Med Spa. The staff are incredibly professional, knowledgeable, and welcoming, and they really take the time to listen to your concerns and goals. The environment is clean, calming, and beautifully designed, which makes the whole experience even better.",
      "I felt well cared for from start to finish, and everything was explained clearly, which made me feel comfortable and confident in the treatment. The results were natural and exactly what I was hoping for. I highly recommend Anima Med Spa to anyone looking for high-quality aesthetic care and exceptional service.",
    ],
  },
  {
    author: "Lavin P",
    text: [
      "I had an amazing experience at this spa from start to finish… The space is spotless, calming, and beautifully designed. Sally is incredibly welcoming, knowledgeable, and made me feel comfortable right away. Peggy took the time to listen to my goals, explained everything clearly, and delivered results that exceeded my expectations. I never felt rushed or pressured—just genuinely cared for. Im beyond happy with my results and will absolutely be coming back. Highly recommend to anyone looking for 5star treatments and exceptional service…",
    ],
  },
  {
    author: "Kai Lin",
    text: [
      "Excellent experience at Anima Med Spa! The environment is clean and relaxing, and Peggy took the time to explain every treatment in detail. Very professional service. Highly recommended!",
    ],
  },
  {
    author: "伍允全",
    text: [
      "Great service and nice environment , Peggy explain all treatment clearly. Very professional,highly recommend.",
    ],
    lang: "zh",
  },
];
