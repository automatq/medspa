import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { services } from "../data/services.mjs";

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36";

const imageJobs = services.flatMap((item) => {
  const jobs = [{ stem: item.imageStem, url: item.sourceImage }];
  if (item.providerImage && item.provider) {
    jobs.push({ stem: item.provider.imageStem, url: item.providerImage });
  }
  return jobs;
});

await mkdir(".context/service-originals", { recursive: true });
await mkdir("assets/img/services", { recursive: true });

for (const [index, job] of imageJobs.entries()) {
  const extension = extname(new URL(job.url).pathname) || ".image";
  const original = `.context/service-originals/${job.stem}${extension}`;
  const response = await fetch(job.url, {
    headers: { "user-agent": userAgent, accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${job.stem}: image request failed with ${response.status}`);
  await writeFile(original, Buffer.from(await response.arrayBuffer()));

  for (const width of [640, 1280]) {
    const destination = `assets/img/services/${job.stem}-${width}.webp`;
    execFileSync("python3", ["scripts/optimize-image.py", original, destination, String(width)], {
      stdio: "inherit",
    });
  }

  console.log(`[${index + 1}/${imageJobs.length}] ${job.stem}`);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

console.log(`Optimized ${imageJobs.length} authorized source images at 640px and 1280px.`);
