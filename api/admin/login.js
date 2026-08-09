import { createSession, hintCookie, sessionCookie, verifyPassword } from "../_lib/auth.mjs";
import { rateLimit } from "../_lib/store.mjs";

/**
 * Password in, session cookie out. `POST {password}` to sign in,
 * `DELETE` to sign out.
 *
 * Rate limited per IP — preet's equivalent endpoint has no limit, so its single
 * shared password can be guessed as fast as the network allows. Failures are
 * deliberately vague: distinguishing "wrong password" from "no password
 * configured" tells an attacker which half to work on.
 */
export default async function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", [sessionCookie("", { clear: true }), hintCookie({ clear: true })]);
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = (req.headers["x-forwarded-for"] || "unknown").toString().split(",")[0].trim();
  try {
    const { allowed } = await rateLimit(`login:${ip}`, { limit: 8, windowSeconds: 600 });
    if (!allowed) {
      return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
    }
  } catch {
    // The limiter is a safeguard, not the gate. If the store is unreachable the
    // password check below still has to pass.
  }

  const password = req.body?.password;
  if (typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Password required" });
  }

  const ok = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH || "");
  if (!ok) return res.status(401).json({ error: "Incorrect password" });

  res.setHeader("Set-Cookie", [sessionCookie(createSession()), hintCookie()]);
  return res.status(200).json({ ok: true });
}
