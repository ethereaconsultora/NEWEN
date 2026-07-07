import Link from "next/link";
import Stars from "@/components/ui/Stars";

interface Props {
  id: string; nombre: string; especialidades: string[];
  modalidad: string | null; provincia: string | null; ciudad: string | null;
  promedio_estrellas: number; total_sesiones: number;
  aac_verificado: boolean; foto_url: string | null;
}

export default function CounselorCard({ id, nombre, especialidades, modalidad, provincia, ciudad, promedio_estrellas, total_sesiones, aac_verificado, foto_url }: Props) {
  const iniciales = nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const tags = especialidades.slice(0, 3);
  const ocultarStats = total_sesiones < 10;

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      border: "1px solid rgba(0,0,0,0.04)",
      display: "flex",
      gap: 16,
      position: "relative",
    }}>
      {/* AGENDA ABIERTA */}
      <span style={{
        position: "absolute", top: 14, right: 14,
        fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
        color: "var(--nv-accent)", textTransform: "uppercase",
        background: "rgba(27,67,50,0.08)", padding: "3px 8px", borderRadius: 999,
      }}>AGENDA ABIERTA</span>

      {/* Foto grande */}
      <div style={{
        width: 100, height: 100, minWidth: 100, borderRadius: 14,
        background: foto_url ? `url(${foto_url}) center/cover` : "linear-gradient(145deg, #c8dccf 0%, #a8c9b0 40%, #8db89a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 30, fontWeight: 700,
        color: foto_url ? "transparent" : "#fff",
        fontFamily: "var(--nv-font-display)",
        textShadow: foto_url ? "none" : "0 1px 3px rgba(0,0,0,0.12)",
        border: foto_url ? "none" : "2px solid var(--nv-accent-border)",
      }}>
        {!foto_url && iniciales}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, paddingTop: 2 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--nv-text-primary)", margin: 0, lineHeight: 1.2, paddingRight: 90 }}>
          Clr. {nombre}
        </h3>

        <Stars rating={ocultarStats ? 0 : promedio_estrellas} size="sm" showNumber={!ocultarStats} />

        <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {[ciudad, provincia].filter(Boolean).join(", ")}
          {![ciudad, provincia].filter(Boolean).length && "Argentina"}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
          {tags.map(t => (
            <span key={t} style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, padding: "3px 10px", borderRadius: 999, color: "var(--nv-text-secondary)", background: "rgba(0,0,0,0.04)", textTransform: "uppercase" }}>{t}</span>
          ))}
          {especialidades.length > 3 && (
            <span style={{ fontSize: 10, padding: "3px 6px", color: "var(--nv-text-muted)" }}>+{especialidades.length - 3}</span>
          )}
        </div>

        <Link href={`/counselor/${id}`} style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginTop: 10, padding: "8px 0", fontSize: 12, fontWeight: 700, letterSpacing: 1,
          background: "var(--nv-accent)", color: "#FFFFFF", border: "none",
          borderRadius: 10, textDecoration: "none", textTransform: "uppercase",
          boxShadow: "0 2px 12px rgba(27,67,50,0.28)", transition: "all 0.2s", width: "100%",
        }}>VER PERFIL</Link>
      </div>
    </div>
  );
}
