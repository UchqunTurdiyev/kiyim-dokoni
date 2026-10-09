"use client";

import { useEffect, useState } from "react";

const SECONDS = 10;
const CHANNEL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me/";

export default function ThankYou() {
  const [left, setLeft] = useState(SECONDS);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      const remaining = SECONDS - Math.floor((Date.now() - started) / 1000);
      if (remaining <= 0) {
        clearInterval(timer);
        setLeft(0);
        window.location.href = CHANNEL;
      } else {
        setLeft(remaining);
      }
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <div className="thanks-card">
      <div className="check">
        <svg viewBox="0 0 52 52" aria-hidden>
          <circle cx="26" cy="26" r="24" />
          <path d="M14 27 l8 8 l16 -17" />
        </svg>
      </div>
      <h1>Rahmat! Arizangiz qabul qilindi</h1>
      <p>Menejerimiz tez orada siz bilan bog&apos;lanadi. Shu vaqtgacha Telegram kanalimizdagi yangi kolleksiya bilan tanishing.</p>

      <div className="ring">
        <svg viewBox="0 0 120 120" aria-hidden>
          <circle className="ring-bg" cx="60" cy="60" r={R} />
          <circle
            className="ring-fg"
            cx="60"
            cy="60"
            r={R}
            strokeDasharray={C}
            style={{ animationDuration: `${SECONDS}s`, ["--c" as string]: C }}
          />
        </svg>
        <span>{left}</span>
      </div>
      <p className="muted">{left} soniyadan so&apos;ng Telegram kanalga o&apos;tasiz</p>

      <a className="btn tg" href={CHANNEL}>
        Hozir kanalga o&apos;tish
      </a>
    </div>
  );
}
