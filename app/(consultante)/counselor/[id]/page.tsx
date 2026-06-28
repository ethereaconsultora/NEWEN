import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Stars from "@/components/ui/Stars";
import DolarBadge from "@/components/ui/DolarBadge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CounselorPerfilPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("counselors")
    .select(
      `
      id,
      bio,
      enfoque,
      especialidades,
      modalidad,
      provincia,
      experiencia_anios,
      aac_verificado,
      promedio_estrellas,
      total_sesiones,
      users!inner(nombre)
    `
    )
    .eq("id", id)
    .eq("estado", "activo")
    .single();

  if (error || !data) {
    notFound();
  }

  const counselor = data as Record<string, unknown>;
  const user = counselor.users as { nombre: string } | null;
  const nombre = user?.nombre ?? "Sin nombre";
  const especialidades = (counselor.especialidades as string[]) ?? [];
  const iniciales = nombre
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        padding: "24px 16px 80px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <Link
        href="/buscar"
        style={{
          fontSize: 13,
          color: "var(--nv-accent)",
          textDecoration: "none",
          fontWeight: 500,
          display: "inline-block",
          marginBottom: 24,
        }}
      >
        ← Buscar
      </Link>

      {/* Perfil */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        {/* Avatar + nombre */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--nv-verde-oo)",
              border: "2px solid var(--nv-verde-o)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 600,
              color: "var(--nv-accent)",
              fontFamily: "var(--nv-font-display)",
              flexShrink: 0,
            }}
          >
            {iniciales}
          </div>

          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 400,
                fontFamily: "var(--nv-font-display)",
                color: "var(--nv-text-primary)",
                marginBottom: 4,
              }}
            >
              {nombre}
            </h1>
            <Stars rating={counselor.promedio_estrellas as number} size="md" />
            {counselor.aac_verificado && (
              <span className="badge" style={{ marginTop: 6 }}>
                AAC Verificado
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
            fontSize: 13,
            color: "var(--nv-text-secondary)",
          }}
        >
          {counselor.provincia && <span>📍 {(counselor.provincia as string)}</span>}
          {counselor.experiencia_anios && (
            <span>📅 {(counselor.experiencia_anios as number)} años de experiencia</span>
          )}
          <span>🎯 {(counselor.total_sesiones as number) || 0} sesiones</span>
          <span>
            {counselor.modalidad === "online"
              ? "💻 Online"
              : counselor.modalidad === "presencial"
              ? "🏠 Presencial"
              : "💻🏠 Online y Presencial"}
          </span>
        </div>

        <hr className="separator" />

        {/* Enfoque */}
        {counselor.enfoque && (
          <div style={{ marginTop: 16 }}>
            <h2
              style={{
                fontSize: 13,
                fontFamily: "var(--nv-font-display)",
                color: "var(--nv-text-primary)",
                marginBottom: 6,
              }}
            >
              Enfoque
            </h2>
            <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", lineHeight: 1.6 }}>
              {counselor.enfoque as string}
            </p>
          </div>
        )}

        {/* Bio */}
        {counselor.bio && (
          <div style={{ marginTop: 20 }}>
            <h2
              style={{
                fontSize: 13,
                fontFamily: "var(--nv-font-display)",
                color: "var(--nv-text-primary)",
                marginBottom: 6,
              }}
            >
              Sobre mí
            </h2>
            <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {counselor.bio as string}
            </p>
          </div>
        )}

        {/* Especialidades */}
        {especialidades.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h2
              style={{
                fontSize: 13,
                fontFamily: "var(--nv-font-display)",
                color: "var(--nv-text-primary)",
                marginBottom: 10,
              }}
            >
              Especialidades
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {especialidades.map((tag: string) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    padding: "5px 12px",
                    borderRadius: "var(--nv-radius-full)",
                    border: "0.5px solid var(--nv-border)",
                    color: "var(--nv-text-secondary)",
                    background: "var(--nv-bg-overlay)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Precio + CTA */}
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <p
          style={{
            fontSize: 12,
            color: "var(--nv-text-muted)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Sesión individual
        </p>
        <div style={{ marginBottom: 16 }}>
          <DolarBadge usd={18} size="md" />
        </div>

        <Link
          href={`/reservar/${id}`}
          className="btn-primary"
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            textDecoration: "none",
            padding: "14px 0",
            fontSize: 15,
          }}
        >
          Reservar sesión
        </Link>

        <p
          style={{
            fontSize: 11,
            color: "var(--nv-text-muted)",
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          Todos los counselors cobran lo mismo.<br />
          $18 USD por sesión de 50 minutos.
        </p>
      </div>
    </div>
  );
}
