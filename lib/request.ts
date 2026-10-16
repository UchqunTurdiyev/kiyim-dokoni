import type { NextRequest } from "next/server";

// So'rovdan Meta moslashtirish uchun kerakli texnik ma'lumotlar: IP, UA, _fbp, _fbc
export function getClientSignals(req: NextRequest, pageUrl?: string) {
  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;
  const fbp = req.cookies.get("_fbp")?.value;
  let fbc = req.cookies.get("_fbc")?.value;

  // _fbc cookie bo'lmasa — URL'dagi fbclid'dan Meta formatida yasaymiz
  if (!fbc && pageUrl) {
    try {
      const fbclid = new URL(pageUrl).searchParams.get("fbclid");
      if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
    } catch {
      /* noto'g'ri URL */
    }
  }
  return { ip, userAgent, fbp, fbc };
}

export function siteUrl(req: NextRequest) {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export function formatPhoneDigits(digits: string) {
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
}

export function utmToText(utm: unknown) {
  return utm && typeof utm === "object"
    ? Object.entries(utm as Record<string, string>)
        .map(([k, v]) => `${k}=${String(v).slice(0, 100)}`)
        .join(", ")
    : "";
}
