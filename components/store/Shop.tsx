"use client";

import { StoreProvider } from "./StoreProvider";
import Header from "./Header";
import CartDrawer from "./CartDrawer";
import QuickView from "./QuickView";
import CheckoutModal from "./CheckoutModal";
import Toast from "./Toast";

// Butun do'kon holati (savat, like, modallar) shu yerda
export default function Shop({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Header />
      {children}
      <QuickView />
      <CartDrawer />
      <CheckoutModal />
      <Toast />
    </StoreProvider>
  );
}
