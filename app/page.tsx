import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 24,
      }}
    >
      {/* ── Logo Newen ── */}
      <div
        style={{
          fontSize: 14,
          letterSpacing: 4,
          color: "var(--nv-accent)",
          textTransform: "uppercase",
          fontFamily: "var(--nv-font-body)",
          marginBottom: 4,
        }}
      >
        Newen
      </div>

      {/* ── Pregunta guía ── */}
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 400,
            fontFamily: "var(--nv-font-display)",
            color: "var(--nv-text-primary)",
            lineHeight: 1.15,
            marginBottom: 12,
            letterSpacing: -0.5,
          }}
        >
          ¿Qué te está<br />pasando?
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--nv-text-secondary)",
            maxWidth: 300,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Explorá perfiles, elegí un counselor, reservá tu espacio. Sin registro previo.
        </p>
      </div>

      {/* ── Chips de búsqueda rápida ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          maxWidth: 380,
        }}
      >
        {[
          "Ansiedad",
          "Duelo",
          "Pareja",
          "Trabajo",
          "Familia",
          "Crisis",
          "Crecimiento personal",
          "Soledad",
        ].map((tag) => (
          <Link
            key={tag}
            href={`/buscar?q=${encodeURIComponent(tag)}`}
            style={{
              fontSize: 13,
              padding: "8px 16px",
              cursor: "pointer",
              border: "1px solid var(--nv-border)",
              background: "var(--nv-bg-card)",
              color: "var(--nv-text-primary)",
              borderRadius: "var(--nv-radius-full)",
              fontFamily: "var(--nv-font-body)",
              textDecoration: "none",
              display: "inline-block",
              transition: "all 0.15s",
            }}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* ── Buscador libre ── */}
      <form
        action="/buscar"
        method="GET"
        style={{ width: "100%", maxWidth: 360, marginTop: 4 }}
      >
        <div style={{ position: "relative" }}>
          <input
            name="q"
            className="input"
            type="text"
            placeholder='Escribí cómo te sentís, ej: "estoy atravesando un duelo"...'
            style={{
              paddingRight: 48,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              position: "absolute",
              right: 4,
              top: 4,
              bottom: 4,
              padding: "0 16px",
              fontSize: 13,
              borderRadius: "var(--nv-radius-sm)",
            }}
          >
            Buscar
          </button>
        </div>
      </form>

      {/* ── Footer ── */}
      <div
        style={{
          textAlign: "center",
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <p style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>
          🌿 Newen · Lo que sentís, puede ser acompañado
        </p>

        {user ? (
          <Link
            href="/mi-cuenta"
            style={{
              fontSize: 13,
              color: "var(--nv-accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Mi cuenta →
          </Link>
        ) : (
          <Link
            href="/auth/login"
            style={{
              fontSize: 13,
              color: "var(--nv-accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Ingresar →
          </Link>
        )}
      </div>
    </main>
  );
}
