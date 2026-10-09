import LeadForm from "@/components/LeadForm";
import { site } from "@/lib/site";

export default function Home() {
  return (
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
          <a href="#ariza" className="btn btn-light">
            Ariza qoldirish ↓
          </a>
        </div>
      </section>

      <section id="ariza" className="form-section">
        <div className="container narrow">
          <LeadForm />
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} {site.name}. Barcha huquqlar himoyalangan.
      </footer>
    </main>
  );
}
