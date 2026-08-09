import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

/**
 * Session auth with no dependencies.
 *
 * preet/cambridge signs a JWT and parks it in localStorage, which is readable by
 * any injected script — its own review flags this. We put an HMAC-signed value in
 * an HttpOnly cookie instead: JavaScript cannot read it, so an XSS bug cannot
 * walk off with the session.
 *
 * Two env vars, both set in Vercel:
 *   ADMIN_PASSWORD_HASH  scrypt hash, "<saltHex>:<keyHex>" — see `hashPassword`
 *   ADMIN_SESSION_SECRET random string used to sign the cookie
 */

export const COOKIE_NAME = "anima_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;

const secret = () => {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not set");
  return value;
};

const sign = (payload) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** `node -e "import('./api/_lib/auth.mjs').then(m=>m.hashPassword('...').then(console.log))"` */
export const hashPassword = async (password) => {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
};

export const verifyPassword = async (password, stored) => {
  if (!stored || !stored.includes(":")) return false;
  const [saltHex, keyHex] = stored.split(":");
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  // Constant-time: a length-varying or short-circuiting compare leaks the hash.
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export const createSession = () => {
  const expires = Date.now() + SESSION_MS;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload)}`;
};

export const readSession = (token) => {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [role, expires, signature] = parts;
  const payload = `${role}.${expires}`;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (!Number(expires) || Number(expires) < Date.now()) return null;
  return { role };
};

export const parseCookies = (header = "") =>
  Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return index === -1 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );

export const sessionCookie = (value, { clear = false } = {}) => {
  const attributes = [
    `${COOKIE_NAME}=${clear ? "" : value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    clear ? "Max-Age=0" : `Max-Age=${Math.floor(SESSION_MS / 1000)}`,
  ];
  return attributes.join("; ");
};

/**
 * A second, non-HttpOnly cookie carrying no authority at all. The client script
 * reads it purely to decide whether to load the editor bundle; every write is
 * still authorised by the signed HttpOnly cookie server-side.
 */
export const HINT_COOKIE = "anima_admin_hint";

export const hintCookie = ({ clear = false } = {}) =>
  [
    `${HINT_COOKIE}=${clear ? "" : "1"}`,
    "Path=/",
    "SameSite=Lax",
    clear ? "Max-Age=0" : `Max-Age=${Math.floor(SESSION_MS / 1000)}`,
  ].join("; ");

/** Guard for admin handlers. Returns true when the request may proceed. */
export const requireAdmin = (req, res) => {
  const cookies = parseCookies(req.headers.cookie || "");
  if (readSession(cookies[COOKIE_NAME])) return true;
  res.status(401).json({ error: "Not signed in" });
  return false;
};
