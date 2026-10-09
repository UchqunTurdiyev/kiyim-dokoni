const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function sendTelegram(lines: Record<string, string>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan");

  const text =
    "🛍 <b>Yangi ariza!</b>\n\n" +
    Object.entries(lines)
      .filter(([, v]) => v)
      .map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v)}`)
      .join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!res.ok) throw new Error(`Telegram xatosi: ${await res.text()}`);
}
