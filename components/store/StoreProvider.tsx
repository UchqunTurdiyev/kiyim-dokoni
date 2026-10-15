"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProduct, type Product } from "@/lib/products";
import { fbqTrack } from "@/lib/meta";

export type CartItem = { key: string; productId: string; size: number; qty: number };
export type CheckoutLine = { product: Product; size: number; qty: number };
type Checkout = { lines: CheckoutLine[]; source: "cart" | "buy-now" } | null;
type Toast = { id: number; text: string; image?: string } | null;

type Store = {
  cart: CartItem[];
  likes: string[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string, size: number, qty?: number) => void;
  updateQty: (key: string, qty: number) => void;
  updateSize: (key: string, size: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;
  quickViewId: string | null;
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  checkout: Checkout;
  startCheckout: (lines: CheckoutLine[], source: "cart" | "buy-now") => void;
  closeCheckout: () => void;
  toast: Toast;
  showToast: (text: string, image?: string) => void;
  cartBump: number;
};

const Ctx = createContext<Store | null>(null);

const CART_KEY = "ms_cart_v1";
const LIKES_KEY = "ms_likes_v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private rejim — e'tiborsiz */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState<Checkout>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [cartBump, setCartBump] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCart(read<CartItem[]>(CART_KEY, []).filter((i) => getProduct(i.productId)));
    setLikes(read<string[]>(LIKES_KEY, []).filter((id) => getProduct(id)));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) write(CART_KEY, cart);
  }, [cart, loaded]);
  useEffect(() => {
    if (loaded) write(LIKES_KEY, likes);
  }, [likes, loaded]);

  // Modal/drawer ochiq bo'lsa sahifa scroll bo'lmasin
  const locked = !!quickViewId || cartOpen || !!checkout;
  useEffect(() => {
    document.documentElement.classList.toggle("scroll-lock", locked);
  }, [locked]);

  const showToast = useCallback((text: string, image?: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, image });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const addToCart = useCallback(
    (productId: string, size: number, qty = 1) => {
      const p = getProduct(productId);
      if (!p) return;
      const key = `${productId}-${size}`;
      setCart((prev) => {
        const found = prev.find((i) => i.key === key);
        if (found) return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, 10) } : i));
        return [...prev, { key, productId, size, qty }];
      });
      setCartBump((n) => n + 1);
      showToast(`${p.name} (${size}) savatga qo'shildi`, p.image);
      fbqTrack("AddToCart", {
        content_ids: [p.sku],
        content_name: p.name,
        content_type: "product",
        value: p.price * qty,
        currency: "UZS",
      });
    },
    [showToast]
  );

  const updateQty = useCallback((key: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, 10)) } : i)));
  }, []);

  const updateSize = useCallback((key: string, size: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.key === key);
      if (!item) return prev;
      const newKey = `${item.productId}-${size}`;
      const existing = prev.find((i) => i.key === newKey);
      if (existing && existing.key !== key) {
        return prev
          .filter((i) => i.key !== key)
          .map((i) => (i.key === newKey ? { ...i, qty: Math.min(i.qty + item.qty, 10) } : i));
      }
      return prev.map((i) => (i.key === key ? { ...i, key: newKey, size } : i));
    });
  }, []);

  const removeFromCart = useCallback((key: string) => setCart((prev) => prev.filter((i) => i.key !== key)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleLike = useCallback(
    (productId: string) => {
      const p = getProduct(productId);
      if (likes.includes(productId)) {
        setLikes((prev) => prev.filter((id) => id !== productId));
        return;
      }
      setLikes((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
      if (p) {
        showToast(`${p.name} yoqtirganlarga qo'shildi`, p.image);
        fbqTrack("AddToWishlist", { content_ids: [p.sku], content_name: p.name, value: p.price, currency: "UZS" });
      }
    },
    [likes, showToast]
  );
  const isLiked = useCallback((id: string) => likes.includes(id), [likes]);

  const openQuickView = useCallback((id: string) => {
    const p = getProduct(id);
    setQuickViewId(id);
    if (p) {
      fbqTrack("ViewContent", {
        content_ids: [p.sku],
        content_name: p.name,
        content_type: "product",
        value: p.price,
        currency: "UZS",
      });
    }
  }, []);
  const closeQuickView = useCallback(() => setQuickViewId(null), []);

  const startCheckout = useCallback((lines: CheckoutLine[], source: "cart" | "buy-now") => {
    setCheckout({ lines, source });
    const value = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    fbqTrack("InitiateCheckout", {
      content_ids: lines.map((l) => l.product.sku),
      num_items: lines.reduce((s, l) => s + l.qty, 0),
      value,
      currency: "UZS",
    });
  }, []);
  const closeCheckout = useCallback(() => setCheckout(null), []);

  const { cartCount, cartTotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const i of cart) {
      const p = getProduct(i.productId);
      if (!p) continue;
      count += i.qty;
      total += p.price * i.qty;
    }
    return { cartCount: count, cartTotal: total };
  }, [cart]);

  const value: Store = {
    cart,
    likes,
    cartCount,
    cartTotal,
    addToCart,
    updateQty,
    updateSize,
    removeFromCart,
    clearCart,
    toggleLike,
    isLiked,
    quickViewId,
    openQuickView,
    closeQuickView,
    cartOpen,
    setCartOpen,
    checkout,
    startCheckout,
    closeCheckout,
    toast,
    showToast,
    cartBump,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore StoreProvider ichida ishlatilishi kerak");
  return ctx;
}
