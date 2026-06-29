import Link from "next/link";
import Stars from "@/components/ui/Stars";

interface Props {
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

export default function CounselorCard({ id, nombre, especialidades, modalidad, provincia, promedio_estrellas, total_sesiones, aac_verificado }: Props) {
  const iniciales = nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const tags = especialidades.slice(0, 3);

  return (
    <Link href={`/counselor/${id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div style={{
        display: "flex", gap: 14, alignItems: "flex-start",
        padding: "18px 20px", background: "var(--nv-bg-card)",
        border: "1px solid var(--nv-border)", borderRadius: "var(--nv-radius-lg)",
        transition: "border-color 0.2s",
      }}>
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--nv-verde-oo)", border: "1.5px solid var(--nv-verde-o)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 600, color: "var(--nv-accent)",
          fontFamily: "var(--nv-font-display)", flexShrink: 0,
        }}>
          {iniciales}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--nv-text-primary)" }}>Clr. {nombre}</span>
            {aac_verificado && (
              <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 999, border: "0.5px solid var(--nv-verde-o)", color: "var(--nv-accent)", background: "var(--nv-verde-oo)", fontWeight: 600, letterSpacing: "0.04em" }}>AAC</span>
            )}
          </div>

          <Stars rating={promedio_estrellas} size="sm" />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
            {tags.map(t => <span key={t} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, border: "0.5px solid var(--nv-border)", color: "var(--nv-text-secondary)" }}>{t}</span>)}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--nv-text-muted)" }}>
              {provincia && <span>📍 {provincia}</span>}
              {modalidad && modalidad !== "ambas" && <span>{modalidad === "online" ? "💻 Online" : "🏠 Presencial"}</span>}
              {modalidad === "ambas" && <span>💻🏠 Online y presencial</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--nv-accent)" }}>Ver perfil →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
