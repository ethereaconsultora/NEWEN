import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../../pages.module.css";
import CambiarEstadoButton from "./CambiarEstadoButton";

export default async function TurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const { data: turno } = await supabase
    .from("turnos")
    .select("*,pacientes(id,nombre)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!turno) notFound();

  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  return (
    <div>
      <div className={styles.pageHead} style={{ marginBottom: 12 }}>
        <Link href="/panel/consultorio/agenda" className="btn-ghost" style={{ display: "inline-flex" }}>
          ← Volver
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--nv-font-display)", fontSize: 28, color: "var(--nv-accent)", marginBottom: 4 }}>
          {turno.hora?.slice(0, 5)}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{turno.pacientes?.nombre ?? turno.patient_name ?? "—"}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {turno.modalidad && <span className={styles.badgeOk}>{cap(turno.modalidad)}</span>}
          <span className={styles.badgeMuted}>{turno.estado}</span>
          {turno.fecha && (
            <span style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>
              {new Date(turno.fecha + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {turno.notas && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className={styles.fieldLabel}>Notas</div>
          <p style={{ whiteSpace: "pre-wrap", fontSize: 13.5 }}>{turno.notas}</p>
        </div>
      )}

      <CambiarEstadoButton turnoId={id} estadoActual={turno.estado} />

      {turno.pacientes?.id && (
        <div style={{ marginTop: 12 }}>
          <Link
            href={`/panel/consultorio/pacientes/${turno.pacientes.id}`}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", display: "inline-flex" }}
          >
            Ver ficha del paciente
          </Link>
        </div>
      )}
    </div>
  );
}
