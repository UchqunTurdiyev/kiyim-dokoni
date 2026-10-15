"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ALL_SIZES,
  CATEGORIES,
  GENDERS,
  PRICE_MAX,
  PRICE_MIN,
  avgRating,
  formatPrice,
  products,
  type Category,
  type Gender,
} from "@/lib/products";
import { useStore } from "./StoreProvider";
import ProductCard from "./ProductCard";
import { CloseIcon, FilterIcon, HeartIcon, SearchIcon } from "./Icons";

type Sort = "popular" | "new" | "cheap" | "expensive" | "rating" | "discount";

const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Ommabop" },
  { value: "new", label: "Eng yangi" },
  { value: "cheap", label: "Arzonroq" },
  { value: "expensive", label: "Qimmatroq" },
  { value: "rating", label: "Reyting bo'yicha" },
  { value: "discount", label: "Chegirmadagilar" },
];

const STEP = 10000;
const MIN = Math.floor(PRICE_MIN / STEP) * STEP;
const MAX = Math.ceil(PRICE_MAX / STEP) * STEP;

export default function Catalog() {
  const { likes } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [genders, setGenders] = useState<Gender[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [price, setPrice] = useState<[number, number]>([MIN, MAX]);
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [onlySale, setOnlySale] = useState(false);
  const [sort, setSort] = useState<Sort>("popular");
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const h = () => setOnlyLiked(true);
    window.addEventListener("ms:show-liked", h);
    return () => window.removeEventListener("ms:show-liked", h);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("scroll-lock-filters", panelOpen);
  }, [panelOpen]);

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const res = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (genders.length && !genders.includes(p.gender)) return false;
      if (sizes.length && !sizes.some((s) => p.sizes.includes(s))) return false;
      if (p.price < price[0] || p.price > price[1]) return false;
      if (onlyLiked && !likes.includes(p.id)) return false;
      if ((onlySale || sort === "discount") && !p.oldPrice) return false;
      if (q && !`${p.name} ${p.color} ${p.material} ${p.sku}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorted = [...res];
    switch (sort) {
      case "new":
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "cheap":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "expensive":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => avgRating(b) - avgRating(a));
        break;
      default:
        sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [query, category, genders, sizes, price, onlyLiked, onlySale, sort, likes]);

  const activeCount =
    genders.length + sizes.length + (price[0] !== MIN || price[1] !== MAX ? 1 : 0) + (onlyLiked ? 1 : 0) + (onlySale ? 1 : 0);

  const reset = () => {
    setQuery("");
    setCategory("all");
    setGenders([]);
    setSizes([]);
    setPrice([MIN, MAX]);
    setOnlyLiked(false);
    setOnlySale(false);
    setSort("popular");
  };

  // Filtr o'zgarganda grid qayta animatsiya bo'lishi uchun kalit
  const gridKey = [category, genders.join(), sizes.join(), price.join(), onlyLiked, onlySale, sort, query].join("|");

  const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

  return (
    <section id="katalog" className="catalog">
      <div className="container">
        <div className="catalog-head">
          <div>
            <span className="eyebrow">Katalog</span>
            <h2>Oyoq kiyimlar kolleksiyasi</h2>
            <p>Har bir juftlik sifat nazoratidan o&apos;tgan. Kiyib ko&apos;rib, keyin to&apos;laysiz.</p>
          </div>
        </div>

        <div className="chips" role="tablist" aria-label="Kategoriyalar">
          {[{ value: "all" as const, label: "Barchasi" }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={category === c.value}
              className={`chip${category === c.value ? " active" : ""}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
              <span>{counts[c.value] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="toolbar">
          <label className="search">
            <SearchIcon size={18} />
            <input
              type="search"
              placeholder="Qidirish: nomi, rangi, materiali..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select className="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Saralash">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="button" className="filter-toggle" onClick={() => setPanelOpen(true)}>
            <FilterIcon size={18} />
            Filtr
            {activeCount > 0 && <span className="count">{activeCount}</span>}
          </button>
        </div>

        <div className="catalog-layout">
          <div className={`filters-backdrop${panelOpen ? " open" : ""}`} onClick={() => setPanelOpen(false)} />
          <aside className={`filters${panelOpen ? " open" : ""}`} aria-label="Filtrlar">
            <div className="filters-head">
              <h3>Filtrlar</h3>
              <button type="button" className="icon-btn only-mobile" onClick={() => setPanelOpen(false)} aria-label="Yopish">
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="filter-group">
              <h4>Kim uchun</h4>
              <div className="pill-row">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    className={`pill${genders.includes(g.value) ? " active" : ""}`}
                    onClick={() => setGenders((a) => toggle(a, g.value))}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>O&apos;lcham</h4>
              <div className="size-filter">
                {ALL_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={sizes.includes(s) ? "active" : ""}
                    onClick={() => setSizes((a) => toggle(a, s))}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Narx</h4>
              <div className="range">
                <div className="range-track">
                  <div className="range-fill" style={{ left: `${pct(price[0])}%`, right: `${100 - pct(price[1])}%` }} />
                </div>
                <input
                  type="range"
                  min={MIN}
                  max={MAX}
                  step={STEP}
                  value={price[0]}
                  aria-label="Minimal narx"
                  onChange={(e) => setPrice(([, hi]) => [Math.min(Number(e.target.value), hi - STEP), hi])}
                />
                <input
                  type="range"
                  min={MIN}
                  max={MAX}
                  step={STEP}
                  value={price[1]}
                  aria-label="Maksimal narx"
                  onChange={(e) => setPrice(([lo]) => [lo, Math.max(Number(e.target.value), lo + STEP)])}
                />
              </div>
              <div className="range-values">
                <span>{formatPrice(price[0])}</span>
                <span>{formatPrice(price[1])}</span>
              </div>
            </div>

            <div className="filter-group">
              <label className="switch">
                <input type="checkbox" checked={onlyLiked} onChange={(e) => setOnlyLiked(e.target.checked)} />
                <span className="switch-ui" />
                <span>
                  <HeartIcon size={15} filled /> Faqat yoqtirganlarim ({likes.length})
                </span>
              </label>
              <label className="switch">
                <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} />
                <span className="switch-ui" />
                <span>Faqat chegirmadagilar</span>
              </label>
            </div>

            <div className="filters-foot">
              <button type="button" className="btn-ghost" onClick={reset}>
                Tozalash
              </button>
              <button type="button" className="btn btn-sm only-mobile" onClick={() => setPanelOpen(false)}>
                {list.length} ta mahsulotni ko&apos;rsatish
              </button>
            </div>
          </aside>

          <div className="catalog-main">
            <div className="result-bar">
              <span>
                <b>{list.length}</b> ta mahsulot topildi
              </span>
              {(activeCount > 0 || category !== "all" || query) && (
                <button type="button" className="link-btn" onClick={reset}>
                  Filtrlarni tozalash
                </button>
              )}
            </div>

            {list.length > 0 ? (
              <div className="grid" key={gridKey}>
                {list.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <div className="empty-icon">
                  {onlyLiked ? <HeartIcon size={34} /> : <SearchIcon size={34} />}
                </div>
                <h3>{onlyLiked && likes.length === 0 ? "Hali hech narsa yoqtirmadingiz" : "Hech narsa topilmadi"}</h3>
                <p>
                  {onlyLiked && likes.length === 0
                    ? "Mahsulot kartasidagi yurakcha belgisini bosing — u shu yerda saqlanadi."
                    : "Filtrlarni o'zgartirib ko'ring yoki tozalang."}
                </p>
                <button type="button" className="btn btn-sm" onClick={reset}>
                  Barcha mahsulotlar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
