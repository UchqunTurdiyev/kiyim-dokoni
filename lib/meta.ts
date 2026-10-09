// Meta Pixel uchun client helperlar
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbqTrack(event: string, data: Record<string, unknown> = {}, eventID?: string) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventID) window.fbq("track", event, data, { eventID });
  else window.fbq("track", event, data);
}

export function newEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
