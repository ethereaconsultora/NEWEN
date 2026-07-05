"use client";

import Link from "next/link";

// ── Fondos artísticos SVG inspirados en las imágenes ──

const bgCrisis = `data:image/svg+xml,${encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs><radialGradient id="g" cx="50%" cy="70%" r="60%"><stop offset="0%" stop-color="#E8B84B" stop-opacity="0.9"/><stop offset="100%" stop-color="#2C3E50" stop-opacity="0.95"/></radialGradient></defs>
  <rect width="200" height="200" fill="url(#g)"/>
  <ellipse cx="100" cy="150" rx="70" ry="30" fill="#D4A02B" opacity="0.4"/>
  <circle cx="100" cy="100" r="50" fill="#E8C55A" opacity="0.15"/>
  <ellipse cx="85" cy="120" rx="4" ry="12" fill="#1A1A2E" opacity="0.8"/>
  <ellipse cx="100" cy="118" rx="4" ry="12" fill="#1A1A2E" opacity="0.8"/>
  <ellipse cx="115" cy="120" rx="4" ry="12" fill="#1A1A2E" opacity="0.8"/>
  <circle cx="85" cy="106" r="3" fill="#1A1A2E" opacity="0.7"/>
  <circle cx="100" cy="104" r="3" fill="#1A1A2E" opacity="0.7"/>
  <circle cx="115" cy="106" r="3" fill="#1A1A2E" opacity="0.7"/>
</svg>`)}`;

const bgDuelo = `data:image/svg+xml,${encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#FDF8F8"/>
  <circle cx="100" cy="95" r="42" fill="#C0392B" opacity="0.85"/>
  <circle cx="88" cy="80" r="28" fill="#A93226" opacity="0.7"/>
  <circle cx="112" cy="80" r="28" fill="#A93226" opacity="0.7"/>
  <circle cx="80" cy="100" r="22" fill="#922B21" opacity="0.6"/>
  <circle cx="120" cy="100" r="22" fill="#922B21" opacity="0.6"/>
  <circle cx="100" cy="88" r="18" fill="#E74C3C" opacity="0.5"/>
  <path d="M100 140 Q90 160 100 200" stroke="#1A1A1A" stroke-width="2" fill="none" opacity="0.7"/>
  <path d="M100 140 Q80 170 70 195" stroke="#1A1A1A" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M100 140 Q120 170 130 195" stroke="#1A1A1A" stroke-width="1.5" fill="none" opacity="0.5"/>
  <circle cx="50" cy="170" r="2" fill="#C0392B" opacity="0.4"/>
  <circle cx="160" cy="60" r="2.5" fill="#C0392B" opacity="0.3"/>
  <circle cx="30" cy="40" r="2" fill="#1A1A1A" opacity="0.2"/>
  <circle cx="170" cy="150" r="1.5" fill="#1A1A1A" opacity="0.25"/>
</svg>`)}`;

const bgEstres = `data:image/svg+xml,${encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4C5B9"/><stop offset="60%" stop-color="#E8D5C4"/><stop offset="100%" stop-color="#C4956A"/></linearGradient></defs>
  <rect width="200" height="200" fill="url(#sky)"/>
  <ellipse cx="100" cy="160" rx="90" ry="40" fill="#8B5E3C" opacity="0.7"/>
  <ellipse cx="100" cy="155" rx="85" ry="35" fill="#A0522D" opacity="0.5"/>
  <path d="M100 150 L85 40 Q100 20 100 20 Q100 20 115 40 Z" fill="#2C1810" opacity="0.8"/>
  <path d="M100 140 L70 80 Q100 50 100 50 Q100 50 130 80 Z" fill="#3D2314" opacity="0.5"/>
  <path d="M100 150 L60 100" stroke="#2C1810" stroke-width="2" opacity="0.6"/>
  <path d="M100 150 L140 100" stroke="#2C1810" stroke-width="2" opacity="0.6"/>
  <path d="M100 130 L50 60" stroke="#2C1810" stroke-width="1.5" opacity="0.4"/>
  <path d="M100 130 L150 60" stroke="#2C1810" stroke-width="1.5" opacity="0.4"/>
  <circle cx="100" cy="15" r="35" fill="#F5E6D3" opacity="0.3"/>
  <circle cx="100" cy="10" r="25" fill="#FFF8F0" opacity="0.25"/>
</svg>`)}`;

const bgAutoestima = `data:image/svg+xml,${encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs><linearGradient id="bambooBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8EDE4"/><stop offset="100%" stop-color="#C8D5C0"/></linearGradient></defs>
  <rect width="200" height="200" fill="url(#bambooBg)"/>
  <rect x="40" y="10" width="8" height="180" rx="4" fill="#5A7D4A" opacity="0.6"/>
  <rect x="42" y="55" width="8" height="2" rx="1" fill="#8FAF7A" opacity="0.5"/>
  <rect x="42" y="100" width="8" height="2" rx="1" fill="#8FAF7A" opacity="0.5"/>
  <rect x="42" y="140" width="8" height="2" rx="1" fill="#8FAF7A" opacity="0.5"/>
  <rect x="90" y="20" width="6" height="170" rx="3" fill="#4A6D3A" opacity="0.5"/>
  <rect x="92" y="70" width="6" height="2" rx="1" fill="#7A9F5A" opacity="0.4"/>
  <rect x="92" y="120" width="6" height="2" rx="1" fill="#7A9F5A" opacity="0.4"/>
  <rect x="140" y="5" width="7" height="185" rx="3.5" fill="#6B8E5A" opacity="0.55"/>
  <rect x="142" y="45" width="7" height="2" rx="1" fill="#9FBF7A" opacity="0.45"/>
  <rect x="142" y="90" width="7" height="2" rx="1" fill="#9FBF7A" opacity="0.45"/>
  <rect x="142" y="150" width="7" height="2" rx="1" fill="#9FBF7A" opacity="0.45"/>
  <path d="M48 15 Q60 5 55 15" fill="#7A9F5A" opacity="0.35"/>
  <path d="M96 25 Q108 15 103 25" fill="#6A8F4A" opacity="0.3"/>
  <path d="M147 10 Q159 0 154 10" fill="#8AAF6A" opacity="0.35"/>
</svg>`)}`;

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
              backgroundImage: `url(${cat.bg})`,
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
              fontSize: 11,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "0.06em",
              lineHeight: 1.3,
              textTransform: "uppercase",
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
              padding: "5px 10px",
              background: "rgba(0,0,0,0.35)",
              borderRadius: 2,
              maxWidth: "100%",
            }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

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
