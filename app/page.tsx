import LeadForm from "@/components/LeadForm";
import Shop from "@/components/store/Shop";
import Catalog from "@/components/store/Catalog";
import { site } from "@/lib/site";
import "./store.css";

export default function Home() {
  return (
    <Shop>
      <main>
        <section className="hero">
          <div className="hero-bg" aria-hidden />
          <div className="container hero-inner">
            <span className="brand">{site.name}</span>
            <span className="badge">{site.tagline}</span>
            <h1>{site.title}</h1>
            <p className="offer">{site.offer}</p>
            <ul className="bullets">
              {site.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="hero-ctas">
              <a href="#katalog" className="btn btn-light">
                Katalogni ko&apos;rish ↓
              </a>
              <a href="#ariza" className="btn btn-ghost-light">
                Ariza qoldirish
              </a>
            </div>
          </div>
        </section>

        <Catalog />

        <section id="ariza" className="form-section">
          <div className="container narrow">
            <LeadForm />
          </div>
        </section>

        <footer className="footer">
          © {new Date().getFullYear()} {site.name}. Barcha huquqlar himoyalangan.
        </footer>
      </main>
    </Shop>
  );
}
