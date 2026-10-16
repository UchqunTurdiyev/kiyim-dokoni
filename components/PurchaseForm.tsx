"use client";

import { useEffect, useState } from "react";

const fmt = (raw: string) => raw.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function load(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
function save(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* private rejim */
  }
}

export default function PurchaseForm({
  token,
  defaultValue,
  pinRequired = true,
}: {
  token: string;
  defaultValue?: number;
  pinRequired?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ? fmt(String(defaultValue)) : "");
  const [seller, setSeller] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ value: number; leadId: string } | null>(null);

  useEffect(() => {
    setSeller(load("sales_name"));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amount = Number(value.replace(/\D/g, ""));
    if (amount < 1000) return setError("To'langan summani kiriting");
    if (pinRequired && !pin) return setError("PIN kodni kiriting");
    if (!confirm(`${fmt(String(amount))} so'm to'lov Metaga Purchase sifatida yuborilsinmi?`)) return;

    setLoading(true);
    save("sales_name", seller.trim());
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, value: amount, pin, seller, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");
      setDone({ value: data.value, leadId: data.leadId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="sale-done">
        <div className="sale-done-icon">✅</div>
        <h2>Metaga yuborildi</h2>
        <p>
          {done.leadId} — <b>{fmt(String(done.value))} so&apos;m</b> Purchase sifatida qabul qilindi. Telegramdagi xabar
          &quot;To&apos;landi&quot; deb belgilandi.
        </p>
        <p className="sale-muted">Bu sahifani yopishingiz mumkin.</p>
      </div>
    );
  }

  return (
    <form className="form flat sale-form" onSubmit={onSubmit} noValidate>
      <label>
        <span>To&apos;langan summa (so&apos;m)</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Masalan: 489 000"
          value={value}
          onChange={(e) => setValue(fmt(e.target.value))}
          autoFocus
        />
      </label>
      <label>
        <span>Sotuvchi ismi</span>
        <input type="text" placeholder="Masalan: Aziza" value={seller} onChange={(e) => setSeller(e.target.value)} />
      </label>
      <label>
        <span>Izoh (ixtiyoriy)</span>
        <input type="text" placeholder="Naqd / karta, qo'shimcha mahsulot..." value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {pinRequired && (
      <label>
        <span>Sotuv PIN kodi</span>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      </label>
      )}

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? <span className="spinner" /> : "💰 To'lovni tasdiqlash va Metaga yuborish"}
      </button>
      <p className="form-note">Bir lid uchun bir marta bosing. Qayta bosilsa ham Meta uni dublikat sifatida hisoblamaydi.</p>
    </form>
  );
}
