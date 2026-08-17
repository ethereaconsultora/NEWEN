"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../pages.module.css";

type Persona = { id: string; nombre: string; telefono?: string | null; email?: string | null };

export default function NuevoTurnoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState<"paciente" | "consultante">("paciente");
  const [pacientes, setPacientes] = useState<Persona[]>([]);
  const [consultantes, setConsultantes] = useState<Persona[]>([]);

  useEffect(() => {
    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: pacs } = await supabase
        .from("pacientes")
        .select("id,nombre,telefono")
        .is("deleted_at", null)
        .order("nombre");
      if (pacs) setPacientes(pacs);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: sess } = await supabase
          .from("sesiones")
          .select("consultante_id, consultante:consultante_id(nombre, email)")
          .eq("counselor_id", user.id)
          .in("estado", ["confirmada", "en_curso", "finalizada"]);
        if (sess) {
          const mapa = new Map<string, Persona>();
          sess.forEach((s: any) => {
            const c = s.consultante as { nombre: string; email: string } | null;
            if (c && s.consultante_id) {
              mapa.set(s.consultante_id, { id: s.consultante_id, nombre: c.nombre, email: c.email });
            }
          });
          setConsultantes(Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre)));
        }
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, any> = { estado: "confirmado" };
    fd.forEach((v, k) => {
      if (v) payload[k] = v;
    });

    if (tipo === "paciente") {
      delete payload.consultante_id;
      const paciente = pacientes.find((p) => p.id === payload.paciente_id);
      if (paciente) {
        payload.patient_name = paciente.nombre;
        payload.patient_phone = paciente.telefono ?? null;
      }
    } else {
      delete payload.paciente_id;
      const consultante = consultantes.find((c) => c.id === payload.consultante_id);
      if (consultante) {
        payload.patient_name = consultante.nombre;
        payload.patient_phone = null;
      }
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: err } = await supabase.from("turnos").insert(payload);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/panel/consultorio/agenda`);
    router.refresh();
  }

  const hoy = new Date().toISOString().split("T")[0];

  const toggleStyle = (activo: boolean) => ({
    flex: 1,
    padding: "9px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: activo ? 700 : 500,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--nv-font-body)",
    background: activo ? "var(--nv-accent)" : "transparent",
    color: activo ? "#fff" : "var(--nv-text-muted)",
    transition: "all .15s",
  });

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Nuevo turno</h1>
        </div>
        <Link href="/panel/consultorio/agenda" className="btn-ghost" style={{ display: "inline-flex" }}>
          Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>
        {/* Dualidad: paciente (clínico) o consultante (plataforma) */}
        <div style={{ display: "flex", background: "var(--nv-bg-input)", borderRadius: 999, padding: 3, gap: 3, border: "1px solid var(--nv-border)" }}>
          <button type="button" style={toggleStyle(tipo === "paciente")} onClick={() => setTipo("paciente")}>
            Paciente
          </button>
          <button type="button" style={toggleStyle(tipo === "consultante")} onClick={() => setTipo("consultante")}>
            Consultante
          </button>
        </div>

        {tipo === "paciente" ? (
          <div>
            <label className="label">Paciente *</label>
            <select name="paciente_id" className="input" required defaultValue="">
              <option value="">Seleccioná un paciente</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="label">Consultante *</label>
            <select name="consultante_id" className="input" required defaultValue="">
              <option value="">Seleccioná un consultante</option>
              {consultantes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {consultantes.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginTop: 6 }}>
                Todavía no tenés consultantes con sesiones en newen.
              </p>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Fecha *</label>
            <input name="fecha" className="input" type="date" defaultValue={hoy} required />
          </div>
          <div>
            <label className="label">Hora *</label>
            <input name="hora" className="input" type="time" required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Modalidad</label>
            <select name="modalidad" className="input" defaultValue="">
              <option value="">Sin definir</option>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
          <div>
            <label className="label">Duración (minutos)</label>
            <input name="duracion" className="input" type="number" defaultValue="50" min="15" max="240" step="5" />
          </div>
        </div>

        <div>
          <label className="label">Notas</label>
          <textarea name="notas" className="input" rows={3} placeholder="Información adicional…" />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando…" : `Agendar ${tipo === "paciente" ? "paciente" : "consultante"}`}
        </button>
      </form>
    </div>
  );
}
