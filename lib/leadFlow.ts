// Lid tushganda: Telegramga xabar + "💰 To'lov qildi" tugmasi (ichida shifrlangan/heshlangan link)
import { encodeLeadToken, type LeadTokenPayload } from "./leadToken";
import { replyTo, sendTelegram, setButtons } from "./telegram";

export async function notifyLeadWithButton(opts: {
  lines: Record<string, string>;
  title: string;
  baseUrl: string;
  payload: Omit<LeadTokenPayload, "tg">;
}) {
  // 1) Xabar yuboriladi (message_id kerak — keyin "to'landi" deb belgilash uchun)
  const { chatId, messageId } = await sendTelegram(opts.lines, opts.title);

  // 2) Token: heshlangan user_data + fbp/fbc/ip/UA + buyurtma + Telegram xabar ID — hammasi AES-256-GCM bilan shifrlangan
  // Lid allaqachon Telegramga tushdi — tugma yasashda xato bo'lsa ham ariza muvaffaqiyatli hisoblanadi
  let link = "";
  try {
    const token = encodeLeadToken({ ...opts.payload, tg: { c: chatId, m: messageId } });
    link = `${opts.baseUrl}/sotuv?t=${token}`;
  } catch (e) {
    console.error("Token yasalmadi:", e);
    await replyTo(chatId, messageId, `⚠️ To'lov tugmasi yasalmadi: ${e instanceof Error ? e.message : "xato"}`).catch(console.error);
    return { chatId, messageId, link };
  }

  // 3) Xabarga tugma qo'shiladi
  try {
    await setButtons(chatId, messageId, [[{ text: "💰 To'lov qildi — Metaga yuborish", url: link }]]);
  } catch (e) {
    // Telegram localhost / http linkni tugmaga qo'ymaydi — shunda link oddiy matn bo'lib boradi
    console.error("Tugma qo'yilmadi:", e);
    await replyTo(chatId, messageId, `💰 To'lov bo'lsa, shu linkni oching:\n${link}`).catch(console.error);
  }
  return { chatId, messageId, link };
}
