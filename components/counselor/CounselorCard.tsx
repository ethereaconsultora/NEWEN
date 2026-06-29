import Link from "next/link";
import Stars from "@/components/ui/Stars";

interface Props {
  id: string; nombre: string; especialidades: string[];
  modalidad: string | null; provincia: string | null;
  promedio_estrellas: number; total_sesiones: number; aac_verificado: boolean;
}

export default function CounselorCard({ id, nombre, especialidades, modalidad, provincia, promedio_estrellas, aac_verificado }: Props) {
  const iniciales = nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const tags = especialidades.slice(0, 4);

  return (
    <Link href={`/counselor/${id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div style={{
        display: "flex", gap: 14,
        background: "var(--nv-bg-card)", border: "1px solid var(--nv-border)",
        borderRadius: "var(--nv-radius-lg)", padding: "18px 18px",
        transition: "border-color 0.2s",
      }}>
        {/* Photo placeholder */}
        <div style={{
          width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, var(--nv-verde-o) 0%, var(--nv-verde-oo) 100%)",
          border: "2px solid var(--nv-accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700, color: "var(--nv-accent)",
          fontFamily: "var(--nv-font-display)",
          boxShadow: "0 0 20px rgba(125,186,143,0.12)",
        }}>
          {iniciales}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--nv-text-primary)", margin: "0 0 2px" }}>
            Clr. {nombre}
          </h3>
          <Stars rating={promedio_estrellas} size="sm" />
          <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: "4px 0 8px" }}>
            {[provincia, "Argentina"].filter(Boolean).join(", ")}
            {modalidad && modalidad !== "ambas" ? ` · ${modalidad === "online" ? "Online" : "Presencial"}` : ""}
            {modalidad === "ambas" ? " · Online y presencial" : ""}
          </p>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {tags.map(t => (
              <span key={t} style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 999,
                border: "0.5px solid var(--nv-border)", color: "var(--nv-text-secondary)",
                background: "var(--nv-bg-overlay)", fontWeight: 500,
              }}>{t}</span>
            ))}
            {especialidades.length > 4 && (
              <span style={{ fontSize: 10, padding: "3px 8px", color: "var(--nv-text-muted)" }}>+{especialidades.length - 4}</span>
            )}
          </div>

          {/* CTA */}
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--nv-accent)" }}>Ver perfil →</span>
        </div>
      </div>
    </Link>
  );
}
