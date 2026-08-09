import { put } from "@vercel/blob";
import { requireAdmin } from "../_lib/auth.mjs";

export const config = { api: { bodyParser: false } };

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Accepts an image and returns its public URL. The URL is then saved through the
 * ordinary copy endpoint, exactly as preet does — images need no separate store,
 * because an image key holds a URL string like any other value.
 *
 * The type is taken from the sniffed magic bytes, not the filename. preet's
 * upload trusts the extension, so `payload.html.jpg` passes its filter.
 */
const SIGNATURES = [
  { ext: "jpg", type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { ext: "gif", type: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
];

const sniff = (buffer) => {
  for (const signature of SIGNATURES) {
    if (signature.bytes.every((byte, index) => buffer[index] === byte)) return signature;
  }
  // WEBP is "RIFF" .... "WEBP"
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return { ext: "webp", type: "image/webp" };
  }
  return null;
};

const readBody = async (req) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error("too-large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    if (error.message === "too-large") {
      return res.status(413).json({ error: "That image is larger than 8MB. Please choose a smaller one." });
    }
    return res.status(400).json({ error: "Could not read the upload" });
  }

  const signature = sniff(body);
  if (!signature) {
    return res.status(415).json({ error: "That file is not a JPG, PNG, WEBP, or GIF image." });
  }

  try {
    // `addRandomSuffix` keeps every upload at a fresh URL, so a replacement is
    // never masked by the year-long immutable cache on the previous one.
    const blob = await put(`uploads/${Date.now()}.${signature.ext}`, body, {
      access: "public",
      contentType: signature.type,
      addRandomSuffix: true,
    });
    return res.status(200).json({ url: blob.url, size: body.length });
  } catch (error) {
    return res.status(502).json({ error: `Upload failed: ${error.message}` });
  }
}
