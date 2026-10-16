# Kiyim do'koni — sotuv sayti (Next.js App Router)

- Bosh sahifa: asosiy taklif (hero) + ariza formasi (ism, telefon, manzil)
- "Yuborish" → ma'lumotlar Telegram botga keladi → mijoz `/rahmat` sahifasiga o'tadi → 10 soniyalik animatsiyadan so'ng Telegram kanalga yo'naltiriladi
- Meta Pixel (PageView, Lead) + Conversions API (Lead, bir xil `event_id` bilan dedublikatsiya)
- **Sotuvdan keyin Purchase (ROAS):** har bir lid Telegramga **"💰 To'lov qildi"** tugmasi bilan keladi

## Purchase / ROAS oqimi

```
Mijoz forma to'ldiradi ─► /api/lead yoki /api/order
   │  ├─ CAPI: Lead (heshlangan telefon/ism/shahar + fbp/fbc/IP/UA)
   │  └─ Telegram: lid xabari + [💰 To'lov qildi] tugmasi
   │        link = /sotuv?t=<TOKEN>
   │        TOKEN = AES-256-GCM( SHA-256 heshlar + fbp + fbc + IP + UA + buyurtma + lid ID )
   ▼
Sotuvchi mijoz bilan gaplashadi, to'lov bo'ladi ─► tugmani bosadi
   ▼
/sotuv sahifasi: summa + sotuvchi ismi + PIN ─► /api/purchase
   ├─ CAPI: Purchase { value, currency: UZS, order_id }  ← Meta ROAS va value optimizatsiya
   └─ Telegram: tugma o'chadi, "✅ To'landi — 489 000 so'm" javobi
```

- Shaxsiy ma'lumotlar linkda **ochiq ko'rinmaydi**: Meta talabi bo'yicha SHA-256 bilan heshlangan, butun paket esa `LEAD_TOKEN_SECRET` kaliti bilan shifrlangan. Kalitsiz linkni o'qib ham, o'zgartirib ham bo'lmaydi.
- Link tarqalib ketsa ham `SALES_PIN`siz Purchase yuborilmaydi.
- `event_id = purchase-<lid ID>` — tugma ikki marta bosilsa ham Meta bitta xarid deb hisoblaydi.
- Buyurtma formasi (savat) endi **Purchase emas, Lead** yuboradi — Purchase faqat haqiqiy to'lovdan keyin ketadi, shuning uchun ROAS to'g'ri chiqadi.
- `/sotuv` sahifasida Meta Pixel ishlamaydi (sotuvchi brauzeri mijoz deb hisoblanmaydi).

### Metada sozlash
1. Events Manager → pixel → **Test events**: `META_TEST_EVENT_CODE` bilan sinab ko'ring, keyin bo'shating.
2. Reklama kampaniyasi: maqsad **Sales**, konversiya hodisasi **Purchase**; yetarli xarid yig'ilgach **Highest value / ROAS goal**.
3. Ads Manager ustunlariga **Purchase ROAS** va **Purchases conversion value** qo'shing.
4. Auditoriyalar: **Custom Audience → Website → Purchase** (180 kun) → undan **Lookalike 1–3%**.
5. Hodisa vaqti: `website` manbasi uchun Purchase lid tushganidan keyin **7 kun ichida** yuborilishi kerak.

## Ishga tushirish

```bash
npm install
cp .env.example .env.local   # qiymatlarni to'ldiring
npm run dev
```

## Sozlamalar (.env)

| O'zgaruvchi | Izoh |
|---|---|
| `TELEGRAM_BOT_TOKEN` | @BotFather dan olingan bot token |
| `TELEGRAM_CHAT_ID` | Arizalar keladigan chat/guruh ID (botni guruhga admin qiling) |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL_URL` | Rahmat sahifasidan keyin o'tiladigan kanal |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID |
| `META_CAPI_ACCESS_TOKEN` | Events Manager > Settings > Conversions API token |
| `META_TEST_EVENT_CODE` | Faqat test uchun (ishga tushganda bo'sh qoldiring) |
| `NEXT_PUBLIC_SITE_URL` | Saytning HTTPS manzili (tugmadagi link uchun; Telegram localhost linkni qabul qilmaydi) |
| `LEAD_TOKEN_SECRET` | Linkni shifrlash kaliti, kamida 32 belgi (`openssl rand -hex 32`) |
| `LEAD_TOKEN_TTL_DAYS` | Link amal qilish muddati, kun (standart 30) |
| `SALES_PIN` | Sotuvchilar to'lovni tasdiqlashda kiritadigan PIN |
| `META_PURCHASE_ACTION_SOURCE` | `website` (standart) yoki `phone_call` / `system_generated` |

Matnlar (do'kon nomi, taklif) — `lib/site.ts` faylida.

## Vercel'ga joylash

Repo'ni Vercel'ga import qiling va yuqoridagi env o'zgaruvchilarni qo'shing.
