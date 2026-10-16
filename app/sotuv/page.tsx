import type { Metadata } from "next";
import { decodeLeadToken } from "@/lib/leadToken";
import { formatPrice } from "@/lib/products";
import PurchaseForm from "@/components/PurchaseForm";
import "./sotuv.css";

export const metadata: Metadata = {
  title: "Sotuvni tasdiqlash",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SotuvPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "" } = await searchParams;

  let lead: ReturnType<typeof decodeLeadToken> | null = null;
  let error = "";
  try {
    lead = decodeLeadToken(t);
  } catch (e) {
    error = e instanceof Error ? e.message : "Link noto'g'ri";
  }

  if (!lead) {
    return (
      <main className="sale">
        <div className="sale-card">
          <h1>⚠️ Link ishlamaydi</h1>
          <p className="sale-muted">{error}</p>
        </div>
      </main>
    );
  }

  const date = new Date(lead.t * 1000).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const ud = lead.ud;
  const signals = [
    { k: "Telefon (hesh)", ok: !!ud.ph },
    { k: "Ism (hesh)", ok: !!ud.fn },
    { k: "Shahar (hesh)", ok: !!ud.ct },
    { k: "external_id (hesh)", ok: !!ud.external_id },
    { k: "_fbc (reklama kliki)", ok: !!ud.fbc },
    { k: "_fbp (pixel cookie)", ok: !!ud.fbp },
    { k: "IP + brauzer", ok: !!ud.client_ip_address && !!ud.client_user_agent },
  ];

  return (
    <main className="sale">
      <div className="sale-card">
        <span className="sale-tag">{lead.src === "order" ? "🛒 Buyurtma" : "🛍 Ariza"}</span>
        <h1>{lead.lid}</h1>
        <p className="sale-muted">
          {lead.label} · {date}
        </p>

        {lead.items?.length ? (
          <ul className="sale-items">
            {lead.items.map((i) => (
              <li key={i.id}>
                <span>
                  {i.id} × {i.q}
                </span>
                <b>{formatPrice(i.p * i.q)}</b>
              </li>
            ))}
            <li className="sale-total">
              <span>Buyurtma summasi</span>
              <b>{formatPrice(lead.total ?? 0)}</b>
            </li>
          </ul>
        ) : null}

        <div className="sale-signals">
          <p>Metaga ketadigan ma&apos;lumotlar (shifrlangan link ichida):</p>
          <ul>
            {signals.map((s) => (
              <li key={s.k} className={s.ok ? "ok" : "no"}>
                {s.ok ? "✓" : "—"} {s.k}
              </li>
            ))}
          </ul>
        </div>

        <PurchaseForm token={t} defaultValue={lead.total} pinRequired={!!process.env.SALES_PIN} />
      </div>
    </main>
  );
}
