import Link from "next/link";
import Stars from "@/components/ui/Stars";

interface CounselorCardProps {
  id: string;
  nombre: string;
  bio: string | null;
  enfoque: string | null;
  especialidades: string[];
  modalidad: string | null;
  provincia: string | null;
  promedio_estrellas: number;
  total_sesiones: number;
  aac_verificado: boolean;
}

/**
 * Card de counselor para el listado público.
 * Compacta, informativa, con acentos de la paleta Newen.
 */
export default function CounselorCard({
  id,
  nombre,
  bio,
  enfoque,
  especialidades,
  modalidad,
  provincia,
  promedio_estrellas,
  total_sesiones,
  aac_verificado,
}: CounselorCardProps) {
  // Solo mostrar primeras 3 especialidades
  const tags = especialidades.slice(0, 3);

  // Iniciales para el avatar
  const iniciales = nombre
    ? nombre
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <Link
      href={`/counselor/${id}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        className="card"
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          transition: "border-color 0.15s",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--nv-verde-oo)",
            border: "1.5px solid var(--nv-verde-o)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 600,
            color: "var(--nv-accent)",
            fontFamily: "var(--nv-font-display)",
            flexShrink: 0,
          }}
        >
          {iniciales}
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--nv-text-primary)",
              }}
            >
              {nombre}
            </span>
            {aac_verificado && (
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: "var(--nv-radius-full)",
                  border: "0.5px solid var(--nv-verde-o)",
                  color: "var(--nv-accent)",
                  background: "var(--nv-verde-oo)",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                AAC
              </span>
            )}
          </div>

          <Stars rating={promedio_estrellas} size="sm" />

          {/* Especialidades */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginTop: 8,
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: "var(--nv-radius-full)",
                  border: "0.5px solid var(--nv-border)",
                  color: "var(--nv-text-secondary)",
                  background: "transparent",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta info */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 10,
              fontSize: 11,
              color: "var(--nv-text-muted)",
            }}
          >
            {provincia && <span>{provincia}</span>}
            {modalidad && modalidad !== "ambas" && (
              <span>{modalidad === "online" ? "Online" : "Presencial"}</span>
            )}
            {modalidad === "ambas" && <span>Online · Presencial</span>}
            {total_sesiones > 0 && <span>{total_sesiones} sesiones</span>}
          </div>

          {/* Bio preview */}
          {bio && (
            <p
              style={{
                fontSize: 12,
                color: "var(--nv-text-secondary)",
                marginTop: 8,
                lineHeight: 1.5,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
