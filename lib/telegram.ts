export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type InlineButton = { text: string; url: string };

async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN sozlanmagan");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(`Telegram ${method} xatosi: ${json.description ?? res.status}`);
  return json.result as T;
}

export function chatId() {
  const id = process.env.TELEGRAM_CHAT_ID;
  if (!id) throw new Error("TELEGRAM_CHAT_ID sozlanmagan");
  return id;
}

export function buildText(lines: Record<string, string>, title: string) {
  return (
    title +
    "\n\n" +
    Object.entries(lines)
      .filter(([, v]) => v)
      .map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v)}`)
      .join("\n")
  );
}

export async function sendTelegram(lines: Record<string, string>, title = "🛍 <b>Yangi ariza!</b>") {
  const msg = await tg<{ message_id: number; chat: { id: number } }>("sendMessage", {
    chat_id: chatId(),
    text: buildText(lines, title),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  return { chatId: String(msg.chat.id), messageId: msg.message_id };
}

export async function setButtons(chat: string, messageId: number, rows: InlineButton[][]) {
  return tg("editMessageReplyMarkup", {
    chat_id: chat,
    message_id: messageId,
    reply_markup: { inline_keyboard: rows },
  });
}

export async function removeButtons(chat: string, messageId: number) {
  return tg("editMessageReplyMarkup", {
    chat_id: chat,
    message_id: messageId,
    reply_markup: { inline_keyboard: [] },
  });
}

export async function replyTo(chat: string, messageId: number | undefined, html: string) {
  return tg("sendMessage", {
    chat_id: chat,
    text: html,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(messageId ? { reply_parameters: { message_id: messageId, allow_sending_without_reply: true } } : {}),
  });
}
