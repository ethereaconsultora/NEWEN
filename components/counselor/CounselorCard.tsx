import Link from "next/link";
import Stars from "@/components/ui/Stars";

interface Props {
  id: string; nombre: string; especialidades: string[];
  modalidad: string | null; provincia: string | null;
  promedio_estrellas: number; total_sesiones: number; aac_verificado: boolean;
}

export default function CounselorCard({ id, nombre, especialidades, modalidad, provincia, promedio_estrellas, aac_verificado }: Props) {
  const iniciales = nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const tags = especialidades.slice(0, 3);

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      border: "1px solid rgba(0,0,0,0.04)",
      display: "flex",
      gap: 14,
      position: "relative",
    }}>
      {/* AGENDA ABIERTA badge */}
      <span style={{
        position: "absolute", top: 14, right: 14,
        fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
        color: "var(--nv-accent)", textTransform: "uppercase",
        background: "rgba(125,186,143,0.10)",
        padding: "3px 8px", borderRadius: 999,
      }}>
        AGENDA ABIERTA
      </span>

      {/* Square photo — frosted gradient + initials */}
      <div style={{
        width: 80, height: 80, minWidth: 80, borderRadius: 14,
        background: "linear-gradient(145deg, #c8dccf 0%, #a8c9b0 40%, #8db89a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, fontWeight: 700, color: "#fff",
        fontFamily: "var(--nv-font-display)",
        textShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}>
        {iniciales}
      </div>

      {/* Info column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, paddingTop: 2 }}>
        {/* Name */}
        <h3 style={{
          fontSize: 15, fontWeight: 600, color: "var(--nv-text-primary)",
          margin: 0, fontFamily: "var(--nv-font-body)", lineHeight: 1.2,
          paddingRight: 90,
        }}>
          Clr. {nombre}
        </h3>

        {/* Stars */}
        <Stars rating={promedio_estrellas} size="sm" />

        {/* Location */}
        <p style={{
          fontSize: 11, color: "var(--nv-text-muted)", margin: 0,
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {[provincia, "Argentina"].filter(Boolean).join(", ")}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
          {tags.map(t => (
            <span key={t} style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
              padding: "3px 10px", borderRadius: 999,
              color: "var(--nv-text-secondary)",
              background: "rgba(0,0,0,0.04)",
              textTransform: "uppercase",
            }}>{t}</span>
          ))}
          {especialidades.length > 3 && (
            <span style={{ fontSize: 10, padding: "3px 6px", color: "var(--nv-text-muted)", letterSpacing: 0.5 }}>+{especialidades.length - 3}</span>
          )}
        </div>

        {/* VER PERFIL button */}
        <Link
          href={`/counselor/${id}`}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginTop: 10,
            padding: "8px 0",
            fontSize: 12, fontWeight: 700, letterSpacing: 1,
            background: "#6aa87c",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 10,
            textDecoration: "none",
            textTransform: "uppercase",
            boxShadow: "0 2px 12px rgba(106,168,124,0.28)",
            transition: "all 0.2s",
            width: "100%",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#5c9a6e";
            e.currentTarget.style.boxShadow = "0 4px 18px rgba(106,168,124,0.38)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#6aa87c";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(106,168,124,0.28)";
          }}
        >
          VER PERFIL
        </Link>
      </div>
    </div>
  );
}
