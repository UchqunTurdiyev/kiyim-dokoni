"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, GENDERS, avgRating, discountPercent, formatPrice, getProduct } from "@/lib/products";
import { useStore } from "./StoreProvider";
import { BagIcon, CheckIcon, CloseIcon, HeartIcon, RefreshIcon, ShieldIcon, Stars, TruckIcon } from "./Icons";

export default function QuickView() {
  const { quickViewId, closeQuickView } = useStore();
  const [closing, setClosing] = useState(false);
  const product = quickViewId ? getProduct(quickViewId) : undefined;

  const close = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      closeQuickView();
    }, 280);
  };

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!product) return null;
  return <QuickViewInner key={product.id} productId={product.id} closing={closing} onClose={close} />;
}

function QuickViewInner({ productId, closing, onClose }: { productId: string; closing: boolean; onClose: () => void }) {
  const product = getProduct(productId)!;
  const { addToCart, toggleLike, isLiked, startCheckout } = useStore();
  const [size, setSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [tab, setTab] = useState<"info" | "reviews">("info");
  const scrollRef = useRef<HTMLDivElement>(null);

  const liked = isLiked(product.id);
  const rating = avgRating(product);
  const off = discountPercent(product);
  const catLabel = CATEGORIES.find((c) => c.value === product.category)?.label;
  const genderLabel = GENDERS.find((g) => g.value === product.gender)?.label;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const n = product.reviews.filter((r) => r.rating === star).length;
    return { star, n, pct: product.reviews.length ? (n / product.reviews.length) * 100 : 0 };
  });

  const needSize = () => {
    if (size) return false;
    setSizeError(true);
    setTimeout(() => setSizeError(false), 700);
    return true;
  };

  const onAdd = () => {
    if (needSize()) return;
    addToCart(product.id, size!, qty);
  };

  const onBuy = () => {
    if (needSize()) return;
    startCheckout([{ product, size: size!, qty }], "buy-now");
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const goReviews = () => {
    setTab("reviews");
    setTimeout(() => document.getElementById("qv-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className={`qv${closing ? " closing" : ""}`} role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="qv-backdrop" onClick={onClose} />
      <div className="qv-panel" ref={scrollRef}>
        <button type="button" className="qv-close" onClick={onClose} aria-label="Yopish">
          <CloseIcon size={22} />
        </button>

        <div className="qv-grid">
          <div className="qv-media" onMouseMove={onMove} onMouseLeave={() => setZoom(null)}>
            <img
              src={product.image}
              alt={product.name}
              style={
                zoom
                  ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
            <div className="card-badges">
              {product.badge && <span className={`tag tag-${product.badge.toLowerCase()}`}>{product.badge}</span>}
              {off > 0 && <span className="tag tag-off">−{off}%</span>}
            </div>
            <span className="qv-zoom-hint">Kattalashtirish uchun sichqonchani olib boring</span>
          </div>

          <div className="qv-info">
            <div className="qv-crumbs">
              {catLabel} · {genderLabel} · <span>Artikul: {product.sku}</span>
            </div>
            <h2>{product.name}</h2>
            <button type="button" className="qv-rating" onClick={goReviews}>
              <Stars value={rating} size={16} />
              <b>{rating.toFixed(1)}</b>
              <span>{product.reviews.length} ta otziv</span>
            </button>

            <div className="qv-price">
              <strong>{formatPrice(product.price)}</strong>
              {product.oldPrice && (
                <>
                  <s>{formatPrice(product.oldPrice)}</s>
                  <span className="save">Tejaysiz: {formatPrice(product.oldPrice - product.price)}</span>
                </>
              )}
            </div>

            <p className="qv-desc">{product.description}</p>

            <div className="qv-row">
              <span className="qv-label">
                Rang: <b>{product.color}</b>
              </span>
            </div>

            <div className={`qv-sizes${sizeError ? " shake" : ""}`}>
              <div className="qv-label">
                O&apos;lcham: <b>{size ?? "tanlanmagan"}</b>
              </div>
              <div className="size-filter">
                {product.sizes.map((s) => (
                  <button key={s} type="button" className={size === s ? "active" : ""} onClick={() => setSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && <p className="form-error">Iltimos, o&apos;lchamni tanlang</p>}
            </div>

            <div className="qv-actions">
              <div className="qty">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kamaytirish">
                  −
                </button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Ko'paytirish">
                  +
                </button>
              </div>
              <button type="button" className="btn btn-outline" onClick={onAdd}>
                <BagIcon size={18} /> Savatga
              </button>
              <button
                type="button"
                className={`tool-btn like big${liked ? " is-liked" : ""}`}
                onClick={() => toggleLike(product.id)}
                aria-label="Yoqtirish"
                aria-pressed={liked}
              >
                <HeartIcon size={20} filled={liked} />
              </button>
            </div>
            <button type="button" className="btn btn-buy" onClick={onBuy}>
              Hozir sotib olish — {formatPrice(product.price * qty)}
            </button>

            <ul className="qv-perks">
              <li>
                <TruckIcon size={18} /> 1–3 kunda butun O&apos;zbekiston bo&apos;ylab yetkazib berish
              </li>
              <li>
                <ShieldIcon size={18} /> Kiyib ko&apos;rib, keyin to&apos;lash
              </li>
              <li>
                <RefreshIcon size={18} /> 14 kun ichida almashtirish
              </li>
            </ul>
          </div>
        </div>

        <div className="qv-tabs" id="qv-tabs">
          <div className="tabs-head" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "info"} className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>
              Mahsulot haqida
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "reviews"}
              className={tab === "reviews" ? "active" : ""}
              onClick={() => setTab("reviews")}
            >
              Otzivlar ({product.reviews.length})
            </button>
          </div>

          {tab === "info" ? (
            <div className="tab-body fade-in" key="info">
              <ul className="features">
                {product.features.map((f) => (
                  <li key={f}>
                    <CheckIcon size={16} /> {f}
                  </li>
                ))}
              </ul>
              <dl className="specs">
                <div>
                  <dt>Kategoriya</dt>
                  <dd>{catLabel}</dd>
                </div>
                <div>
                  <dt>Kim uchun</dt>
                  <dd>{genderLabel}</dd>
                </div>
                <div>
                  <dt>Material</dt>
                  <dd>{product.material}</dd>
                </div>
                <div>
                  <dt>Rang</dt>
                  <dd>{product.color}</dd>
                </div>
                <div>
                  <dt>O&apos;lchamlar</dt>
                  <dd>
                    {product.sizes[0]}–{product.sizes[product.sizes.length - 1]}
                  </dd>
                </div>
                <div>
                  <dt>Artikul</dt>
                  <dd>{product.sku}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="tab-body fade-in" key="reviews">
              <div className="reviews-summary">
                <div className="big-rating">
                  <strong>{rating.toFixed(1)}</strong>
                  <Stars value={rating} size={18} />
                  <span>{product.reviews.length} ta baho</span>
                </div>
                <div className="bars">
                  {breakdown.map((b) => (
                    <div key={b.star} className="bar-row">
                      <span>{b.star}★</span>
                      <div className="bar">
                        <i style={{ width: `${b.pct}%` }} />
                      </div>
                      <span>{b.n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ul className="reviews">
                {product.reviews.map((r, i) => (
                  <li key={i} className="review" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="avatar">{r.name[0]}</div>
                    <div>
                      <div className="review-head">
                        <b>{r.name}</b>
                        <span>
                          {r.city} · {r.date.split("-").reverse().join(".")}
                        </span>
                      </div>
                      <Stars value={r.rating} size={13} />
                      <p>{r.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
