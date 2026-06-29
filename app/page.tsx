"use client";

import Link from "next/link";

const CATEGORIAS = [
  { label: "CRISIS VITALES", q: "Crisis", icon: "🧭" },
  { label: "DUELO Y PÉRDIDAS", q: "Duelo", icon: "🕊️" },
  { label: "ESTRÉS Y ANSIEDAD", q: "Ansiedad", icon: "💭" },
  { label: "AUTOESTIMA Y CRECIMIENTO", q: "Crecimiento personal", icon: "🌱" },
];

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c1810",
      display: "flex",
      flexDirection: "column",
      padding: "48px 20px 40px",
      maxWidth: 440,
      margin: "0 auto",
    }}>
      {/* HEADER */}
      <h1 style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 2.5,
        color: "#7dba8f",
        textTransform: "uppercase",
        textAlign: "center",
        marginBottom: 32,
        fontFamily: "var(--nv-font-body)",
      }}>
        BÚSQUEDA POR SITUACIÓN
      </h1>

      {/* 2x2 GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
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
              gap: 12,
              aspectRatio: "1",
              background: "#162019",
              border: "0.5px solid rgba(125,186,143,0.15)",
              borderRadius: 14,
              textDecoration: "none",
              padding: "16px 10px",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            <span style={{ fontSize: 32, lineHeight: 1 }}>{cat.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#e8e2d4",
              textAlign: "center",
              letterSpacing: 0.8,
              fontFamily: "var(--nv-font-body)",
              lineHeight: 1.3,
            }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* DROPDOWNS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            color: "#6a7a65",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 6,
            fontFamily: "var(--nv-font-body)",
          }}>
            MODALIDAD
          </label>
          <select
            name="modalidad"
            style={{
              width: "100%",
              padding: "13px 14px",
              background: "#162019",
              border: "0.5px solid #243329",
              borderRadius: 10,
              color: "#e8e2d4",
              fontSize: 13,
              fontFamily: "var(--nv-font-body)",
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

        <div>
          <label style={{
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            color: "#6a7a65",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 6,
            fontFamily: "var(--nv-font-body)",
          }}>
            REGIÓN
          </label>
          <select
            name="provincia"
            style={{
              width: "100%",
              padding: "13px 14px",
              background: "#162019",
              border: "0.5px solid #243329",
              borderRadius: 10,
              color: "#e8e2d4",
              fontSize: 13,
              fontFamily: "var(--nv-font-body)",
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
      </div>

      {/* FORM wrapper para submit */}
      <form action="/buscar" method="GET" style={{ marginTop: "auto" }}>
        {/* Hidden q for free text */}
        <input type="hidden" name="q" value="" />

        <button
          type="submit"
          onClick={(e) => {
            const form = (e.target as HTMLButtonElement).closest("form") as HTMLFormElement;
            const modalidad = form.querySelector<HTMLSelectElement>("[name='modalidad']");
            const provincia = form.querySelector<HTMLSelectElement>("[name='provincia']");
            if (modalidad && !modalidad.value) modalidad.removeAttribute("name");
            if (provincia && !provincia.value) provincia.removeAttribute("name");
          }}
          style={{
            width: "100%",
            padding: "15px 0",
            background: "#7dba8f",
            border: "none",
            borderRadius: 12,
            color: "#0c1810",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "var(--nv-font-body)",
            letterSpacing: 0.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 0.2s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          BUSCAR COUNSELORS
        </button>
      </form>
    </div>
  );
}
