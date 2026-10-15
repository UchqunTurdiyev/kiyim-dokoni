import { NextRequest, NextResponse } from "next/server";
import { sendTelegram } from "@/lib/telegram";
import { sendCapiEvent } from "@/lib/capi";
import { formatPrice, getProduct } from "@/lib/products";

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

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const fbp = req.cookies.get("_fbp")?.value;
    const fbc = req.cookies.get("_fbc")?.value;

    const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
    const formattedPhone = `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
    const utmText =
      utm && typeof utm === "object"
        ? Object.entries(utm as Record<string, string>)
            .map(([k, v]) => `${k}=${v}`)
            .join(", ")
        : "";

    const productsText = lines
      .map(
        (l, i) =>
          `${i + 1}. ${l.product.name} (${l.product.sku})\n` +
          `    O'lcham: ${l.size} · Rang: ${l.product.color}\n` +
          `    ${l.qty} × ${formatPrice(l.product.price)} = ${formatPrice(l.product.price * l.qty)}`
      )
      .join("\n");

    const [tg, capi] = await Promise.allSettled([
      sendTelegram(
        {
          "👤 Ism": cleanName,
          "📞 Telefon": formattedPhone,
          "📍 Manzil": cleanAddress,
          "💬 Izoh": cleanComment,
          "🛍 Mahsulotlar": "\n" + productsText,
          "💰 Jami": `${formatPrice(total)} (${count} dona)`,
          "🧭 Manba": source === "buy-now" ? "Hozir sotib olish" : "Savat",
          "🕒 Vaqt": time,
          "🔗 UTM": utmText,
        },
        "🛒 <b>Yangi buyurtma!</b>"
      ),
      sendCapiEvent({
        eventName: "Purchase",
        eventId: String(eventId ?? ""),
        eventSourceUrl: pageUrl,
        phone: digits,
        firstName: cleanName,
        city: cleanAddress,
        ip,
        userAgent,
        fbp,
        fbc,
        customData: {
          currency: "UZS",
          value: total,
          content_type: "product",
          content_ids: lines.map((l) => l.product.sku),
          contents: lines.map((l) => ({ id: l.product.sku, quantity: l.qty, item_price: l.product.price })),
          num_items: count,
        },
      }),
    ]);

    if (capi.status === "rejected") console.error("CAPI:", capi.reason);
    if (tg.status === "rejected") {
      console.error(tg.reason);
      return NextResponse.json({ error: "Buyurtmani yuborib bo'lmadi, qayta urinib ko'ring" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, total });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
