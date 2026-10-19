import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { isLive } from "./config";

/** AES-256-GCM for health answers. Format: base64(iv).base64(tag).base64(ciphertext). */
function key(): Buffer {
  const raw = process.env.HEALTH_DATA_KEY;
  if (raw) {
    const k = Buffer.from(raw, "base64");
    if (k.length !== 32) throw new Error("HEALTH_DATA_KEY must be 32 bytes, base64 encoded.");
    return k;
  }
  if (isLive()) throw new Error("HEALTH_DATA_KEY is required when BOOKING_MODE=live.");
  // Test mode only: a fixed development key so the flow works out of the box.
  return Buffer.alloc(32, "dev-only-key-not-for-production!");
}

export function encryptJson(value: unknown): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(JSON.stringify(value), "utf8"), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

export function decryptJson<T>(blob: string): T {
  const [iv, tag, data] = blob.split(".").map((s) => Buffer.from(s, "base64"));
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return JSON.parse(Buffer.concat([d.update(data), d.final()]).toString("utf8")) as T;
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (isLive()) throw new Error("SESSION_SECRET is required when BOOKING_MODE=live.");
  return "dev-session-secret";
}

/** Signed, expiring token for cancel / delete-my-data links. */
export function signToken(bookingId: string, ttlMs = 90 * 86400_000): string {
  const exp = Date.now() + ttlMs;
  const body = `${bookingId}.${exp}`;
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  const expect = createHmac("sha256", secret()).update(`${id}.${exp}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  return id;
}
