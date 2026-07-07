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
      ciudad,
      experiencia_anios,
      aac_verificado,
      promedio_estrellas,
      total_sesiones,
      foto_url,
      users!inner(nombre)
    `
    )
    .eq("id", id)
    .eq("estado", "activo")
    .single();

  if (error || !data) {
    notFound();
  }

  const counselor = data as {
    id: string;
    bio: string | null;
    enfoque: string | null;
    especialidades: string[] | null;
    modalidad: string | null;
    provincia: string | null;
    ciudad: string | null;
    experiencia_anios: number | null;
    aac_verificado: boolean;
    promedio_estrellas: number;
    total_sesiones: number;
    foto_url: string | null;
    users: { nombre: string }[] | null;
  };
  const userData = counselor.users?.[0];
  const nombre = userData?.nombre ?? "Sin nombre";
  const especialidades = counselor.especialidades ?? [];
  const ocultarStats = counselor.total_sesiones < 10;
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
          fontSize: 12,
          fontWeight: 700,
          color: "var(--nv-accent)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(27,67,50,0.08)",
          border: "1.5px solid rgba(27,67,50,0.2)",
          padding: "8px 16px",
          borderRadius: 8,
          marginBottom: 24,
          letterSpacing: "0.06em",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ATRÁS
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
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: counselor.foto_url ? `url(${counselor.foto_url}) center/cover` : "linear-gradient(145deg, #c8dccf 0%, #a8c9b0 40%, #8db89a 100%)",
              border: counselor.foto_url ? "3px solid var(--nv-accent-border)" : "2px solid var(--nv-verde-o)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 600,
              color: counselor.foto_url ? "transparent" : "#fff",
              fontFamily: "var(--nv-font-display)",
              flexShrink: 0,
            }}
          >
            {!counselor.foto_url && iniciales}
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
            <Stars rating={ocultarStats ? 0 : counselor.promedio_estrellas} size="md" showNumber={!ocultarStats} />
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
          {counselor.ciudad && <span>📍 {[counselor.ciudad, counselor.provincia].filter(Boolean).join(", ")}</span>}
          {!counselor.ciudad && counselor.provincia && <span>📍 {counselor.provincia}</span>}
          {counselor.experiencia_anios && (
            <span>📅 {counselor.experiencia_anios} años de experiencia</span>
          )}
          <span>🎯 {ocultarStats ? "—" : counselor.total_sesiones} sesiones</span>
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
              {counselor.enfoque}
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
              {counselor.bio}
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
              {especialidades.map((tag) => (
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
