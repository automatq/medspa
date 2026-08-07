import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { team } from "../data/team.mjs";

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36";

// Members without a `sourceImage` have no photograph published upstream and
// render as an initials monogram instead. Never substitute stock art for them.
const jobs = team
  .filter((member) => member.sourceImage && member.imageBase.startsWith("/assets/img/team/"))
  .map((member) => ({ stem: member.slug, url: member.sourceImage }));

await mkdir(".context/team-originals", { recursive: true });
await mkdir("assets/img/team", { recursive: true });

for (const [index, job] of jobs.entries()) {
  const extension = extname(new URL(job.url).pathname) || ".image";
  const original = `.context/team-originals/${job.stem}${extension}`;
  const response = await fetch(job.url, {
    headers: { "user-agent": userAgent, accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${job.stem}: image request failed with ${response.status}`);
  await writeFile(original, Buffer.from(await response.arrayBuffer()));

  for (const width of [640, 1280]) {
    execFileSync("python3", ["scripts/optimize-image.py", original, `assets/img/team/${job.stem}-${width}.webp`, String(width)], {
      stdio: "inherit",
    });
  }

  console.log(`[${index + 1}/${jobs.length}] ${job.stem}`);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

console.log(`Optimized ${jobs.length} team portraits at 640px and 1280px.`);
