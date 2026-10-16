import { NextRequest, NextResponse } from "next/server";
import { buildUserData, sendCapi } from "@/lib/capi";
import { newLeadId } from "@/lib/leadToken";
import { notifyLeadWithButton } from "@/lib/leadFlow";
import { formatPhoneDigits, getClientSignals, siteUrl, utmToText } from "@/lib/request";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, address, eventId, pageUrl, utm } = await req.json();

    const cleanName = String(name ?? "").trim().slice(0, 80);
    const cleanAddress = String(address ?? "").trim().slice(0, 200);
    const digits = String(phone ?? "").replace(/\D/g, "");
    const url = typeof pageUrl === "string" ? pageUrl.slice(0, 500) : undefined;

    if (cleanName.length < 2) return NextResponse.json({ error: "Ismni kiriting" }, { status: 400 });
    if (!/^998\d{9}$/.test(digits)) return NextResponse.json({ error: "Telefon raqam noto'g'ri" }, { status: 400 });
    if (cleanAddress.length < 3) return NextResponse.json({ error: "Manzilni kiriting" }, { status: 400 });

    const leadId = newLeadId();
    const signals = getClientSignals(req, url);
    // external_id = telefon raqam: Lead va keyingi Purchase bitta odamga bog'lanadi
    const userData = buildUserData({ phone: digits, firstName: cleanName, city: cleanAddress, externalId: digits, ...signals });
    const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

    const [tg, capi] = await Promise.allSettled([
      notifyLeadWithButton({
        title: "🛍 <b>Yangi ariza!</b>",
        lines: {
          "🆔 Lid": leadId,
          "👤 Ism": cleanName,
          "📞 Telefon": formatPhoneDigits(digits),
          "📍 Manzil": cleanAddress,
          "🕒 Vaqt": time,
          "🔗 UTM": utmToText(utm),
          "📊 Meta": signals.fbc ? "reklamadan (fbc bor)" : signals.fbp ? "pixel (fbp bor)" : "",
        },
        baseUrl: siteUrl(req),
        payload: {
          v: 1,
          lid: leadId,
          t: Math.floor(Date.now() / 1000),
          src: "lead",
          url,
          ud: userData,
          label: `${cleanName.split(/\s+/)[0]} · ••${digits.slice(-2)}`,
        },
      }),
      sendCapi({
        eventName: "Lead",
        eventId: String(eventId ?? leadId),
        eventSourceUrl: url,
        userData,
        customData: { content_name: "Kiyim do'koni ariza", lead_id: leadId, currency: "UZS", value: 0 },
      }),
    ]);

    if (capi.status === "rejected") console.error("CAPI:", capi.reason);
    if (tg.status === "rejected") {
      console.error(tg.reason);
      return NextResponse.json({ error: "Arizani yuborib bo'lmadi, qayta urinib ko'ring" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, leadId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
