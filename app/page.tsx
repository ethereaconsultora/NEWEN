"use client";

import Link from "next/link";

const CATEGORIAS = [
  { label: "Crisis Vitales", q: "Crisis", img: "/images/crisis-vitales.jpeg" },
  { label: "Duelo y Pérdidas", q: "Duelo", img: "/images/duelo-perdidas.jpg" },
  { label: "Estrés y Ansiedad", q: "Ansiedad", img: "/images/estres-ansiedad.jpg" },
  { label: "Autoestima y Crecimiento", q: "Crecimiento personal", img: "/images/autoestima-crecimiento.jpg" },
];

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--nv-bg-base)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "44px 16px 44px",
      fontFamily: "var(--nv-font-body)",
    }}>
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h1 style={{
          fontSize: 42,
          fontWeight: 400,
          fontFamily: "var(--nv-font-display)",
          color: "var(--nv-text-primary)",
          letterSpacing: -1,
          margin: "0 0 4px",
          lineHeight: 1,
        }}>
          Newen
        </h1>
        <p style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.28em",
          color: "var(--nv-accent)",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Encontrá a tu counselor
        </p>
      </div>

      <p style={{
        fontSize: 13,
        color: "var(--nv-text-secondary)",
        textAlign: "center",
        maxWidth: 280,
        margin: "0 0 24px",
        lineHeight: 1.7,
      }}>
        Elegí una situación y encontrá al profesional adecuado para vos.
      </p>

      {/* 2x2 GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        width: "100%",
        maxWidth: 390,
        marginBottom: 28,
      }}>
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat.q}
            href={`/buscar?q=${encodeURIComponent(cat.q)}`}
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              aspectRatio: "1",
              backgroundImage: `url(${cat.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 4,
              textDecoration: "none",
              padding: "14px",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.15)";
              e.currentTarget.style.zIndex = "2";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";
              e.currentTarget.style.zIndex = "1";
            }}
          >
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "0.06em",
              lineHeight: 1.3,
              textTransform: "uppercase",
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
              padding: "6px 12px",
              background: "rgba(0,0,0,0.40)",
              borderRadius: 2,
              maxWidth: "100%",
            }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* BOTÓN TALLERES */}
      <Link
        href="/talleres"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
          width: "100%",
          maxWidth: 390,
          height: 130,
          backgroundImage: "url(/images/taller.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 4,
          textDecoration: "none",
          padding: "16px",
          marginBottom: 28,
          transition: "all 0.3s",
          position: "relative",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#FFFFFF",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textShadow: "0 1px 6px rgba(0,0,0,0.6)",
          padding: "6px 12px",
          background: "rgba(0,0,0,0.40)",
          borderRadius: 2,
        }}>
          🎓 Talleres
        </span>
      </Link>

      {/* DIVIDER */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 390, marginBottom: 16 }}>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(27,67,50,0.10)" }} />
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", color: "var(--nv-text-muted)", textTransform: "uppercase" }}>
          o filtrá por
        </span>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(27,67,50,0.10)" }} />
      </div>

      {/* FORM */}
      <form action="/buscar" method="GET" style={{ width: "100%", maxWidth: 390, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <select name="modalidad" style={{ flex: 1, padding: "14px 16px", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 4, color: "var(--nv-text-primary)", fontSize: 13, fontFamily: "var(--nv-font-body)", outline: "none", appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}>
            <option value="">Modalidad</option>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
          </select>
          <select name="provincia" style={{ flex: 1, padding: "14px 16px", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 4, color: "var(--nv-text-primary)", fontSize: 13, fontFamily: "var(--nv-font-body)", outline: "none", appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}>
            <option value="">Región</option>
            <option value="Buenos Aires">Buenos Aires</option>
            <option value="CABA">CABA</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Santa Fe">Santa Fe</option>
            <option value="Mendoza">Mendoza</option>
          </select>
        </div>

        <button type="submit" onClick={(e) => {
          const f = (e.target as HTMLButtonElement).closest("form") as HTMLFormElement;
          const m = f.querySelector<HTMLSelectElement>("[name='modalidad']");
          const p = f.querySelector<HTMLSelectElement>("[name='provincia']");
          if (m && !m.value) m.removeAttribute("name");
          if (p && !p.value) p.removeAttribute("name");
        }} style={{
          width: "100%", padding: "17px 0",
          background: "var(--nv-accent)", border: "none", borderRadius: 4,
          color: "#FFFFFF", fontSize: 13, fontWeight: 700,
          fontFamily: "var(--nv-font-body)", letterSpacing: "0.08em",
          textTransform: "uppercase", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: "0 4px 16px rgba(27,67,50,0.22)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Buscar Counselors
        </button>
      </form>

      <div style={{ marginTop: 28, textAlign: "center" }}>
        <span style={{ fontSize: 10, color: "var(--nv-text-muted)", letterSpacing: "0.04em" }}>
          ¿Sos counselor o admin?{" "}
        </span>
        <a href="/auth/login" style={{ fontSize: 10, fontWeight: 600, color: "var(--nv-text-secondary)", textDecoration: "underline", textUnderlineOffset: 3 }}>
          Ingresá acá
        </a>
      </div>
    </div>
  );
}
