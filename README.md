# Kiyim do'koni — sotuv sayti (Next.js App Router)

- Bosh sahifa: asosiy taklif (hero) + ariza formasi (ism, telefon, manzil)
- "Yuborish" → ma'lumotlar Telegram botga keladi → mijoz `/rahmat` sahifasiga o'tadi → 10 soniyalik animatsiyadan so'ng Telegram kanalga yo'naltiriladi
- Meta Pixel (PageView, Lead) + Conversions API (Lead, bir xil `event_id` bilan dedublikatsiya)

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

Matnlar (do'kon nomi, taklif) — `lib/site.ts` faylida.

## Vercel'ga joylash

Repo'ni Vercel'ga import qiling va yuqoridagi env o'zgaruvchilarni qo'shing.
