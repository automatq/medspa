import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { posts } from "../data/blog.mjs";

// Featured images as published alongside each post on animamedspa.com. Keyed by
// slug rather than stored in data/blog.mjs so the content module stays free of
// upstream URLs that will 404 once the old site is retired.
const sources = {
  "reverse-the-summer-damage": "https://animamedspa.com/wp-content/uploads/2026/07/seasonal-change-2-1024x819.png",
  "worth-booking-this-july": "https://animamedspa.com/wp-content/uploads/2026/07/seasonal-change-2-1024x819.png",
  "summer-skin-for-men": "https://animamedspa.com/wp-content/uploads/2026/05/Hollywood-carbon-peel-at-Anima-Medspa-6-1.png",
  "always-facial-weather":
    "https://animamedspa.com/wp-content/uploads/2026/04/A_woman_at_a_medspa_setting_cl_Nano_Banana_2_11518-1.png",
  "hollywood-carbon-laser-peel": "https://animamedspa.com/wp-content/uploads/2026/04/0D5A3111-EditLR-1024x683-1.jpg",
  "body-image-and-confidence": "https://animamedspa.com/wp-content/uploads/2026/02/eeedfefa-3.png",
};

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36";

const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").filter(Boolean)) : null;

const jobs = posts
  .filter((post) => !only || only.has(post.slug))
  .map((post) => ({ stem: post.imageStem, url: sources[post.slug] }));

const missing = jobs.filter((job) => !job.url);
if (missing.length) throw new Error(`no source image for: ${missing.map((job) => job.stem).join(", ")}`);

await mkdir(".context/blog-originals", { recursive: true });
await mkdir("assets/img/blog", { recursive: true });

for (const [index, job] of jobs.entries()) {
  const extension = extname(new URL(job.url).pathname) || ".image";
  const original = `.context/blog-originals/${job.stem}${extension}`;
  const response = await fetch(job.url, {
    headers: { "user-agent": userAgent, accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${job.stem}: image request failed with ${response.status}`);
  await writeFile(original, Buffer.from(await response.arrayBuffer()));

  for (const width of [640, 1280]) {
    execFileSync("python3", ["scripts/optimize-image.py", original, `assets/img/blog/${job.stem}-${width}.webp`, String(width)], {
      stdio: "inherit",
    });
  }

  console.log(`[${index + 1}/${jobs.length}] ${job.stem}`);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

console.log(`Optimized ${jobs.length} blog images at 640px and 1280px.`);
