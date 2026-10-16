import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendCapi } from "@/lib/capi";
import { decodeLeadToken } from "@/lib/leadToken";
import { esc, removeButtons, replyTo } from "@/lib/telegram";
import { formatPrice } from "@/lib/products";
import { siteUrl } from "@/lib/request";

export const runtime = "nodejs";

// SALES_PIN o'rnatilmagan bo'lsa PIN so'ralmaydi (link baribir shifrlangan va faqat yopiq Telegram guruhda)
function pinOk(pin: string) {
  const expected = process.env.SALES_PIN;
  if (!expected) return true;
  const a = crypto.createHash("sha256").update(pin).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const { token, value, pin, seller, note } = await req.json();

    if (!pinOk(String(pin ?? ""))) {
      await new Promise((r) => setTimeout(r, 1200)); // PIN tanlashni sekinlashtirish
      return NextResponse.json({ error: "PIN noto'g'ri" }, { status: 401 });
    }

    let lead;
    try {
      lead = decodeLeadToken(String(token ?? ""));
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Token noto'g'ri" }, { status: 400 });
    }

    const amount = Math.round(Number(String(value ?? "").replace(/[^\d.]/g, "")));
    if (!Number.isFinite(amount) || amount < 1000 || amount > 1_000_000_000) {
      return NextResponse.json({ error: "Summani to'g'ri kiriting (so'mda)" }, { status: 400 });
    }

    const sellerName = String(seller ?? "").trim().slice(0, 40);
    const cleanNote = String(note ?? "").trim().slice(0, 200);
    const actionSource = process.env.META_PURCHASE_ACTION_SOURCE || "website";

    // event_id lidga bog'langan — tugma 2 marta bosilsa ham Meta bitta Purchase deb hisoblaydi (dedublikatsiya)
    const eventId = `purchase-${lead.lid}`;

    const result = await sendCapi({
      eventName: "Purchase",
      eventId,
      actionSource,
      eventSourceUrl: lead.url || siteUrl(req),
      userData: lead.ud,
      customData: {
        currency: "UZS",
        value: amount,
        order_id: lead.lid,
        lead_id: lead.lid,
        ...(lead.items?.length
          ? {
              content_type: "product",
              content_ids: lead.items.map((i) => i.id),
              contents: lead.items.map((i) => ({ id: i.id, quantity: i.q, item_price: i.p })),
              num_items: lead.items.reduce((s, i) => s + i.q, 0),
            }
          : {}),
      },
    });

    if ("skipped" in result) {
      return NextResponse.json({ error: "Meta Pixel ID yoki CAPI token sozlanmagan" }, { status: 500 });
    }

    // Telegram: tugmani olib tashlash va "to'landi" deb belgilash
    if (lead.tg) {
      const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
      const text =
        `✅ <b>To'landi — Metaga Purchase yuborildi</b>\n\n` +
        `<b>🆔 Lid:</b> ${esc(lead.lid)}\n` +
        `<b>💰 Summa:</b> ${esc(formatPrice(amount))}\n` +
        (sellerName ? `<b>👨‍💼 Sotuvchi:</b> ${esc(sellerName)}\n` : "") +
        (cleanNote ? `<b>📝 Izoh:</b> ${esc(cleanNote)}\n` : "") +
        `<b>🕒 Vaqt:</b> ${esc(time)}\n` +
        `<b>📊 Meta:</b> qabul qilindi (${result.events_received ?? 1} ta hodisa)`;
      await Promise.allSettled([removeButtons(lead.tg.c, lead.tg.m), replyTo(lead.tg.c, lead.tg.m, text)]);
    }

    return NextResponse.json({ ok: true, leadId: lead.lid, value: amount, eventId, fbtrace: result.fbtrace_id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server xatosi" }, { status: 500 });
  }
}
