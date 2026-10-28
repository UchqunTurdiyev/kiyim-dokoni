// amoCRM integratsiya: saytdan tushgan har bir lid amoCRM'da Sdelka + Kontakt + Izoh bo'lib ochiladi.
// Avtorizatsiya: "Долгосрочный токен" (amoCRM > Sozlamalar > Integratsiyalar > Xususiy integratsiya > Kalitlar va dostuplar).
// AMO_DOMAIN yoki AMO_ACCESS_TOKEN bo'sh bo'lsa — integratsiya o'chiq, sayt odatdagidek ishlayveradi.

type AmoLeadInput = {
  leadId: string; // saytdagi lid ID (Telegram xabaridagi bilan bir xil)
  name: string;
  phoneDigits: string; // 998XXXXXXXXX
  address?: string;
  comment?: string;
  source: "lead" | "order";
  price?: number;
  productsText?: string;
  utm?: Record<string, string>;
  pageUrl?: string;
  metaSource?: string;
};

const TIMEOUT_MS = 8000;

export function amoEnabled() {
  return Boolean(process.env.AMO_DOMAIN && process.env.AMO_ACCESS_TOKEN);
}

function baseUrl() {
  const d = String(process.env.AMO_DOMAIN ?? "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  return `https://${d}`;
}

async function amo<T = any>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${process.env.AMO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (res.status === 204) return null; // topilmadi / bo'sh javob
    const text = await res.text();
    if (!res.ok) throw new Error(`amoCRM ${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
    return text ? (JSON.parse(text) as T) : null;
  } finally {
    clearTimeout(timer);
  }
}

const num = (v: string | undefined) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

// Telefon bo'yicha mavjud kontaktni topish (dublikat kontakt ochilmasligi uchun)
async function findContactByPhone(phoneDigits: string): Promise<number | undefined> {
  const last9 = phoneDigits.slice(-9);
  const data = await amo<any>("GET", `/api/v4/contacts?query=${encodeURIComponent(last9)}&limit=10`);
  const contacts: any[] = data?._embedded?.contacts ?? [];
  for (const c of contacts) {
    const phones: string[] = (c.custom_fields_values ?? [])
      .filter((f: any) => f.field_code === "PHONE")
      .flatMap((f: any) => (f.values ?? []).map((v: any) => String(v.value ?? "").replace(/\D/g, "")));
    if (phones.some((p) => p.endsWith(last9))) return c.id as number;
  }
  return undefined;
}

function buildNote(i: AmoLeadInput) {
  const utmText = i.utm
    ? Object.entries(i.utm)
        .map(([k, v]) => `${k}: ${String(v).slice(0, 150)}`)
        .join("\n")
    : "";
  return [
    i.source === "order" ? "🛒 Saytdan buyurtma" : "🛍 Saytdan ariza",
    `Lid ID: ${i.leadId}`,
    `Ism: ${i.name}`,
    `Telefon: +${i.phoneDigits}`,
    i.address && `Manzil: ${i.address}`,
    i.comment && `Izoh: ${i.comment}`,
    i.productsText && `\nMahsulotlar:\n${i.productsText}`,
    i.price ? `\nJami: ${i.price.toLocaleString("ru-RU")} so'm` : "",
    i.metaSource && `\nMeta: ${i.metaSource}`,
    utmText && `\nUTM:\n${utmText}`,
    i.pageUrl && `\nSahifa: ${i.pageUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function createAmoLead(i: AmoLeadInput): Promise<{ leadId: number; contactId?: number; url: string } | null> {
  if (!amoEnabled()) return null;

  const pipelineId = num(process.env.AMO_PIPELINE_ID);
  const statusId = num(process.env.AMO_STATUS_ID);
  const responsibleUserId = num(process.env.AMO_RESPONSIBLE_USER_ID);

  const tags = [
    { name: "sayt" },
    { name: i.source === "order" ? "buyurtma" : "ariza" },
    ...(i.utm?.utm_source ? [{ name: String(i.utm.utm_source).slice(0, 50) }] : []),
  ];

  const leadBase = {
    name: `${i.source === "order" ? "Buyurtma" : "Ariza"} — ${i.name} (${i.leadId})`,
    ...(i.price ? { price: Math.round(i.price) } : {}),
    ...(pipelineId ? { pipeline_id: pipelineId } : {}),
    ...(statusId ? { status_id: statusId } : {}),
    ...(responsibleUserId ? { responsible_user_id: responsibleUserId } : {}),
  };

  // Kontakt allaqachon bormi? Bo'lsa — yangi sdelkani shu kontaktga bog'laymiz
  let contactId: number | undefined;
  try {
    contactId = await findContactByPhone(i.phoneDigits);
  } catch (e) {
    console.error("amoCRM kontakt qidiruv xatosi:", e);
  }

  let amoLeadId: number;
  if (contactId) {
    const res = await amo<any>("POST", "/api/v4/leads", [
      { ...leadBase, _embedded: { tags, contacts: [{ id: contactId }] } },
    ]);
    amoLeadId = res?._embedded?.leads?.[0]?.id;
  } else {
    const res = await amo<any[]>("POST", "/api/v4/leads/complex", [
      {
        ...leadBase,
        _embedded: {
          tags,
          contacts: [
            {
              first_name: i.name,
              ...(responsibleUserId ? { responsible_user_id: responsibleUserId } : {}),
              custom_fields_values: [
                { field_code: "PHONE", values: [{ value: `+${i.phoneDigits}`, enum_code: "MOB" }] },
              ],
            },
          ],
        },
      },
    ]);
    amoLeadId = res?.[0]?.id;
    contactId = res?.[0]?.contact_id;
  }

  if (!amoLeadId) throw new Error("amoCRM sdelka ID qaytmadi");

  // Barcha tafsilotlar (manzil, mahsulotlar, UTM) — sdelkaga izoh sifatida
  try {
    await amo("POST", `/api/v4/leads/${amoLeadId}/notes`, [
      { note_type: "common", params: { text: buildNote(i) } },
    ]);
  } catch (e) {
    console.error("amoCRM izoh xatosi:", e);
  }

  return { leadId: amoLeadId, contactId, url: `${baseUrl()}/leads/detail/${amoLeadId}` };
}
