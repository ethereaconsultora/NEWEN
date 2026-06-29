import Link from "next/link";

const CATEGORIAS = [
  { label: "Crisis Vitales", desc: "Situaciones límite, cambios bruscos, pérdida de sentido.", q: "Crisis" },
  { label: "Duelo y Pérdidas", desc: "Elaboración de pérdidas, despedidas, transformación del dolor.", q: "Duelo" },
  { label: "Estrés y Ansiedad", desc: "Agotamiento, preocupación constante, síntomas físicos.", q: "Ansiedad" },
  { label: "Autoestima y Crecimiento", desc: "Desarrollo personal, confianza, propósito de vida.", q: "Crecimiento personal" },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "28px 20px 60px", maxWidth: 480, margin: "0 auto" }}>
      {/* TITLE */}
      <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--nv-accent)", textTransform: "uppercase", marginBottom: 28 }}>
        Búsqueda por situación
      </h1>

      {/* CATEGORY CARDS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {CATEGORIAS.map(cat => (
          <Link key={cat.q} href={`/buscar?q=${encodeURIComponent(cat.q)}`}
            style={{
              display: "block", textDecoration: "none",
              background: "var(--nv-bg-card)", border: "1px solid var(--nv-border)",
              borderRadius: "var(--nv-radius-lg)", padding: "20px 22px",
              transition: "border-color 0.2s",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--nv-text-primary)", marginBottom: 6, fontFamily: "var(--nv-font-body)" }}>
                  {cat.label}
                </h2>
                <p style={{ fontSize: 12, color: "var(--nv-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  {cat.desc}
                </p>
              </div>
              <span style={{ fontSize: 13, color: "var(--nv-accent)", fontWeight: 500, flexShrink: 0, marginLeft: 12 }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* FILTERS + SEARCH */}
      <form action="/buscar" method="GET" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <select name="modalidad" className="input" style={{ padding: "12px 14px", fontSize: 13, color: "var(--nv-text-primary)" }}>
          <option value="">Modalidad · Todas</option>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
        </select>
        <select name="provincia" className="input" style={{ padding: "12px 14px", fontSize: 13, color: "var(--nv-text-primary)" }}>
          <option value="">Región · Todas</option>
          <option value="Buenos Aires">Buenos Aires</option>
          <option value="CABA">CABA</option>
          <option value="Córdoba">Córdoba</option>
          <option value="Santa Fe">Santa Fe</option>
        </select>
        <input name="q" className="input" type="text" placeholder="O escribí cómo te sentís..." style={{ padding: "12px 14px", fontSize: 13 }} />
        <button type="submit" className="btn-primary" style={{ width: "100%", padding: "13px 0", fontSize: 14, fontWeight: 600 }}>
          Buscar counselors
        </button>
      </form>
    </div>
  );
}
