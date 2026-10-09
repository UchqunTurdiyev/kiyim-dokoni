import type { Metadata } from "next";
import ThankYou from "@/components/ThankYou";

export const metadata: Metadata = {
  title: "Rahmat!",
  robots: { index: false, follow: false },
};

export default function RahmatPage() {
  return (
    <main className="thanks">
      <ThankYou />
    </main>
  );
}
