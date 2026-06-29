"use client";

import Link from "next/link";

const CATEGORIAS = [
  { label: "Crisis Vitales", q: "Crisis", symbol: "◇" },
  { label: "Duelo y Pérdidas", q: "Duelo", symbol: "○" },
  { label: "Estrés y Ansiedad", q: "Ansiedad", symbol: "△" },
  { label: "Autoestima y Crecimiento", q: "Crecimiento personal", symbol: "□" },
];

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--nv-bg-base)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "56px 24px 44px",
      fontFamily: "var(--nv-font-body)",
    }}>
      {/* HEADER */}
      <h1 style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.22em",
        color: "#7dba8f",
        textTransform: "uppercase",
        textAlign: "center",
        margin: 0,
        marginBottom: 36,
        lineHeight: 1,
      }}>
        Búsqueda por Situación
      </h1>

      {/* 2x2 GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
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
              background: "#FFFFFF",
              border: "1px solid rgba(125,186,143,0.12)",
              borderRadius: 14,
              textDecoration: "none",
              padding: "20px 14px",
              gap: 14,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "border-color 0.25s, box-shadow 0.25s",
            }}
          >
            <span style={{
              fontSize: 22,
              color: "rgba(125,186,143,0.25)",
              lineHeight: 1,
              fontWeight: 300,
              fontFamily: "'DM Serif Display', serif",
            }}>
              {cat.symbol}
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1C1208",
              textAlign: "center",
              letterSpacing: "0.04em",
              lineHeight: 1.3,
              textTransform: "uppercase",
            }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* FORM */}
      <form
        action="/buscar"
        method="GET"
        style={{
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* MODALIDAD */}
        <div>
          <label style={{
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(28,18,8,0.45)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Modalidad
          </label>
          <select
            name="modalidad"
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#FFFFFF",
              border: "1px solid rgba(125,186,143,0.15)",
              borderRadius: 10,
              color: "#1C1208",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="">Presencial / Online</option>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
          </select>
        </div>

        {/* REGIÓN */}
        <div>
          <label style={{
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(28,18,8,0.45)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Región
          </label>
          <select
            name="provincia"
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#FFFFFF",
              border: "1px solid rgba(125,186,143,0.15)",
              borderRadius: 10,
              color: "#1C1208",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="">Región...</option>
            <option value="Buenos Aires">Buenos Aires</option>
            <option value="CABA">CABA</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Santa Fe">Santa Fe</option>
            <option value="Mendoza">Mendoza</option>
          </select>
        </div>

        {/* BUTTON */}
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
            padding: "16px 0",
            background: "#7dba8f",
            border: "none",
            borderRadius: 12,
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 6,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Buscar Counselors
        </button>
      </form>
    </div>
  );
}
