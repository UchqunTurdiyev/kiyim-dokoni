import crypto from "crypto";

const API_VERSION = "v21.0";

export const sha256 = (v: string) => crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

// Meta CAPI user_data — shaxsiy maydonlar faqat SHA-256 heshlangan holda
export type MetaUserData = {
  ph?: string[];
  fn?: string[];
  ct?: string[];
  country?: string[];
  external_id?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
};

export type UserInput = {
  phone?: string;
  firstName?: string;
  city?: string;
  externalId?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

export function buildUserData(input: UserInput): MetaUserData {
  const ud: MetaUserData = { country: [sha256("uz")] };
  const phone = input.phone?.replace(/\D/g, "");
  if (phone) ud.ph = [sha256(phone)];
  const fn = input.firstName?.trim().split(/\s+/)[0];
  if (fn) ud.fn = [sha256(fn)];
  // Manzildan faqat birinchi qism (shahar) olinadi: "Samarqand, Urgut" -> "samarqand"
  const city = input.city?.split(/[,.;]/)[0].toLowerCase().replace(/[^a-z]/g, "");
  if (city) ud.ct = [sha256(city)];
  if (input.externalId) ud.external_id = [sha256(input.externalId)];
  if (input.ip) ud.client_ip_address = input.ip;
  if (input.userAgent) ud.client_user_agent = input.userAgent;
  if (input.fbp) ud.fbp = input.fbp;
  if (input.fbc) ud.fbc = input.fbc;
  return ud;
}

type SendInput = {
  eventName: string;
  eventId: string;
  eventTime?: number;
  actionSource?: string;
  eventSourceUrl?: string;
  userData: MetaUserData;
  customData?: Record<string, unknown>;
};

export async function sendCapi(input: SendInput) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return { skipped: true };

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: input.actionSource ?? "website",
        event_source_url: input.eventSourceUrl,
        user_data: input.userData,
        custom_data: input.customData ?? {},
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("CAPI xatosi:", json);
    throw new Error(json?.error?.message || `CAPI xatosi (${res.status})`);
  }
  return json as { events_received?: number; fbtrace_id?: string };
}

// Eski interfeys (moslik uchun)
export async function sendCapiEvent(
  input: UserInput & { eventName: string; eventId: string; eventSourceUrl?: string; customData?: Record<string, unknown> }
) {
  return sendCapi({
    eventName: input.eventName,
    eventId: input.eventId,
    eventSourceUrl: input.eventSourceUrl,
    userData: buildUserData(input),
    customData: input.customData,
  });
}
