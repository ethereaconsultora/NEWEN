import Link from "next/link";

/**
 * Home pública — estilo Anima adaptado a Newen.
 * Header con inicial "N", saludo, buscador, chips.
 */
export default function HomePage() {
  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)" }}>
      {/* ── HEADER ANIMA ── */}
      <header style={{ background: "var(--nv-bg-surface)", borderBottom: "1px solid var(--nv-border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--nv-accent-soft)", border: "1.5px solid var(--nv-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "var(--nv-accent)", fontFamily: "var(--nv-font-display)" }}>N</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--nv-text-primary)", fontFamily: "var(--nv-font-display)", letterSpacing: -0.3 }}>Buen día</div>
          <div style={{ fontSize: 10, color: "var(--nv-text-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 1 }}>Newen · {hoy}</div>
        </div>
        <Link href="/mi-cuenta" style={{ fontSize: 11, color: "var(--nv-text-muted)", textDecoration: "none", fontWeight: 500 }}>Mi cuenta</Link>
      </header>

      {/* ── CONTENIDO ── */}
      <div style={{ padding: "24px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", lineHeight: 1.15, marginBottom: 10, letterSpacing: -0.5 }}>
          ¿Qué te está<br />pasando?
        </h1>
        <p style={{ fontSize: 14, color: "var(--nv-text-secondary)", maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
          Explorá perfiles, elegí un counselor, reservá tu espacio. Sin registro previo.
        </p>

        {/* Buscador */}
        <form action="/buscar" method="GET" style={{ marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <input name="q" className="input" type="text" placeholder='Escribí cómo te sentís, ej: "estoy atravesando un duelo"...' style={{ paddingRight: 52, fontSize: 14, height: 48 }} />
            <button type="submit" className="btn-primary" style={{ position: "absolute", right: 4, top: 4, bottom: 4, padding: "0 16px", fontSize: 13, borderRadius: "var(--nv-radius-sm)" }}>Buscar</button>
          </div>
        </form>

        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Ansiedad", "Duelo", "Pareja", "Trabajo", "Familia", "Crisis", "Crecimiento personal", "Soledad"].map(tag => (
            <Link key={tag} href={`/buscar?q=${encodeURIComponent(tag)}`}
              style={{ fontSize: 13, padding: "8px 16px", border: "1px solid var(--nv-border)", background: "var(--nv-bg-card)", color: "var(--nv-text-primary)", borderRadius: "var(--nv-radius-full)", fontFamily: "var(--nv-font-body)", textDecoration: "none", transition: "all 0.15s" }}>
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* BottomNav */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--nv-bg-surface)", borderTop: "1px solid var(--nv-border)", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 50 }}>
        {[{ href: "/", icon: "🔍", label: "Explorar", active: true }, { href: "/mi-cuenta", icon: "👤", label: "Cuenta" }].map(n => (
          <Link key={n.href} href={n.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", fontSize: 10, color: n.active ? "var(--nv-accent)" : "var(--nv-text-muted)", fontWeight: n.active ? 600 : 500 }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
