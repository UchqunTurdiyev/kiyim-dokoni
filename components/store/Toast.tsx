"use client";

import { useStore } from "./StoreProvider";
import { CheckIcon } from "./Icons";

export default function Toast() {
  const { toast, setCartOpen } = useStore();
  if (!toast) return null;
  return (
    <div className="toast" key={toast.id} role="status">
      {toast.image ? <img src={toast.image} alt="" /> : <CheckIcon size={18} />}
      <span>{toast.text}</span>
      <button type="button" onClick={() => setCartOpen(true)}>
        Savat
      </button>
    </div>
  );
}
