import { NextRequest, NextResponse } from "next/server";
import { sendTelegram } from "@/lib/telegram";
import { sendCapiEvent } from "@/lib/capi";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, address, eventId, pageUrl, utm } = await req.json();

    const cleanName = String(name ?? "").trim();
    const cleanAddress = String(address ?? "").trim();
    const digits = String(phone ?? "").replace(/\D/g, "");

    if (cleanName.length < 2) return NextResponse.json({ error: "Ismni kiriting" }, { status: 400 });
    if (!/^998\d{9}$/.test(digits)) return NextResponse.json({ error: "Telefon raqam noto'g'ri" }, { status: 400 });
    if (cleanAddress.length < 3) return NextResponse.json({ error: "Manzilni kiriting" }, { status: 400 });

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const fbp = req.cookies.get("_fbp")?.value;
    const fbc = req.cookies.get("_fbc")?.value;

    const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
    const formattedPhone = `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;

    const utmText = utm && typeof utm === "object"
      ? Object.entries(utm as Record<string, string>).map(([k, v]) => `${k}=${v}`).join(", ")
      : "";

    // Telegram — majburiy, CAPI — xato bo'lsa ham arizani to'xtatmaydi
    const [tg, capi] = await Promise.allSettled([
      sendTelegram({
        "👤 Ism": cleanName,
        "📞 Telefon": formattedPhone,
        "📍 Manzil": cleanAddress,
        "🕒 Vaqt": time,
        "🔗 UTM": utmText,
      }),
      sendCapiEvent({
        eventName: "Lead",
        eventId: String(eventId ?? ""),
        eventSourceUrl: pageUrl,
        phone: digits,
        firstName: cleanName,
        city: cleanAddress,
        ip,
        userAgent,
        fbp,
        fbc,
        customData: { content_name: "Kiyim do'koni ariza", currency: "UZS", value: 0 },
      }),
    ]);

    if (capi.status === "rejected") console.error("CAPI:", capi.reason);
    if (tg.status === "rejected") {
      console.error(tg.reason);
      return NextResponse.json({ error: "Arizani yuborib bo'lmadi, qayta urinib ko'ring" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
