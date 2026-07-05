"use client";

import Link from "next/link";

const CATEGORIAS = [
  { label: "Crisis Vitales", q: "Crisis", icon: "🌱", color: "#4A7C59", bg: "rgba(74,124,89,0.08)" },
  { label: "Duelo y Pérdidas", q: "Duelo", icon: "🕊️", color: "#6B8F71", bg: "rgba(107,143,113,0.08)" },
  { label: "Estrés y Ansiedad", q: "Ansiedad", icon: "🧘", color: "#5A7A64", bg: "rgba(90,122,100,0.08)" },
  { label: "Autoestima y Crecimiento", q: "Crecimiento personal", icon: "🌿", color: "#3D6B4F", bg: "rgba(61,107,79,0.08)" },
];

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--nv-bg-base)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 20px 44px",
      fontFamily: "var(--nv-font-body)",
    }}>
      {/* LOGO + TAGLINE */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
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
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.26em",
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
        maxWidth: 300,
        margin: "0 0 32px",
        lineHeight: 1.6,
      }}>
        Elegí una situación y encontrá al profesional adecuado para vos.
      </p>

      {/* 2x2 GRID — CATEGORÍAS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        width: "100%",
        maxWidth: 380,
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
              background: "#FFFFFF",
              border: "1.5px solid rgba(27,67,50,0.08)",
              borderRadius: 18,
              textDecoration: "none",
              padding: "18px 12px",
              gap: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = cat.color;
              e.currentTarget.style.boxShadow = `0 4px 20px ${cat.bg}`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(27,67,50,0.08)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Icon circle */}
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: cat.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, lineHeight: 1,
              transition: "transform 0.25s ease",
            }}>
              {cat.icon}
            </div>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--nv-text-primary)",
              textAlign: "center",
              letterSpacing: "0.03em",
              lineHeight: 1.3,
              textTransform: "uppercase",
            }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* DIVIDER */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", maxWidth: 380, marginBottom: 20,
      }}>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(27,67,50,0.10)" }} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "var(--nv-text-muted)", textTransform: "uppercase" }}>
          o filtrá por
        </span>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(27,67,50,0.10)" }} />
      </div>

      {/* FORM — FILTROS */}
      <form
        action="/buscar"
        method="GET"
        style={{
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* MODALIDAD */}
        <div style={{ display: "flex", gap: 8 }}>
          <select
            name="modalidad"
            style={{
              flex: 1,
              padding: "14px 16px",
              background: "#FFFFFF",
              border: "1px solid rgba(27,67,50,0.10)",
              borderRadius: 12,
              color: "var(--nv-text-primary)",
              fontSize: 13,
              fontFamily: "var(--nv-font-body)",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <option value="">💻📍 Modalidad</option>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
          </select>

          <select
            name="provincia"
            style={{
              flex: 1,
              padding: "14px 16px",
              background: "#FFFFFF",
              border: "1px solid rgba(27,67,50,0.10)",
              borderRadius: 12,
              color: "var(--nv-text-primary)",
              fontSize: 13,
              fontFamily: "var(--nv-font-body)",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <option value="">📍 Región</option>
            <option value="Buenos Aires">Buenos Aires</option>
            <option value="CABA">CABA</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Santa Fe">Santa Fe</option>
            <option value="Mendoza">Mendoza</option>
          </select>
        </div>

        {/* BUSCAR BUTTON */}
        <button
          type="submit"
          onClick={(e) => {
            const f = (e.target as HTMLButtonElement).closest("form") as HTMLFormElement;
            const m = f.querySelector<HTMLSelectElement>("[name='modalidad']");
            const p = f.querySelector<HTMLSelectElement>("[name='provincia']");
            if (m && !m.value) m.removeAttribute("name");
            if (p && !p.value) p.removeAttribute("name");
          }}
          style={{
            width: "100%",
            padding: "18px 0",
            background: "var(--nv-accent)",
            border: "none",
            borderRadius: 14,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "var(--nv-font-body)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 4px 20px rgba(27,67,50,0.30)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(27,67,50,0.40)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(27,67,50,0.30)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        <a
          href="/auth/login"
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--nv-text-secondary)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Ingresá acá
        </a>
      </div>
    </div>
  );
}
