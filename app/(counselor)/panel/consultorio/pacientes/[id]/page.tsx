import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../../pages.module.css";
import PacienteTabSection from "./PacienteTabSection";

export default async function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const [{ data: paciente }, { data: historial }] = await Promise.all([
    supabase
      .from("pacientes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("entradas")
      .select("*")
      .eq("paciente_id", id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!paciente) notFound();

  const phone = paciente.telefono?.replace(/\D/g, "");
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  return (
    <div>
      <div className={styles.pageHead} style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href="/panel/consultorio/pacientes"
            style={{ fontSize: 12, color: "var(--nv-text-muted)", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 6 }}
          >
            ← Pacientes
          </Link>
          <h1 className={styles.pageTitle}>{paciente.nombre}</h1>
          <div style={{ fontSize: 12.5, color: "var(--nv-text-secondary)", marginTop: 4 }}>
            {paciente.modalidad && <span>{cap(paciente.modalidad)}</span>}
            {paciente.modalidad && paciente.email && <span> · </span>}
            {paciente.email && <span>{paciente.email}</span>}
            {paciente.telefono && <span>{paciente.email ? " · " : ""}{paciente.telefono}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          <Link href={`/panel/consultorio/pacientes/${id}/editar`} className="btn-secondary" style={{ display: "inline-flex" }}>
            Editar
          </Link>
          {phone && (
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${paciente.nombre} 👋`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ display: "inline-flex" }}
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div className={styles.fieldLabel}>DNI</div>
          <div style={{ fontWeight: 600 }}>{paciente.dni ?? "—"}</div>
        </div>
        <div className="card">
          <div className={styles.fieldLabel}>Sesiones</div>
          <div style={{ fontWeight: 600 }}>{historial?.length ?? 0}</div>
        </div>
        <div className="card">
          <div className={styles.fieldLabel}>Estado</div>
          <div style={{ fontWeight: 600 }}>{paciente.estado_animo ?? "Estable"}</div>
        </div>
      </div>

      {(paciente.motivo_consulta || paciente.notas_iniciales) && (
        <div className="card" style={{ marginBottom: 16 }}>
          {paciente.motivo_consulta && (
            <div style={{ marginBottom: paciente.notas_iniciales ? 12 : 0 }}>
              <div className={styles.fieldLabel}>Motivo de consulta</div>
              <p style={{ whiteSpace: "pre-wrap" }}>{paciente.motivo_consulta}</p>
            </div>
          )}
          {paciente.notas_iniciales && (
            <div>
              <div className={styles.fieldLabel}>Notas iniciales</div>
              <p style={{ whiteSpace: "pre-wrap" }}>{paciente.notas_iniciales}</p>
            </div>
          )}
        </div>
      )}

      <PacienteTabSection
        pacienteId={id}
        estadoActual={paciente.estado_animo ?? "Estable"}
        historial={historial ?? []}
      />
    </div>
  );
}
