import crypto from "crypto";

const API_VERSION = "v21.0";

const sha256 = (v: string) => crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

type CapiInput = {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  phone?: string;
  firstName?: string;
  city?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  customData?: Record<string, unknown>;
};

export async function sendCapiEvent(input: CapiInput) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return { skipped: true };

  const user_data: Record<string, unknown> = { country: [sha256("uz")] };
  if (input.phone) user_data.ph = [sha256(input.phone.replace(/\D/g, ""))];
  if (input.firstName) user_data.fn = [sha256(input.firstName.split(" ")[0])];
  if (input.city) user_data.ct = [sha256(input.city.replace(/[^a-zA-Z]/g, ""))];
  if (input.ip) user_data.client_ip_address = input.ip;
  if (input.userAgent) user_data.client_user_agent = input.userAgent;
  if (input.fbp) user_data.fbp = input.fbp;
  if (input.fbc) user_data.fbc = input.fbc;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.eventSourceUrl,
        user_data,
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
  if (!res.ok) console.error("CAPI xatosi:", json);
  return json;
}
