"use client";

import { useState } from "react";
import { avgRating, discountPercent, formatPrice, type Product } from "@/lib/products";
import { useStore } from "./StoreProvider";
import { BagIcon, CloseIcon, EyeIcon, HeartIcon, Stars } from "./Icons";

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const { toggleLike, isLiked, openQuickView, addToCart } = useStore();
  const [picker, setPicker] = useState(false);
  const [pop, setPop] = useState(false);
  const liked = isLiked(product.id);
  const rating = avgRating(product);
  const off = discountPercent(product);

  const onLike = () => {
    toggleLike(product.id);
    setPop(true);
    setTimeout(() => setPop(false), 450);
  };

  return (
    <article className="card" style={{ animationDelay: `${Math.min(index, 11) * 55}ms` }}>
      <div className="card-media">
        <img src={product.image} alt={product.name} loading="lazy" draggable={false} />

        <div className="card-badges">
          {product.badge && <span className={`tag tag-${product.badge.toLowerCase()}`}>{product.badge}</span>}
          {off > 0 && <span className="tag tag-off">−{off}%</span>}
        </div>

        <div className="card-tools">
          <button
            type="button"
            className={`tool-btn like${liked ? " is-liked" : ""}${pop ? " pop" : ""}`}
            onClick={onLike}
            aria-label={liked ? "Yoqtirganlardan olib tashlash" : "Yoqtirish"}
            aria-pressed={liked}
          >
            <HeartIcon size={18} filled={liked} />
          </button>
          <button
            type="button"
            className="tool-btn eye"
            onClick={() => openQuickView(product.id)}
            aria-label="Batafsil ko'rish"
          >
            <EyeIcon size={18} />
          </button>
        </div>

        <div className={`size-picker${picker ? " open" : ""}`} aria-hidden={!picker}>
          <div className="size-picker-head">
            <span>O&apos;lchamni tanlang</span>
            <button type="button" onClick={() => setPicker(false)} aria-label="Yopish" tabIndex={picker ? 0 : -1}>
              <CloseIcon size={16} />
            </button>
          </div>
          <div className="size-grid">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                tabIndex={picker ? 0 : -1}
                onClick={() => {
                  addToCart(product.id, s);
                  setPicker(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <Stars value={rating} size={13} />
          <span>({product.reviews.length})</span>
        </div>
        <h3 className="card-title">
          <button type="button" onClick={() => openQuickView(product.id)}>
            {product.name}
          </button>
        </h3>
        <p className="card-sub">
          {product.color} · {product.material}
        </p>
        <div className="card-bottom">
          <div className="price">
            <strong>{formatPrice(product.price)}</strong>
            {product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}
          </div>
          <button type="button" className="add-btn" onClick={() => setPicker(true)} aria-label="Savatga qo'shish">
            <BagIcon size={18} />
            <span>Savatga</span>
          </button>
        </div>
      </div>
    </article>
  );
}
