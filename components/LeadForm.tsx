"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fbqTrack, newEventId } from "@/lib/meta";

const PREFIX = "+998 ";

function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return PREFIX + p.join(" ");
}

export default function LeadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(PREFIX);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("Ismingizni kiriting");
    if (digits.length !== 12) return setError("Telefon raqamni to'liq kiriting");
    if (address.trim().length < 3) return setError("Manzilingizni kiriting");

    setLoading(true);
    const eventId = newEventId();
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v;
    });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, eventId, pageUrl: window.location.href, utm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      // Pixel Lead — CAPI bilan bir xil eventID (dublikat bo'lmasligi uchun)
      fbqTrack("Lead", { content_name: "Kiyim do'koni ariza" }, eventId);
      router.push("/rahmat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <h2>Buyurtma uchun ariza qoldiring</h2>
      <p className="form-sub">Menejerimiz 15 daqiqa ichida siz bilan bog&apos;lanadi</p>

      <label>
        <span>Ismingiz</span>
        <input
          type="text"
          placeholder="Masalan: Dilnoza"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </label>

      <label>
        <span>Telefon raqamingiz</span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          onFocus={(e) => {
            if (e.target.value.length < PREFIX.length) setPhone(PREFIX);
          }}
          autoComplete="tel"
        />
      </label>

      <label>
        <span>Manzilingiz</span>
        <input
          type="text"
          placeholder="Shahar, tuman, ko'cha"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="street-address"
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? <span className="spinner" /> : "Yuborish"}
      </button>
      <p className="form-note">🔒 Ma&apos;lumotlaringiz uchinchi shaxslarga berilmaydi</p>
    </form>
  );
}
