"use client";

import Link from "next/link";

// SVG art backgrounds — estilo poster modernista
const bgCrisis = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F2EDE4"/><rect x="140" y="0" width="60" height="90" fill="#C45335" opacity="0.7"/><rect x="0" y="120" width="80" height="30" fill="#3A2A24" opacity="0.5"/><circle cx="170" cy="160" r="40" fill="none" stroke="#C45335" stroke-width="1.5" opacity="0.6"/><circle cx="30" cy="30" r="8" fill="#C45335" opacity="0.4"/><line x1="0" y1="70" x2="80" y2="70" stroke="#3A2A24" stroke-width="0.5" opacity="0.3"/><line x1="160" y1="110" x2="200" y2="110" stroke="#C45335" stroke-width="1" opacity="0.4"/><path d="M100 200 Q120 150 160 140" fill="none" stroke="#3A2A24" stroke-width="1" opacity="0.3"/></svg>`)}`;

const bgDuelo = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F2EDE4"/><rect x="0" y="0" width="70" height="70" fill="#2D7D7D" opacity="0.5"/><rect x="100" y="140" width="100" height="60" fill="#1A4A4A" opacity="0.6"/><line x1="70" y1="0" x2="70" y2="130" stroke="#2D7D7D" stroke-width="1" opacity="0.4"/><line x1="0" y1="130" x2="100" y2="130" stroke="#1A4A4A" stroke-width="0.8" opacity="0.3"/><circle cx="150" cy="40" r="25" fill="none" stroke="#2D7D7D" stroke-width="1.2" opacity="0.5"/><circle cx="50" cy="170" r="5" fill="#2D7D7D" opacity="0.5"/><path d="M0 90 Q50 70 100 90" fill="none" stroke="#1A4A4A" stroke-width="0.6" opacity="0.3"/></svg>`)}`;

const bgEstres = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F2EDE4"/><rect x="120" y="0" width="80" height="200" fill="#3A2A24" opacity="0.35"/><rect x="0" y="150" width="60" height="50" fill="#5A4A3A" opacity="0.5"/><circle cx="40" cy="50" r="30" fill="none" stroke="#3A2A24" stroke-width="1.5" opacity="0.4"/><circle cx="160" cy="100" r="4" fill="#3A2A24" opacity="0.6"/><line x1="0" y1="40" x2="200" y2="40" stroke="#3A2A24" stroke-width="0.5" opacity="0.25"/><line x1="0" y1="100" x2="90" y2="100" stroke="#5A4A3A" stroke-width="0.8" opacity="0.3"/><path d="M0 0 L40 200" stroke="#3A2A24" stroke-width="0.4" opacity="0.15"/></svg>`)}`;

const bgAutoestima = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F2EDE4"/><rect x="0" y="0" width="90" height="60" fill="#6B705C" opacity="0.45"/><rect x="0" y="140" width="200" height="60" fill="#4A4F3E" opacity="0.5"/><circle cx="150" cy="80" r="35" fill="none" stroke="#6B705C" stroke-width="1.2" opacity="0.5"/><circle cx="30" cy="100" r="3" fill="#6B705C" opacity="0.5"/><line x1="90" y1="0" x2="90" y2="60" stroke="#4A4F3E" stroke-width="0.8" opacity="0.35"/><line x1="0" y1="110" x2="200" y2="110" stroke="#6B705C" stroke-width="0.6" opacity="0.25"/><path d="M160 50 Q180 70 160 90" fill="none" stroke="#4A4F3E" stroke-width="0.8" opacity="0.3"/></svg>`)}`;

const CATEGORIAS = [
  { label: "Crisis Vitales", q: "Crisis", bg: bgCrisis },
  { label: "Duelo y Pérdidas", q: "Duelo", bg: bgDuelo },
  { label: "Estrés y Ansiedad", q: "Ansiedad", bg: bgEstres },
  { label: "Autoestima y Crecimiento", q: "Crecimiento personal", bg: bgAutoestima },
];

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--nv-bg-base)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 16px 44px",
      fontFamily: "var(--nv-font-body)",
    }}>
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1 style={{
          fontSize: 44,
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

      {/* SUBTITLE */}
      <p style={{
        fontSize: 13,
        color: "var(--nv-text-secondary)",
        textAlign: "center",
        maxWidth: 280,
        margin: "0 0 28px",
        lineHeight: 1.7,
      }}>
        Elegí una situación y encontrá al profesional adecuado para vos.
      </p>

      {/* 2x2 GRID — BOTONES ARTÍSTICOS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        width: "100%",
        maxWidth: 390,
        marginBottom: 32,
      }}>
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat.q}
            href={`/buscar?q=${encodeURIComponent(cat.q)}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              aspectRatio: "1",
              backgroundImage: `url(${cat.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 2,
              textDecoration: "none",
              padding: "20px 14px",
              gap: 0,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)";
              e.currentTarget.style.zIndex = "2";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              e.currentTarget.style.zIndex = "1";
            }}
          >
            {/* Overlay oscuro sutil para legibilidad */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.08)",
              zIndex: 1,
            }} />

            {/* Texto por delante */}
            <span style={{
              position: "relative",
              zIndex: 2,
              fontSize: 12,
              fontWeight: 700,
              color: "#FFFFFF",
              textAlign: "center",
              letterSpacing: "0.08em",
              lineHeight: 1.3,
              textTransform: "uppercase",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              padding: "6px 14px",
              background: "rgba(0,0,0,0.35)",
              borderRadius: 2,
            }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* DIVIDER */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 390, marginBottom: 18 }}>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(27,67,50,0.10)" }} />
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", color: "var(--nv-text-muted)", textTransform: "uppercase" }}>
          o filtrá por
        </span>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(27,67,50,0.10)" }} />
      </div>

      {/* FORM */}
      <form action="/buscar" method="GET" style={{ width: "100%", maxWidth: 390, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <select name="modalidad" style={{
            flex: 1, padding: "14px 16px", background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)", borderRadius: 4,
            color: "var(--nv-text-primary)", fontSize: 13,
            fontFamily: "var(--nv-font-body)", outline: "none",
            appearance: "none", WebkitAppearance: "none", cursor: "pointer",
          }}>
            <option value="">Modalidad</option>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
          </select>
          <select name="provincia" style={{
            flex: 1, padding: "14px 16px", background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)", borderRadius: 4,
            color: "var(--nv-text-primary)", fontSize: 13,
            fontFamily: "var(--nv-font-body)", outline: "none",
            appearance: "none", WebkitAppearance: "none", cursor: "pointer",
          }}>
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Buscar Counselors
        </button>
      </form>

      {/* Counselor entry */}
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
