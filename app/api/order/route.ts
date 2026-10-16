import { NextRequest, NextResponse } from "next/server";
import { buildUserData, sendCapi } from "@/lib/capi";
import { formatPrice, getProduct } from "@/lib/products";
import { newLeadId } from "@/lib/leadToken";
import { notifyLeadWithButton } from "@/lib/leadFlow";
import { formatPhoneDigits, getClientSignals, siteUrl, utmToText } from "@/lib/request";

export const runtime = "nodejs";

type ItemIn = { id?: unknown; size?: unknown; qty?: unknown };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, address, comment, eventId, pageUrl, utm, source, items } = body ?? {};

    const cleanName = String(name ?? "").trim().slice(0, 80);
    const cleanAddress = String(address ?? "").trim().slice(0, 200);
    const cleanComment = String(comment ?? "").trim().slice(0, 300);
    const digits = String(phone ?? "").replace(/\D/g, "");

    if (cleanName.length < 2) return NextResponse.json({ error: "Ismni kiriting" }, { status: 400 });
    if (!/^998\d{9}$/.test(digits)) return NextResponse.json({ error: "Telefon raqam noto'g'ri" }, { status: 400 });
    if (cleanAddress.length < 3) return NextResponse.json({ error: "Manzilni kiriting" }, { status: 400 });

    // Narxlar mijozdan emas, serverdagi katalogdan olinadi
    const lines = (Array.isArray(items) ? (items as ItemIn[]) : [])
      .slice(0, 30)
      .map((i) => {
        const product = getProduct(String(i.id ?? ""));
        const size = Number(i.size);
        const qty = Math.max(1, Math.min(10, Math.floor(Number(i.qty) || 1)));
        if (!product || !product.sizes.includes(size)) return null;
        return { product, size, qty };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);

    if (!lines.length) return NextResponse.json({ error: "Savatda mahsulot yo'q" }, { status: 400 });

    const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const count = lines.reduce((s, l) => s + l.qty, 0);

    const url = typeof pageUrl === "string" ? pageUrl.slice(0, 500) : undefined;
    const leadId = newLeadId();
    const signals = getClientSignals(req, url);
    const userData = buildUserData({ phone: digits, firstName: cleanName, city: cleanAddress, externalId: digits, ...signals });
    const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

    const productsText = lines
      .map(
        (l, i) =>
          `${i + 1}. ${l.product.name} (${l.product.sku})\n` +
          `    O'lcham: ${l.size} · Rang: ${l.product.color}\n` +
          `    ${l.qty} × ${formatPrice(l.product.price)} = ${formatPrice(l.product.price * l.qty)}`
      )
      .join("\n");

    // DIQQAT: bu yerda Purchase YUBORILMAYDI. Buyurtma hali to'lanmagan — bu Lead.
    // Haqiqiy Purchase sotuvchi Telegramdagi "💰 To'lov qildi" tugmasini bosganda yuboriladi.
    const [tg, capi] = await Promise.allSettled([
      notifyLeadWithButton({
        title: "🛒 <b>Yangi buyurtma!</b>",
        lines: {
          "🆔 Lid": leadId,
          "👤 Ism": cleanName,
          "📞 Telefon": formatPhoneDigits(digits),
          "📍 Manzil": cleanAddress,
          "💬 Izoh": cleanComment,
          "🛍 Mahsulotlar": "\n" + productsText,
          "💰 Jami": `${formatPrice(total)} (${count} dona)`,
          "🧭 Manba": source === "buy-now" ? "Hozir sotib olish" : "Savat",
          "🕒 Vaqt": time,
          "🔗 UTM": utmToText(utm),
          "📊 Meta": signals.fbc ? "reklamadan (fbc bor)" : signals.fbp ? "pixel (fbp bor)" : "",
        },
        baseUrl: siteUrl(req),
        payload: {
          v: 1,
          lid: leadId,
          t: Math.floor(Date.now() / 1000),
          src: "order",
          url,
          ud: userData,
          label: `${cleanName.split(/\s+/)[0]} · ••${digits.slice(-2)}`,
          total,
          items: lines.map((l) => ({ id: l.product.sku, q: l.qty, p: l.product.price })),
        },
      }),
      sendCapi({
        eventName: "Lead",
        eventId: String(eventId ?? leadId),
        eventSourceUrl: url,
        userData,
        customData: {
          content_name: "Buyurtma (to'lanmagan)",
          lead_id: leadId,
          currency: "UZS",
          value: 0,
          content_type: "product",
          content_ids: lines.map((l) => l.product.sku),
          num_items: count,
        },
      }),
    ]);

    if (capi.status === "rejected") console.error("CAPI:", capi.reason);
    if (tg.status === "rejected") {
      console.error(tg.reason);
      return NextResponse.json({ error: "Buyurtmani yuborib bo'lmadi, qayta urinib ko'ring" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, total, leadId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
