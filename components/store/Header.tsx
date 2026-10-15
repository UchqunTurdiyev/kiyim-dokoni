"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { useStore } from "./StoreProvider";
import { BagIcon, HeartIcon } from "./Icons";

export default function Header() {
  const { cartCount, likes, setCartOpen, cartBump } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!cartBump) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [cartBump]);

  const showLiked = () => {
    window.dispatchEvent(new CustomEvent("ms:show-liked"));
    document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="container header-inner">
        <a href="#" className="logo" aria-label={site.name}>
          {site.name}
        </a>
        <nav className="header-nav">
          <a href="#katalog">Katalog</a>
          <a href="#ariza">Bog&apos;lanish</a>
        </nav>
        <div className="header-actions">
          <button type="button" className="icon-btn" onClick={showLiked} aria-label="Yoqtirganlar">
            <HeartIcon size={21} />
            {likes.length > 0 && <span className="count">{likes.length}</span>}
          </button>
          <button
            type="button"
            className={`icon-btn cart-btn${bump ? " bump" : ""}`}
            onClick={() => setCartOpen(true)}
            aria-label="Savat"
          >
            <BagIcon size={21} />
            {cartCount > 0 && <span className="count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
