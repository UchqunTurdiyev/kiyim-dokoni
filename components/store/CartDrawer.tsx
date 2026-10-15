"use client";

import { useEffect } from "react";
import { formatPrice, getProduct } from "@/lib/products";
import { useStore, type CheckoutLine } from "./StoreProvider";
import { BagIcon, CloseIcon, TrashIcon } from "./Icons";

const FREE_DELIVERY = 500000;

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartTotal, cartCount, updateQty, updateSize, removeFromCart, startCheckout } =
    useStore();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  const left = Math.max(0, FREE_DELIVERY - cartTotal);
  const progress = Math.min(100, (cartTotal / FREE_DELIVERY) * 100);

  const checkout = () => {
    const lines: CheckoutLine[] = cart
      .map((i) => ({ product: getProduct(i.productId)!, size: i.size, qty: i.qty }))
      .filter((l) => l.product);
    if (lines.length) startCheckout(lines, "cart");
  };

  return (
    <div className={`drawer${cartOpen ? " open" : ""}`} aria-hidden={!cartOpen}>
      <div className="drawer-backdrop" onClick={() => setCartOpen(false)} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label="Savat">
        <div className="drawer-head">
          <h3>
            Savat <span>{cartCount} ta</span>
          </h3>
          <button type="button" className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Yopish">
            <CloseIcon size={22} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="drawer-empty">
            <div className="empty-icon">
              <BagIcon size={36} />
            </div>
            <h4>Savatingiz bo&apos;sh</h4>
            <p>Katalogdan yoqqan juftlikni tanlang</p>
            <a
              href="#katalog"
              className="btn btn-sm"
              onClick={() => setCartOpen(false)}
            >
              Katalogga o&apos;tish
            </a>
          </div>
        ) : (
          <>
            <div className="delivery-progress">
              <p>
                {left > 0 ? (
                  <>
                    Bepul yetkazib berishgacha <b>{formatPrice(left)}</b> qoldi
                  </>
                ) : (
                  <b>🎉 Sizga bepul yetkazib beramiz!</b>
                )}
              </p>
              <div className="bar">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="cart-list">
              {cart.map((item, i) => {
                const p = getProduct(item.productId);
                if (!p) return null;
                return (
                  <li key={item.key} className="cart-item" style={{ animationDelay: `${i * 50}ms` }}>
                    <img src={p.image} alt={p.name} />
                    <div className="cart-item-body">
                      <div className="cart-item-top">
                        <b>{p.name}</b>
                        <button type="button" className="icon-btn sm" onClick={() => removeFromCart(item.key)} aria-label="O'chirish">
                          <TrashIcon size={17} />
                        </button>
                      </div>
                      <span className="muted-sm">
                        {p.color} · {p.sku}
                      </span>
                      <div className="cart-item-controls">
                        <label className="mini-select">
                          O&apos;lcham
                          <select value={item.size} onChange={(e) => updateSize(item.key, Number(e.target.value))}>
                            {p.sizes.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="qty sm">
                          <button type="button" onClick={() => updateQty(item.key, item.qty - 1)} aria-label="Kamaytirish">
                            −
                          </button>
                          <span>{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.key, item.qty + 1)} aria-label="Ko'paytirish">
                            +
                          </button>
                        </div>
                      </div>
                      <strong className="cart-item-price">{formatPrice(p.price * item.qty)}</strong>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="drawer-foot">
              <div className="total-row">
                <span>Jami:</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <button type="button" className="btn btn-buy" onClick={checkout}>
                Buyurtma berish
              </button>
              <p className="form-note">To&apos;lov mahsulotni qabul qilganda</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
