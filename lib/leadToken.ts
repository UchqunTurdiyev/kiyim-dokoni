// Lid ma'lumotlarini Telegram tugmasidagi linkga xavfsiz joylash uchun token.
// - Shaxsiy ma'lumotlar (telefon, ism, shahar, external_id) Meta talabiga ko'ra SHA-256 bilan HESHLANADI.
// - Butun paket (heshlar + fbp/fbc/ip/UA + buyurtma) zlib bilan siqiladi va AES-256-GCM bilan SHIFRLANADI.
//   Kalitsiz hech kim linkni o'qiy olmaydi va o'zgartira olmaydi (GCM imzosi buzilsa token rad etiladi).
import crypto from "crypto";
import zlib from "zlib";
import type { MetaUserData } from "./capi";

export type LeadTokenPayload = {
  v: 1;
  lid: string; // lid ID (masalan: L-MG7K2X)
  t: number; // lid tushgan vaqt (unix soniya)
  src: "lead" | "order";
  url?: string; // event_source_url
  ud: MetaUserData; // Meta uchun tayyor (heshlangan) user_data
  label: string; // sotuvchi sahifasida ko'rinadigan qisqa belgi: "Dilnoza · ••45"
  total?: number; // buyurtma summasi (UZS), bo'lsa
  items?: { id: string; q: number; p: number }[]; // sku, soni, narxi
  tg?: { c: string; m: number }; // Telegram chat_id va message_id (to'landi belgisi uchun)
};

function key() {
  const secret = process.env.LEAD_TOKEN_SECRET;
  if (!secret || secret.length < 32) throw new Error("LEAD_TOKEN_SECRET kamida 32 belgi bo'lishi kerak");
  return crypto.createHash("sha256").update(secret).digest(); // 32 bayt
}

export function encodeLeadToken(payload: LeadTokenPayload): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const packed = zlib.deflateRawSync(Buffer.from(JSON.stringify(payload)));
  const enc = Buffer.concat([cipher.update(packed), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decodeLeadToken(token: string): LeadTokenPayload {
  const buf = Buffer.from(String(token || ""), "base64url");
  if (buf.length < 29) throw new Error("Token noto'g'ri");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  let json: LeadTokenPayload;
  try {
    const packed = Buffer.concat([decipher.update(enc), decipher.final()]);
    json = JSON.parse(zlib.inflateRawSync(packed).toString("utf8"));
  } catch {
    throw new Error("Token buzilgan yoki soxta");
  }
  if (json.v !== 1) throw new Error("Token versiyasi mos emas");

  const ttlDays = Number(process.env.LEAD_TOKEN_TTL_DAYS || 30);
  if (Date.now() / 1000 - json.t > ttlDays * 86400) throw new Error(`Link muddati tugagan (${ttlDays} kun)`);
  return json;
}

export function newLeadId() {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rnd = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `L-${ts}${rnd}`;
}
