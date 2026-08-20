import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTipografia, getTamano } from "@/lib/consultorio-apariencia";
import OjoVistaEmpresa from "@/components/empresa/OjoVistaEmpresa";

export const dynamic = "force-dynamic";

const BONE = "#f4efe6";

export default async function EspacioPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .eq("estado", "activa")
    .maybeSingle();

  if (!org) notFound();

  const primary = org.primary_color || "#0a0806";
  const accent = org.accent_color || "#c4a87e";
  const servicios: string[] = org.servicios ?? [];
  const font = getTipografia(org.font_id);
  const tamano = getTamano(org.font_size);
  const coverGradient =
    org.cover_gradient ||
    `linear-gradient(135deg, ${primary} 0%, #1a1710 60%, ${accent}22 130%)`;

  return (
    <div
      style={{
        background: primary,
        color: "#f2ede4",
        minHeight: "100vh",
        fontFamily: font.fb,
        fontWeight: 300,
        lineHeight: 1.7,
        zoom: tamano.zoom,
      }}
    >
      {font.gFont && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${font.gFont}&display=swap`}
        />
      )}

      {/* Barra newen */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "8px 24px",
          fontSize: 11,
          color: "#9e9382",
          textAlign: "center",
        }}
      >
        Espacio comercial gestionado en <strong style={{ color: accent }}>newen</strong>
      </div>

      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
          ) : (
            <div
              style={{
                width: 34,
                height: 34,
                border: `1px solid ${accent}`,
                color: accent,
                display: "grid",
                placeItems: "center",
                fontFamily: font.fh,
                fontSize: 15,
              }}
            >
              {(org.nombre ?? "E").charAt(0)}
            </div>
          )}
          <span style={{ fontFamily: font.fh, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            {org.nombre}
          </span>
        </div>
        <span
          style={{
            background: accent,
            color: primary,
            padding: "9px 20px",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Agendar diagnóstico
        </span>
      </nav>

      {/* Cover */}
      {org.cover_url ? (
        <img src={org.cover_url} alt="" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ height: 140, background: coverGradient }} />
      )}

      {/* Identidad */}
      <header style={{ background: BONE, color: "#241d12", padding: "12px 32px 40px" }}>
        <div
          style={{
            width: 88,
            height: 88,
            marginTop: -46,
            background: accent,
            color: "#241d12",
            border: `4px solid ${BONE}`,
            display: "grid",
            placeItems: "center",
            fontFamily: font.fh,
            fontSize: 34,
            overflow: "hidden",
          }}
        >
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.nombre} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            (org.nombre ?? "E").charAt(0)
          )}
        </div>
        <h1 style={{ fontFamily: font.fh, fontSize: "clamp(30px,4vw,46px)", fontWeight: 400, lineHeight: 1.05, marginTop: 14 }}>
          {org.nombre}
        </h1>
        {org.slogan && (
          <p style={{ fontFamily: font.fb, fontSize: 15, fontStyle: "italic", color: "#6b5f4a", marginTop: 8, maxWidth: 620 }}>
            {org.slogan}
          </p>
        )}
        {org.tagline && (
          <p style={{ fontSize: 13, letterSpacing: "0.08em", color: "#6b5f4a", textTransform: "uppercase", marginTop: 6 }}>
            {org.tagline}
          </p>
        )}
        <p style={{ fontSize: 12, color: "#8a7d66", marginTop: 8 }}>
          {[org.sede, org.email].filter(Boolean).join(" · ")}
        </p>
      </header>

      {/* Servicios */}
      <section style={{ padding: "56px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: "#9e9382", marginBottom: 12 }}>
          Capacidades que desarrolla
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {servicios.length ? (
            servicios.map((s) => (
              <span key={s} style={{ fontSize: 12, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.15)", color: "#f2ede4" }}>
                {s}
              </span>
            ))
          ) : (
            <span style={{ color: "#9e9382", fontSize: 13 }}>Información en preparación.</span>
          )}
        </div>
      </section>

      {/* Contacto */}
      <section style={{ padding: "56px 32px" }}>
        <div style={{ fontFamily: font.fh, fontSize: 30, fontWeight: 300, marginBottom: 20 }}>
          Hablemos de tu <em style={{ color: accent }}>organización</em>
        </div>
        <div style={{ fontSize: 13, color: "#b8ae9c" }}>
          <div style={{ padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <strong style={{ color: accent, fontWeight: 400 }}>Contacto</strong> {org.contacto ?? "—"}
          </div>
          <div style={{ padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <strong style={{ color: accent, fontWeight: 400 }}>Email</strong> {org.email ?? "—"}
          </div>
          <div style={{ padding: "13px 0" }}>
            <strong style={{ color: accent, fontWeight: 400 }}>Teléfono</strong> {org.telefono ?? "—"}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "28px 32px", fontSize: 11, color: "#9e9382" }}>
        Espacio de <strong style={{ color: accent }}>{org.nombre}</strong> gestionado en newen · Etherea
      </footer>

      {/* Ojo de vista clientes: solo lo ve el dueño/miembro para volver a /empresa */}
      <OjoVistaEmpresa slug={org.slug} />
    </div>
  );
}
