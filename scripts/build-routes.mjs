import { writeFile } from "node:fs/promises";
import { extraRedirects } from "../data/redirects.mjs";
import { services } from "../data/services.mjs";

/**
 * Sole owner of vercel.json. Never hand-edit that file — every redirect source
 * must be derivable from data, or the next build silently drops it.
 *
 * Two rules Vercel enforces and this build encodes:
 *  - Requests are normalized to the trailing-slash form *before* redirects are
 *    evaluated, so every source must end in "/".
 *  - A source equal to its destination is an infinite loop, so it is dropped.
 */
const collect = () => {
  const candidates = [
    ...services.map((item) => ({
      source: new URL(item.legacyUrl).pathname,
      destination: `/services/${item.slug}/`,
      permanent: true,
    })),
    ...extraRedirects,
  ];

  const seen = new Set();
  const redirects = [];

  for (const redirect of candidates) {
    if (!redirect.source.endsWith("/")) {
      throw new Error(`trailingSlash is on — redirect source must end with "/": ${redirect.source}`);
    }
    if (redirect.source === redirect.destination) continue;
    if (seen.has(redirect.source)) {
      throw new Error(`duplicate redirect source: ${redirect.source}`);
    }
    seen.add(redirect.source);
    redirects.push(redirect);
  }

  return redirects;
};

const redirects = collect();

await writeFile(
  "vercel.json",
  `${JSON.stringify(
    {
      outputDirectory: ".",
      cleanUrls: true,
      trailingSlash: true,
      redirects,
      headers: [
        {
          source: "/assets/(.*)",
          headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
        },
      ],
    },
    null,
    2
  )}\n`
);

console.log(`Wrote vercel.json with ${redirects.length} legacy redirects.`);
