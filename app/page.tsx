"use client";

import Link from "next/link";

const CATEGORIAS = [
  {
    label: "Crisis Vitales",
    q: "Crisis",
    accent: "#C45335",
    bg: "rgba(196,83,53,0.06)",
    geom: "circle",
  },
  {
    label: "Duelo y Pérdidas",
    q: "Duelo",
    accent: "#2D7D7D",
    bg: "rgba(45,125,125,0.06)",
    geom: "bars",
  },
  {
    label: "Estrés y Ansiedad",
    q: "Ansiedad",
    accent: "#3A2A24",
    bg: "rgba(58,42,36,0.06)",
    geom: "diagonal",
  },
  {
    label: "Autoestima y Crecimiento",
    q: "Crecimiento personal",
    accent: "#6B705C",
    bg: "rgba(107,112,92,0.06)",
    geom: "cross",
  },
];

function GeoIcon({ type, color }: { type: string; color: string }) {
  const s = { stroke: color, fill: "none", strokeWidth: "1.6", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "circle":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="9" {...s} />
          <circle cx="18" cy="10" r="1.5" fill={color} stroke="none" />
        </svg>
      );
    case "bars":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28">
          <line x1="7" y1="8" x2="21" y2="8" {...s} />
          <line x1="7" y1="14" x2="17" y2="14" {...s} />
          <line x1="7" y1="20" x2="21" y2="20" {...s} />
        </svg>
      );
    case "diagonal":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28">
          <line x1="7" y1="21" x2="21" y2="7" {...s} />
          <line x1="7" y1="7" x2="21" y2="21" {...s} />
          <circle cx="18" cy="6" r="1.5" fill={color} stroke="none" />
        </svg>
      );
    case "cross":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28">
          <line x1="14" y1="5" x2="14" y2="23" {...s} />
          <line x1="5" y1="14" x2="23" y2="14" {...s} />
          <circle cx="14" cy="14" r="2" fill={color} stroke="none" />
        </svg>
      );
  }
}

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--nv-bg-base)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "56px 20px 44px",
      fontFamily: "var(--nv-font-body)",
    }}>
      {/* HEADER — tipografía estilo poster */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{
          fontSize: 46,
          fontWeight: 400,
          fontFamily: "var(--nv-font-display)",
          color: "var(--nv-text-primary)",
          letterSpacing: -1.5,
          margin: "0 0 6px",
          lineHeight: 1,
        }}>
          Newen
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ width: 24, height: 1, background: "var(--nv-accent-border)", display: "inline-block" }} />
          <p style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.3em",
            color: "var(--nv-accent)",
            textTransform: "uppercase",
            margin: 0,
          }}>
            Encontrá a tu counselor
          </p>
          <span style={{ width: 24, height: 1, background: "var(--nv-accent-border)", display: "inline-block" }} />
        </div>
      </div>

      {/* SUBTITLE */}
      <p style={{
        fontSize: 13,
        color: "var(--nv-text-secondary)",
        textAlign: "center",
        maxWidth: 280,
        margin: "0 0 36px",
        lineHeight: 1.7,
        letterSpacing: "0.01em",
      }}>
        Elegí una situación y encontrá al profesional adecuado para vos.
      </p>

      {/* 2x2 GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        width: "100%",
        maxWidth: 380,
        marginBottom: 36,
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
              background: "#FCFAF7",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 4,
              textDecoration: "none",
              padding: "20px 14px",
              gap: 12,
              position: "relative",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = cat.accent;
              e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${cat.accent}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Top-left dot accent */}
            <span style={{
              position: "absolute", top: 10, left: 12,
              width: 3, height: 3, borderRadius: "50%",
              background: cat.accent, opacity: 0.5,
            }} />

            {/* Icon */}
            <GeoIcon type={cat.geom} color={cat.accent} />

            {/* Label */}
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--nv-text-primary)",
              textAlign: "center",
              letterSpacing: "0.06em",
              lineHeight: 1.3,
              textTransform: "uppercase",
            }}>
              {cat.label}
            </span>

            {/* Bottom accent line */}
            <span style={{
              width: 16, height: 1,
              background: cat.accent, opacity: 0.3,
            }} />
          </Link>
        ))}
      </div>

      {/* DIVIDER — estilo poster */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", maxWidth: 380, marginBottom: 20,
      }}>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--nv-accent)", opacity: 0.4 }} />
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(27,67,50,0.10)" }} />
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "var(--nv-text-muted)", textTransform: "uppercase" }}>
          o filtrá por
        </span>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(27,67,50,0.10)" }} />
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--nv-accent)", opacity: 0.4 }} />
      </div>

      {/* FORM */}
      <form action="/buscar" method="GET" style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <select name="modalidad" style={{
            flex: 1, padding: "14px 16px", background: "#FCFAF7",
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
            flex: 1, padding: "14px 16px", background: "#FCFAF7",
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
          width: "100%", padding: "18px 0",
          background: "var(--nv-accent)", border: "none", borderRadius: 4,
          color: "#FFFFFF", fontSize: 13, fontWeight: 700,
          fontFamily: "var(--nv-font-body)", letterSpacing: "0.08em",
          textTransform: "uppercase", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: "0 4px 16px rgba(27,67,50,0.22)",
          transition: "all 0.2s",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Buscar Counselors
        </button>
      </form>

      {/* Counselor entry */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <span style={{ fontSize: 10, color: "var(--nv-text-muted)", letterSpacing: "0.04em" }}>
          ¿Sos counselor o admin?{" "}
        </span>
        <a href="/auth/login" style={{
          fontSize: 10, fontWeight: 600, color: "var(--nv-text-secondary)",
          textDecoration: "underline", textUnderlineOffset: 3,
        }}>
          Ingresá acá
        </a>
      </div>
    </div>
  );
}
