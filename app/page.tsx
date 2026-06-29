import Link from "next/link";

const CATEGORIAS = [
  { label: "Crisis Vitales", icon: "🌊", q: "Crisis" },
  { label: "Duelo y Pérdidas", icon: "🍂", q: "Duelo" },
  { label: "Estrés y Ansiedad", icon: "💭", q: "Ansiedad" },
  { label: "Autoestima y Crecimiento", icon: "🌱", q: "Crecimiento personal" },
  { label: "Pareja y Vínculos", icon: "💞", q: "Pareja" },
  { label: "Trabajo y Vocación", icon: "💼", q: "Trabajo" },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)" }}>
      <header style={{ padding: "20px 20px 0", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "var(--nv-accent)", textTransform: "uppercase", marginBottom: 12 }}>Newen</div>
        <h1 style={{ fontSize: 30, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", lineHeight: 1.15, letterSpacing: -0.5, marginBottom: 6 }}>
          Búsqueda por<br />situación
        </h1>
        <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", lineHeight: 1.6, marginBottom: 28 }}>
          Elegí qué te está pasando y encontrá al counselor adecuado.
        </p>
      </header>

      <div style={{ padding: "0 20px 100px", maxWidth: 480, margin: "0 auto" }}>
        {/* Cards de categoría */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {CATEGORIAS.map(cat => (
            <Link key={cat.q} href={`/buscar?q=${encodeURIComponent(cat.q)}`}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "18px 20px",
                background: "var(--nv-bg-card)", border: "1px solid var(--nv-border)",
                borderRadius: "var(--nv-radius-lg)", textDecoration: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{cat.icon}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "var(--nv-text-primary)", fontFamily: "var(--nv-font-body)" }}>{cat.label}</span>
              <span style={{ fontSize: 16, color: "var(--nv-text-muted)" }}>→</span>
            </Link>
          ))}
        </div>

        {/* Búsqueda libre */}
        <form action="/buscar" method="GET">
          <div style={{ position: "relative", marginBottom: 10 }}>
            <input name="q" className="input" type="text" placeholder='O escribí cómo te sentís...' style={{ paddingRight: 48, height: 46, fontSize: 14 }} />
            <button type="submit" className="btn-primary" style={{ position: "absolute", right: 4, top: 4, bottom: 4, padding: "0 14px", fontSize: 12, borderRadius: "var(--nv-radius-sm)" }}>Buscar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
