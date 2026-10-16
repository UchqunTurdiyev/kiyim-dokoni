"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/products";
import { PHONE_PREFIX, formatPhone } from "@/lib/phone";
import { fbqTrack, newEventId } from "@/lib/meta";
import { useStore } from "./StoreProvider";
import { CloseIcon } from "./Icons";

export default function CheckoutModal() {
  const { checkout, closeCheckout, clearCart, closeQuickView, setCartOpen } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!checkout) return;
    setError("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, loading]);

  if (!checkout) return null;

  const total = checkout.lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const count = checkout.lines.reduce((s, l) => s + l.qty, 0);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      closeCheckout();
    }, 250);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkout) return;
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("Ismingizni kiriting");
    if (digits.length !== 12) return setError("Telefon raqamni to'liq kiriting");
    if (address.trim().length < 3) return setError("Manzilingizni kiriting");

    setLoading(true);
    const eventId = newEventId();
    const utm: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v;
    });

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          comment,
          eventId,
          pageUrl: window.location.href,
          utm,
          source: checkout.source,
          items: checkout.lines.map((l) => ({ id: l.product.id, size: l.size, qty: l.qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      // Purchase emas — Lead (to'lov sotuvchi tasdiqlagandan keyin serverdan Purchase ketadi)
      fbqTrack(
        "Lead",
        {
          content_name: "Buyurtma (to'lanmagan)",
          content_ids: checkout.lines.map((l) => l.product.sku),
          content_type: "product",
          num_items: count,
          currency: "UZS",
          value: 0,
        },
        eventId
      );

      if (checkout.source === "cart") clearCart();
      closeCheckout();
      closeQuickView();
      setCartOpen(false);
      router.push("/rahmat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      setLoading(false);
    }
  }

  return (
    <div className={`modal${closing ? " closing" : ""}`} role="dialog" aria-modal="true" aria-label="Buyurtma berish">
      <div className="modal-backdrop" onClick={() => !loading && close()} />
      <div className="modal-panel">
        <button type="button" className="qv-close" onClick={close} aria-label="Yopish" disabled={loading}>
          <CloseIcon size={20} />
        </button>
        <h3>Buyurtmani rasmiylashtirish</h3>
        <p className="form-sub">Ma&apos;lumotlaringizni qoldiring — menejer 15 daqiqada qo&apos;ng&apos;iroq qiladi</p>

        <ul className="summary">
          {checkout.lines.map((l) => (
            <li key={`${l.product.id}-${l.size}`}>
              <img src={l.product.image} alt="" />
              <div>
                <b>{l.product.name}</b>
                <span>
                  O&apos;lcham: {l.size} · {l.qty} dona
                </span>
              </div>
              <strong>{formatPrice(l.product.price * l.qty)}</strong>
            </li>
          ))}
        </ul>
        <div className="total-row">
          <span>Jami ({count} dona):</span>
          <strong>{formatPrice(total)}</strong>
        </div>

        <form className="form flat" onSubmit={onSubmit} noValidate>
          <label>
            <span>Ismingiz</span>
            <input type="text" placeholder="Masalan: Dilnoza" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus />
          </label>
          <label>
            <span>Telefon raqamingiz</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              onFocus={(e) => {
                if (e.target.value.length < PHONE_PREFIX.length) setPhone(PHONE_PREFIX);
              }}
              autoComplete="tel"
            />
          </label>
          <label>
            <span>Manzilingiz</span>
            <input
              type="text"
              placeholder="Shahar, tuman, ko'cha, uy"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />
          </label>
          <label>
            <span>Izoh (ixtiyoriy)</span>
            <input type="text" placeholder="Qo'ng'iroq uchun qulay vaqt va h.k." value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-buy" disabled={loading}>
            {loading ? <span className="spinner" /> : `Buyurtmani tasdiqlash — ${formatPrice(total)}`}
          </button>
          <p className="form-note">🔒 To&apos;lov mahsulotni qo&apos;lingizga olganda amalga oshiriladi</p>
        </form>
      </div>
    </div>
  );
}
